// service-worker.js - Background service worker for Dealer Copilot
// This runs independently and manages the extension's core functionality

console.log('[Copilot] Service worker initialized');

// Extension installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Copilot] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First-time setup
    await initializeExtension();
    
    // Open onboarding page
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('onboarding.html') 
    });
  } else if (details.reason === 'update') {
    console.log('[Copilot] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Initialize default storage
async function initializeExtension() {
  const defaultSettings = {
    onboardingComplete: false,
    styleProfile: null,
    subscription: {
      tier: 'free',
      listingsThisMonth: 0,
      resetDate: getNextMonthStart()
    },
    groups: [],
    postHistory: [],
    settings: {
      darkMode: true,
      autoFocus: true,
      showNotifications: true
    }
  };
  
  await chrome.storage.local.set(defaultSettings);
  console.log('[Copilot] Default settings initialized');
}

// Helper: Get first day of next month
function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

// Message handler from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Copilot] Message received:', message.action);
  
  switch (message.action) {
    case 'focusWhatsAppTab':
      handleFocusWhatsAppTab(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
      
    case 'trackListingPosted':
      handleTrackListing(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    case 'checkSubscriptionLimit':
      handleCheckSubscription()
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    case 'getPostHistory':
      handleGetPostHistory(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Focus WhatsApp Web tab or open new one
async function handleFocusWhatsAppTab(data) {
  try {
    // Find existing WhatsApp tabs
    const tabs = await chrome.tabs.query({ 
      url: 'https://web.whatsapp.com/*' 
    });
    
    if (tabs.length > 0) {
      // Focus existing tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      
      console.log('[Copilot] Focused existing WhatsApp tab');
      return { success: true, tabId: tabs[0].id };
    } else {
      // Open new WhatsApp tab
      const newTab = await chrome.tabs.create({ 
        url: 'https://web.whatsapp.com',
        active: true
      });
      
      console.log('[Copilot] Opened new WhatsApp tab');
      return { success: true, tabId: newTab.id, isNew: true };
    }
  } catch (error) {
    console.error('[Copilot] Error focusing tab:', error);
    throw error;
  }
}

// Track posted listing
async function handleTrackListing(data) {
  try {
    const { listingId, groupName, timestamp, listingData } = data;
    
    // Get current post history
    const storage = await chrome.storage.local.get(['postHistory', 'subscription']);
    const postHistory = storage.postHistory || [];
    const subscription = storage.subscription || { tier: 'free', listingsThisMonth: 0 };
    
    // Add new post
    postHistory.push({
      id: listingId,
      groupName,
      timestamp: timestamp || Date.now(),
      listing: listingData
    });
    
    // Increment usage counter
    subscription.listingsThisMonth++;
    
    // Save back to storage
    await chrome.storage.local.set({ 
      postHistory,
      subscription 
    });
    
    console.log('[Copilot] Tracked listing:', listingId, 'in group:', groupName);
    return { success: true, total: postHistory.length };
  } catch (error) {
    console.error('[Copilot] Error tracking listing:', error);
    throw error;
  }
}

// Check subscription limits
async function handleCheckSubscription() {
  try {
    const { subscription } = await chrome.storage.local.get('subscription');
    
    const limit = subscription.tier === 'free' ? 3 : Infinity;
    const used = subscription.listingsThisMonth || 0;
    const remaining = Math.max(0, limit - used);
    
    // Check if reset needed
    const now = new Date();
    const resetDate = new Date(subscription.resetDate);
    if (now >= resetDate) {
      // Reset monthly counter
      subscription.listingsThisMonth = 0;
      subscription.resetDate = getNextMonthStart();
      await chrome.storage.local.set({ subscription });
      
      return {
        allowed: true,
        remaining: limit,
        tier: subscription.tier,
        resetOccurred: true
      };
    }
    
    return {
      allowed: remaining > 0,
      remaining,
      used,
      limit,
      tier: subscription.tier,
      resetDate: subscription.resetDate
    };
  } catch (error) {
    console.error('[Copilot] Error checking subscription:', error);
    throw error;
  }
}

// Get post history with filters
async function handleGetPostHistory(filters = {}) {
  try {
    const { postHistory } = await chrome.storage.local.get('postHistory');
    let history = postHistory || [];
    
    // Apply filters
    if (filters.groupName) {
      history = history.filter(post => post.groupName === filters.groupName);
    }
    
    if (filters.startDate) {
      history = history.filter(post => post.timestamp >= filters.startDate);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return { success: true, history };
  } catch (error) {
    console.error('[Copilot] Error getting history:', error);
    throw error;
  }
}

// Keep service worker alive (important for Manifest V3)
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[Copilot] Service worker keepalive ping');
  }
});
