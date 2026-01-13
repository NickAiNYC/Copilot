// Chrome Extension Service Worker (Manifest V3)
// Version: 1.0.0 - Dealer Copilot

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First-time setup
    await chrome.storage.local.set({
      installedAt: Date.now(),
      onboardingComplete: false,
      styleProfile: null,
      subscription: { 
        tier: 'free', 
        listingsThisMonth: 0,
        trialEnds: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      },
      preferences: { theme: 'dark', showTips: true }
    });
    
    // Open onboarding page
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('onboarding.html') 
    });
  }
});

// Handle messages from content script/sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'FOCUS_WHATSAPP_TAB':
      focusWhatsAppTab(message.groupName);
      sendResponse({ success: true });
      break;
    
    case 'TRACK_LISTING_POST':
      trackListingPosted(message.data);
      sendResponse({ success: true });
      break;
    
    case 'CHECK_SUBSCRIPTION':
      checkSubscriptionLimit(sendResponse);
      return true; // Async response
    
    case 'START_QUEUE_POST':
      startQueuePost(message.queueData);
      sendResponse({ success: true });
      break;
    
    default:
      console.warn('[Copilot] Unknown action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'toggle-sidebar':
      toggleSidebar();
      break;
    
    case 'quick-copy':
      quickCopyLastListing();
      break;
  }
});

// QUEUE MANAGEMENT SYSTEM
let activeQueue = null;

function getQueueStatus() {
  return activeQueue ? {
    active: true,
    currentIndex: activeQueue.currentIndex,
    total: activeQueue.groups.length,
    currentGroup: activeQueue.groups[activeQueue.currentIndex]
  } : { active: false };
}

function startQueuePost(queueData) {
  activeQueue = {
    groups: queueData.groups,
    currentIndex: 0,
    listingText: queueData.listingText,
    listingId: queueData.listingId,
    startedAt: Date.now()
  };
  
  // Notify content script to start posting first group
  chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'START_POST_QUEUE',
        queue: activeQueue
      });
    }
  });
}

// ADVANCE QUEUE
function advanceQueue() {
  if (!activeQueue) return;
  
  activeQueue.currentIndex++;
  
  if (activeQueue.currentIndex >= activeQueue.groups.length) {
    // Queue complete
    activeQueue = null;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Dealer Copilot',
      message: '✅ All groups posted successfully!'
    });
  } else {
    // Continue with next group
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'QUEUE_NEXT_ITEM',
          queue: activeQueue
        });
      }
    });
  }
}

// FOCUS WHATSAPP TAB
async function focusWhatsAppTab(groupName = null) {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
    
    // If group specified, navigate within WhatsApp
    if (groupName) {
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'NAVIGATE_TO_GROUP',
          groupName: groupName
        });
      }, 500); // Wait for tab to load
    }
  } else {
    await chrome.tabs.create({ url: 'https://web.whatsapp.com' });
  }
}

// TRACK LISTING ANALYTICS
async function trackListingPosted(data) {
  const { listingId, groupName, timestamp } = data;
  
  // Send to content script for IndexedDB storage
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'SAVE_POSTED_LISTING',
      data: { 
        listingId, 
        groupName, 
        timestamp, 
        status: 'posted' 
      }
    });
  }
  
  // Advance queue if active
  if (activeQueue) {
    advanceQueue();
  }
  
  // Increment usage counter
  const storage = await chrome.storage.local.get('subscription');
  if (storage.subscription) {
    storage.subscription.listingsThisMonth = 
      (storage.subscription.listingsThisMonth || 0) + 1;
    await chrome.storage.local.set({ subscription: storage.subscription });
  }
}

// SUBSCRIPTION CHECK
async function checkSubscriptionLimit(sendResponse) {
  const storage = await chrome.storage.local.get('subscription');
  const subscription = storage.subscription || { 
    tier: 'free', 
    listingsThisMonth: 0 
  };
  
  const limit = subscription.tier === 'free' ? 3 : Infinity;
  const remaining = Math.max(0, limit - subscription.listingsThisMonth);
  const trialActive = subscription.trialEnds && subscription.trialEnds > Date.now();
  
  sendResponse({
    allowed: remaining > 0 || trialActive,
    remaining,
    tier: subscription.tier,
    trialActive,
    trialEnds: subscription.trialEnds
  });
}

// UTILITY FUNCTIONS
async function toggleSidebar() {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'TOGGLE_SIDEBAR'
    });
  }
}

async function quickCopyLastListing() {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'QUICK_COPY_LAST'
    });
  }
}
