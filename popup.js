// popup.js - Extension popup functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Load subscription data
  try {
    const subscription = await chrome.runtime.sendMessage({
      action: 'checkSubscriptionLimit'
    });
    
    if (subscription) {
      document.getElementById('listings-count').textContent = 
        `${subscription.used || 0}/${subscription.limit === Infinity ? '∞' : subscription.limit}`;
      document.getElementById('tier').textContent = 
        subscription.tier === 'free' ? 'Free' : 'Premium';
    }
  } catch (error) {
    console.error('Error loading subscription:', error);
    document.getElementById('listings-count').textContent = 'Error';
    document.getElementById('tier').textContent = 'Unknown';
  }
  
  // Open WhatsApp button
  document.getElementById('open-whatsapp').addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({
        action: 'focusWhatsAppTab'
      });
      window.close();
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  });
  
  // Open settings button
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    window.close();
  });
});
