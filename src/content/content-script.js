// Content script for WhatsApp Web injection
// Injects sidebar and handles clipboard operations

// Initialize IndexedDB
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DealerCopilotDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Listings store
      if (!db.objectStoreNames.contains('listings')) {
        const store = db.createObjectStore('listings', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Post history store
      if (!db.objectStoreNames.contains('postHistory')) {
        const store = db.createObjectStore('postHistory', { keyPath: 'id', autoIncrement: true });
        store.createIndex('groupName', 'groupName', { unique: false });
        store.createIndex('listingId', 'listingId', { unique: false });
      }
      
      // Groups store
      if (!db.objectStoreNames.contains('groups')) {
        const store = db.createObjectStore('groups', { keyPath: 'name' });
        store.createIndex('lastPosted', 'lastPosted', { unique: false });
      }
    };
  });
}

// Save data to IndexedDB
async function saveToIndexedDB(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({ ...data, timestamp: Date.now() });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// MAIN INJECTION
let sidebarInjected = false;

async function init() {
  await waitForWhatsAppLoad();
  injectSidebar();
  setupMessageBridge();
  setupSendDetection();
}

// Wait for WhatsApp to fully load
async function waitForWhatsAppLoad() {
  return new Promise((resolve) => {
    const checkLoaded = () => {
      const mainPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
      if (mainPanel) {
        resolve();
      } else {
        setTimeout(checkLoaded, 500);
      }
    };
    checkLoaded();
  });
}

// Inject sidebar React app
function injectSidebar() {
  if (sidebarInjected) return;
  
  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'dealer-copilot-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 380px;
    height: 100vh;
    z-index: 999999;
    background: #1a1a1a;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0,0,0,0.3);
    overflow: hidden;
  `;
  
  document.body.appendChild(sidebar);
  
  // Create iframe for React app
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('sidebar.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;
  
  sidebar.appendChild(iframe);
  
  // Create toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'copilot-toggle';
  toggleBtn.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background: #667eea;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 20px 0 0 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999998;
    box-shadow: -2px 0 10px rgba(0,0,0,0.2);
  `;
  toggleBtn.innerHTML = '💎';
  toggleBtn.title = 'Dealer Copilot';
  
  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.style.right === '0px';
    sidebar.style.right = isOpen ? '-400px' : '0px';
    
    // Notify React app
    window.postMessage({
      type: 'COPILOT_SIDEBAR_VISIBILITY',
      visible: !isOpen
    }, '*');
  });
  
  document.body.appendChild(toggleBtn);
  
  sidebarInjected = true;
}

// Setup message bridge between React app and extension
function setupMessageBridge() {
  // Listen from React app
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    if (!event.data.type?.startsWith('COPILOT_')) return;
    
    switch (event.data.type) {
      case 'COPILOT_COPY_TO_CLIPBOARD':
        await copyToClipboard(event.data.payload);
        break;
      
      case 'COPILOT_START_QUEUE':
        await startPostQueue(event.data.payload);
        break;
      
      case 'COPILOT_FOCUS_TAB':
        chrome.runtime.sendMessage({ action: 'FOCUS_WHATSAPP_TAB' });
        break;
      
      case 'COPILOT_SAVE_LISTING':
        await saveToIndexedDB('listings', event.data.payload);
        break;
      
      case 'COPILOT_GET_GROUPS':
        const groups = extractGroupList();
        window.postMessage({
          type: 'COPILOT_GROUPS_LIST',
          groups
        }, '*');
        break;
    }
  });
  
  // Listen from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'TOGGLE_SIDEBAR':
        document.querySelector('#copilot-toggle')?.click();
        break;
      
      case 'SAVE_POSTED_LISTING':
        saveToIndexedDB('postHistory', message.data);
        // Update group lastPosted
        saveToIndexedDB('groups', {
          name: message.data.groupName,
          lastPosted: Date.now(),
          postsCount: 1
        });
        break;
      
      case 'START_POST_QUEUE':
        startPostQueue(message.queue);
        break;
      
      case 'QUEUE_NEXT_ITEM':
        postNextInQueue(message.queue);
        break;
    }
  });
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    
    // Notify success
    window.postMessage({
      type: 'COPILOT_CLIPBOARD_SUCCESS',
      payload: { success: true, timestamp: Date.now() }
    }, '*');
    
    // Focus WhatsApp tab
    chrome.runtime.sendMessage({ action: 'FOCUS_WHATSAPP_TAB' });
    
    return true;
  } catch (err) {
    console.error('[Copilot] Clipboard failed:', err);
    
    window.postMessage({
      type: 'COPILOT_CLIPBOARD_ERROR',
      payload: { error: err.message }
    }, '*');
    
    return false;
  }
}

// START POST QUEUE SYSTEM
async function startPostQueue(queue) {
  if (!queue || queue.groups.length === 0) return;
  
  // Copy first item
  const groupText = `${queue.listingText}\n\n👥 Posted to: ${queue.groups[0]}`;
  await copyToClipboard(groupText);
  
  // Notify React app
  window.postMessage({
    type: 'COPILOT_QUEUE_STARTED',
    payload: {
      queueIndex: 0,
      total: queue.groups.length,
      currentGroup: queue.groups[0]
    }
  }, '*');
}

async function postNextInQueue(queue) {
  const nextIndex = queue.currentIndex;
  if (nextIndex >= queue.groups.length) return;
  
  const groupText = `${queue.listingText}\n\n👥 Posted to: ${queue.groups[nextIndex]}`;
  await copyToClipboard(groupText);
  
  window.postMessage({
    type: 'COPILOT_QUEUE_ADVANCE',
    payload: {
      queueIndex: nextIndex,
      currentGroup: queue.groups[nextIndex]
    }
  }, '*');
}

// Extract groups from WhatsApp sidebar (read-only)
function extractGroupList() {
  const groups = [];
  
  // Try multiple selectors (WhatsApp changes these)
  const selectors = [
    '[data-testid="cell-frame-title"]',
    '[aria-label*="group"] span',
    '.selectable-text'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 0 && text.includes('+')) {
        groups.push({
          name: text,
          unread: el.closest('[aria-label*="unread"]') !== null,
          timestamp: Date.now()
        });
      }
    });
  });
  
  // Deduplicate
  return [...new Map(groups.map(g => [g.name, g])).values()];
}

// Optional: Detect when user sends message (non-invasive)
function setupSendDetection() {
  // Only enable with user permission
  chrome.storage.local.get(['sendDetection'], (result) => {
    if (!result.sendDetection) return;
    
    // Watch for message input clearing (indicates send)
    const messageInput = document.querySelector('[contenteditable="true"][data-tab="10"]');
    if (!messageInput) return;
    
    let lastValue = messageInput.textContent;
    
    const observer = new MutationObserver(() => {
      const currentValue = messageInput.textContent;
      if (lastValue && !currentValue) {
        // Input cleared - message likely sent
        window.postMessage({
          type: 'COPILOT_SEND_DETECTED',
          timestamp: Date.now()
        }, '*');
        
        // Notify background for queue advancement
        chrome.runtime.sendMessage({
          action: 'TRACK_LISTING_POST',
          data: { timestamp: Date.now() }
        });
      }
      lastValue = currentValue;
    });
    
    observer.observe(messageInput, {
      characterData: true,
      childList: true,
      subtree: true
    });
  });
}

// Initialize
if (window.location.href.includes('web.whatsapp.com')) {
  init();
}
