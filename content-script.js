// content-script.js - WhatsApp Web injection for Dealer Copilot
// Injects sidebar and handles communication between UI and extension

console.log('[Dealer Copilot] Content script loaded on WhatsApp Web');

// ==================== GLOBAL STATE ====================
let sidebarInjected = false;
let sidebarIframe = null;
let isWhatsAppLoaded = false;

// ==================== MAIN INITIALIZATION ====================
(function initialize() {
  console.log('[Dealer Copilot] Initializing content script');
  
  // Wait for WhatsApp to fully load
  waitForWhatsAppLoad().then(() => {
    console.log('[Dealer Copilot] WhatsApp Web detected as loaded');
    isWhatsAppLoaded = true;
    
    // Inject sidebar after a short delay
    setTimeout(() => {
      injectSidebar();
      setupMessageBridge();
      setupClipboardHandler();
      setupGroupDetection();
    }, 1500);
  }).catch(error => {
    console.error('[Dealer Copilot] Failed to detect WhatsApp:', error);
  });
})();

// ==================== CORE FUNCTIONS ====================

// Wait for WhatsApp's main UI to load
async function waitForWhatsAppLoad() {
  return new Promise((resolve) => {
    const MAX_WAIT_TIME = 30000; // 30 seconds max
    const CHECK_INTERVAL = 500;
    let elapsed = 0;
    
    const checkInterval = setInterval(() => {
      // Check for WhatsApp's main panel
      const mainPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]') || 
                       document.querySelector('#main') ||
                       document.querySelector('div[role="main"]');
      
      if (mainPanel) {
        clearInterval(checkInterval);
        resolve();
      } else if (elapsed >= MAX_WAIT_TIME) {
        clearInterval(checkInterval);
        console.warn('[Dealer Copilot] WhatsApp load timeout');
        resolve(); // Resolve anyway to try injection
      }
      
      elapsed += CHECK_INTERVAL;
    }, CHECK_INTERVAL);
  });
}

// Inject the sidebar iframe into WhatsApp Web
function injectSidebar() {
  if (sidebarInjected) {
    console.log('[Dealer Copilot] Sidebar already injected');
    return;
  }
  
  try {
    // Create main container
    const container = document.createElement('div');
    container.id = 'dealer-copilot-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      z-index: 999999;
      background: #1a1a1a;
      border-left: 1px solid #2d2d2d;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease;
    `;
    
    // Create iframe for isolated React app
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.id = 'dealer-copilot-sidebar';
    sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
    sidebarIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    `;
    
    container.appendChild(sidebarIframe);
    document.body.appendChild(container);
    
    // Create toggle button
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'copilot-toggle-btn';
    toggleBtn.style.cssText = `
      position: fixed;
      top: 50%;
      right: 400px;
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
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      font-size: 20px;
    `;
    toggleBtn.innerHTML = '💎';
    toggleBtn.title = 'Toggle Dealer Copilot';
    
    toggleBtn.addEventListener('click', () => {
      const isHidden = container.style.transform === 'translateX(400px)';
      container.style.transform = isHidden ? 'translateX(0)' : 'translateX(400px)';
      toggleBtn.style.right = isHidden ? '400px' : '0px';
      toggleBtn.innerHTML = isHidden ? '💎' : '←';
      
      // Notify React app
      if (sidebarIframe.contentWindow) {
        sidebarIframe.contentWindow.postMessage({
          type: 'COPILOT_SIDEBAR_VISIBILITY',
          visible: !isHidden
        }, '*');
      }
    });
    
    document.body.appendChild(toggleBtn);
    
    sidebarInjected = true;
    console.log('[Dealer Copilot] Sidebar injected successfully');
    
  } catch (error) {
    console.error('[Dealer Copilot] Failed to inject sidebar:', error);
  }
}

// Setup bidirectional message bridge
function setupMessageBridge() {
  // Listen for messages FROM sidebar (React app)
  window.addEventListener('message', async (event) => {
    // Security check: only accept messages from our iframe
    if (event.source !== sidebarIframe?.contentWindow) return;
    
    const { type, payload } = event.data;
    if (!type?.startsWith('COPILOT_')) return;
    
    console.log('[Dealer Copilot] Message from sidebar:', type);
    
    try {
      switch (type) {
        case 'COPILOT_COPY_TO_CLIPBOARD':
          await handleCopyToClipboard(payload);
          break;
          
        case 'COPILOT_GET_GROUPS':
          await handleGetGroups();
          break;
          
        case 'COPILOT_TRACK_POST':
          await handleTrackPost(payload);
          break;
          
        case 'COPILOT_FOCUS_WHATSAPP':
          handleFocusWhatsApp();
          break;
          
        default:
          console.warn('[Dealer Copilot] Unknown message type:', type);
      }
    } catch (error) {
      console.error('[Dealer Copilot] Error handling message:', error);
      notifySidebar('COPILOT_ERROR', { error: error.message });
    }
  });
  
  // Listen for messages FROM background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Dealer Copilot] Message from background:', message.action);
    
    // Forward relevant messages to sidebar
    if (sidebarIframe?.contentWindow) {
      sidebarIframe.contentWindow.postMessage({
        type: 'COPILOT_BACKGROUND_MESSAGE',
        payload: message
      }, '*');
    }
    
    sendResponse({ received: true });
  });
}

// Handle clipboard copy requests
async function handleCopyToClipboard(data) {
  try {
    const { text, listingId, groupName } = data;
    
    if (!text) {
      throw new Error('No text provided to copy');
    }
    
    // Use modern Clipboard API
    await navigator.clipboard.writeText(text);
    console.log('[Dealer Copilot] Text copied to clipboard');
    
    // Show success notification
    showNotification('✓ Copied to clipboard!', 'success');
    
    // Notify sidebar of success
    notifySidebar('COPILOT_CLIPBOARD_SUCCESS', {
      success: true,
      timestamp: Date.now()
    });
    
    // Auto-focus WhatsApp for immediate pasting
    setTimeout(() => {
      window.focus();
      // Try to focus the message input (non-invasive)
      const messageInput = document.querySelector('[contenteditable="true"][data-tab="10"]');
      if (messageInput) {
        messageInput.focus();
      }
    }, 100);
    
    // Track the copy event if we have listing data
    if (listingId && groupName) {
      chrome.runtime.sendMessage({
        action: 'TRACK_LISTING_POST',
        data: {
          listingId,
          groupName,
          timestamp: Date.now(),
          action: 'copied'
        }
      });
    }
    
  } catch (error) {
    console.error('[Dealer Copilot] Clipboard error:', error);
    
    // Show error notification
    showNotification('✗ Failed to copy', 'error');
    
    // Notify sidebar of error
    notifySidebar('COPILOT_CLIPBOARD_ERROR', {
      error: error.message,
      code: error.name
    });
  }
}

// Extract WhatsApp groups (read-only, non-invasive)
async function handleGetGroups() {
  try {
    const groups = [];
    const maxGroups = 50;
    
    // Multiple selectors for robustness (WhatsApp changes DOM)
    const selectors = [
      '[data-testid="cell-frame-title"]',
      '[data-testid="conversation-info-header-chat-title"]',
      '[title] span[dir="auto"]',
      'span[title].selectable-text'
    ];
    
    for (const selector of selectors) {
      if (groups.length >= maxGroups) break;
      
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (groups.length >= maxGroups) break;
        
        const text = element.textContent?.trim();
        if (text && text.length > 0 && !groups.some(g => g.name === text)) {
          groups.push({
            name: text,
            id: `group_${groups.length}`,
            element: selector,
            timestamp: Date.now()
          });
        }
      }
    }
    
    console.log(`[Dealer Copilot] Found ${groups.length} groups`);
    
    // Send groups to sidebar
    notifySidebar('COPILOT_GROUPS_DATA', {
      groups: groups.slice(0, 30), // Limit to 30 for UI performance
      total: groups.length,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[Dealer Copilot] Error getting groups:', error);
    notifySidebar('COPILOT_GROUPS_ERROR', { error: error.message });
  }
}

// Track post completion
async function handleTrackPost(data) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'TRACK_LISTING_POST',
      data
    });
    
    console.log('[Dealer Copilot] Post tracked:', response);
    
    notifySidebar('COPILOT_TRACK_SUCCESS', response);
    
  } catch (error) {
    console.error('[Dealer Copilot] Error tracking post:', error);
    notifySidebar('COPILOT_TRACK_ERROR', { error: error.message });
  }
}

// Focus WhatsApp window
function handleFocusWhatsApp() {
  window.focus();
  notifySidebar('COPILOT_FOCUS_SUCCESS', { success: true });
}

// Setup clipboard paste detection (optional, non-invasive)
function setupClipboardHandler() {
  // Simply log paste events for analytics (no interception)
  document.addEventListener('paste', (event) => {
    console.log('[Dealer Copilot] Paste event detected (read-only monitoring)');
    
    // Optional: Send analytics to background
    chrome.runtime.sendMessage({
      action: 'TRACK_LISTING_POST',
      data: {
        action: 'paste_detected',
        timestamp: Date.now(),
        source: 'clipboard_handler'
      }
    });
  });
}

// Setup periodic group detection
function setupGroupDetection() {
  // Refresh groups every 30 seconds while sidebar is open
  setInterval(() => {
    if (sidebarIframe?.contentWindow) {
      handleGetGroups();
    }
  }, 30000);
}

// ==================== UTILITY FUNCTIONS ====================

// Send message to sidebar React app
function notifySidebar(type, payload) {
  if (sidebarIframe?.contentWindow) {
    sidebarIframe.contentWindow.postMessage({
      type,
      payload
    }, '*');
  }
}

// Show temporary notification
function showNotification(message, type = 'info') {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 420px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
    word-wrap: break-word;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add animation styles for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('[Dealer Copilot] Content script fully initialized');
