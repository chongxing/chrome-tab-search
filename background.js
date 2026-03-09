// Background script to track tab creation times

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabTimestamps: {} });
  console.log('Tab Search: Initialized timestamp storage');
});

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab created:', tab.id, tab.title);
  
  chrome.storage.local.get('tabTimestamps').then((result) => {
    const timestamps = result.tabTimestamps || {};
    timestamps[tab.id] = Date.now();
    return chrome.storage.local.set({ tabTimestamps: timestamps });
  }).catch(err => console.error('Error saving timestamp:', err));
});

// Listen for tab removal and cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab removed:', tabId);
  
  chrome.storage.local.get('tabTimestamps').then((result) => {
    const timestamps = result.tabTimestamps || {};
    delete timestamps[tabId];
    return chrome.storage.local.set({ tabTimestamps: timestamps });
  }).catch(err => console.error('Error removing timestamp:', err));
});

// Optional: Record existing tabs on startup
chrome.runtime.onStartup.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  const result = await chrome.storage.local.get('tabTimestamps');
  const timestamps = result.tabTimestamps || {};
  const now = Date.now();
  
  // Record any tabs that don't have timestamps yet
  let updated = false;
  tabs.forEach(tab => {
    if (!timestamps[tab.id]) {
      // For existing tabs, use a heuristic: active tab is "now", others are staggered
      timestamps[tab.id] = tab.active ? now : now - (tab.index * 1000);
      updated = true;
    }
  });
  
  if (updated) {
    await chrome.storage.local.set({ tabTimestamps: timestamps });
    console.log('Tab Search: Recorded timestamps for existing tabs');
  }
});

console.log('Tab Search: Background script loaded');
