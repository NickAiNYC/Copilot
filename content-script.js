// content-script.js - Injected into WhatsApp Web
// This script creates the sidebar and handles communication

console.log('[Copilot] Content script loaded on WhatsApp Web');

let sidebarInjected = false;
let sidebarIframe = null;

// Wait for WhatsApp to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('[Copilot] Initializing on WhatsApp Web');
  
  // Wait a bit for WhatsApp's React to stabilize
  setTimeout(() => {
    injectSidebar();
    setupMessageBridge();
    setupClipboardHandler();
  }, 2000);
}

// Inject sidebar iframe
function injectSidebar() {
  if (sidebarInjected) {
    console.log('[Copilot] Sidebar already injected');
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'dealer-copilot-root';
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 999999;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    background: #1e293b;
    border-left: 1px solid #334155;
    overflow: hidden;
  `;
  
  // Create iframe for isolated React app
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'dealer-copilot-sidebar';
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  `;
  
  container.appendChild(sidebarIframe);
  document.body.appendChild(container);
  
  sidebarInjected = true;
  console.log('[Copilot] Sidebar injected successfully');
}

// Setup message bridge between iframe and background
function setupMessageBridge() {
  // Listen to messages from sidebar iframe
  window.addEventListener('message', async (event) => {
    // Security: Only accept messages from our iframe
    if (event.source !== sidebarIframe?.contentWindow) {
      return;
    }
    
    const { type, payload } = event.data;
    
    if (!type || !type.startsWith('COPILOT_')) {
      return;
    }
    
    console.log('[Copilot] Message from sidebar:', type);
    
    switch (type) {
      case 'COPILOT_COPY_TO_CLIPBOARD':
        await handleCopyToClipboard(payload);
        break;
        
      case 'COPILOT_FOCUS_WHATSAPP':
        handleFocusWhatsApp();
        break;
        
      case 'COPILOT_GET_GROUPS':
        await handleGetGroups();
        break;
        
      case 'COPILOT_TRACK_POST':
        await handleTrackPost(payload);
        break;
        
      default:
        console.warn('[Copilot] Unknown message type:', type);
    }
  });
  
  // Listen to messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Copilot] Message from background:', message.action);
    
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

// Handle clipboard copy
async function handleCopyToClipboard(data) {
  try {
    const { text } = data;
    
    // Use modern Clipboard API
    await navigator.clipboard.writeText(text);
    
    console.log('[Copilot] Text copied to clipboard');
    
    // Notify sidebar of success
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_CLIPBOARD_SUCCESS',
      payload: { success: true }
    }, '*');
    
    // Optional: Show brief notification
    showNotification('✓ Copied to clipboard');
    
  } catch (error) {
    console.error('[Copilot] Clipboard error:', error);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_CLIPBOARD_ERROR',
      payload: { error: error.message }
    }, '*');
  }
}

// Handle focus WhatsApp request
function handleFocusWhatsApp() {
  // Just ensure window is focused
  window.focus();
  
  console.log('[Copilot] WhatsApp window focused');
  
  sidebarIframe.contentWindow.postMessage({
    type: 'COPILOT_FOCUS_SUCCESS',
    payload: { success: true }
  }, '*');
}

// Extract group list from WhatsApp (read-only)
async function handleGetGroups() {
  try {
    const groups = [];
    
    // Find group/chat elements in sidebar
    // Note: WhatsApp's DOM structure may change - this is a robust approach
    const chatElements = document.querySelectorAll('[data-testid="cell-frame-title"]');
    
    chatElements.forEach((element, index) => {
      const groupName = element.textContent.trim();
      if (groupName && index < 50) { // Limit to first 50
        groups.push({
          name: groupName,
          id: `group_${index}`,
          lastSeen: Date.now()
        });
      }
    });
    
    console.log('[Copilot] Extracted', groups.length, 'groups');
    
    // Send back to sidebar
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_GROUPS_DATA',
      payload: { groups }
    }, '*');
    
  } catch (error) {
    console.error('[Copilot] Error getting groups:', error);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_GROUPS_ERROR',
      payload: { error: error.message }
    }, '*');
  }
}

// Track post to background
async function handleTrackPost(data) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'trackListingPosted',
      data
    });
    
    console.log('[Copilot] Post tracked:', response);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_TRACK_SUCCESS',
      payload: response
    }, '*');
    
  } catch (error) {
    console.error('[Copilot] Error tracking post:', error);
  }
}

// Setup clipboard monitoring (optional feature)
function setupClipboardHandler() {
  // Could monitor for paste events to detect when user pastes
  // This is NON-INVASIVE - we don't modify WhatsApp's behavior
  document.addEventListener('paste', (e) => {
    console.log('[Copilot] Paste detected (monitoring only)');
  });
}

// Show temporary notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 420px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui;
    font-size: 14px;
    z-index: 9999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add animation styles
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

console.log('[Copilot] Content script fully initialized');
