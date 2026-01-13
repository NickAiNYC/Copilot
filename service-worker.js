// service-worker.js - Background service worker for Dealer Copilot (Manifest V3)
// Handles extension lifecycle, messages, and core logic

console.log('[Dealer Copilot] Service worker initialized');

// ==================== LIFECYCLE ====================
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[Dealer Copilot] Extension ${details.reason}`);
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      installedAt: Date.now(),
      onboardingComplete: false,
      subscription: { tier: 'free', listingsThisMonth: 0 },
      styleProfile: null,
      groups: []
    });
    console.log('[Dealer Copilot] Default storage initialized');
  }
});

// ==================== MESSAGE HANDLER ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Dealer Copilot] Message received:', message.action);
  
  const handlers = {
    'FOCUS_WHATSAPP_TAB': handleFocusWhatsAppTab,
    'TRACK_LISTING_POST': handleTrackListing,
    'CHECK_SUBSCRIPTION': handleCheckSubscription,
    'GET_POST_HISTORY': handleGetPostHistory
  };
  
  const handler = handlers[message.action];
  if (handler) {
    handler(message.data)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keeps message channel open for async response
  }
  
  sendResponse({ success: false, error: 'Unknown action' });
});

// ==================== CORE FUNCTIONS ====================
async function handleFocusWhatsAppTab(data) {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
    return { tabId: tabs[0].id };
  } else {
    const newTab = await chrome.tabs.create({ url: 'https://web.whatsapp.com', active: true });
    return { tabId: newTab.id, isNew: true };
  }
}

async function handleTrackListing(data) {
  const { listingId, groupName, timestamp, listingData } = data;
  const { subscription = {}, postHistory = [] } = await chrome.storage.local.get(['subscription', 'postHistory']);
  
  // Update history
  const updatedHistory = [...postHistory, { id: listingId, groupName, timestamp, listingData }];
  
  // Update subscription count
  const updatedSubscription = { 
    ...subscription, 
    listingsThisMonth: (subscription.listingsThisMonth || 0) + 1 
  };
  
  await chrome.storage.local.set({ 
    postHistory: updatedHistory,
    subscription: updatedSubscription 
  });
  
  return { tracked: true, historyCount: updatedHistory.length };
}

async function handleCheckSubscription() {
  const { subscription = { tier: 'free', listingsThisMonth: 0 } } = await chrome.storage.local.get('subscription');
  const limit = subscription.tier === 'free' ? 3 : Infinity;
  const remaining = Math.max(0, limit - subscription.listingsThisMonth);
  
  return {
    allowed: remaining > 0,
    remaining,
    tier: subscription.tier,
    used: subscription.listingsThisMonth,
    limit
  };
}

async function handleGetPostHistory(filters = {}) {
  const { postHistory = [] } = await chrome.storage.local.get('postHistory');
  let filtered = [...postHistory];
  
  if (filters.groupName) {
    filtered = filtered.filter(post => post.groupName === filters.groupName);
  }
  if (filters.limit) {
    filtered = filtered.slice(-filters.limit);
  }
  
  return { history: filtered };
}

// Keep-alive for Manifest V3
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[Dealer Copilot] Service worker active');
  }
});
