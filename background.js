// Background script to track tab last access times

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabAccessTimes: {} });
  console.log('Tab Search: Initialized access time storage');
});

// Record tab access time
async function recordTabAccess(tabId) {
  try {
    const result = await chrome.storage.local.get('tabAccessTimes');
    const accessTimes = result.tabAccessTimes || {};
    accessTimes[tabId] = Date.now();
    await chrome.storage.local.set({ tabAccessTimes: accessTimes });
    console.log('Tab access recorded:', tabId);
  } catch (err) {
    console.error('Error saving access time:', err);
  }
}

// Listen for new tab creation - record initial access time
chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab created:', tab.id, tab.title);
  recordTabAccess(tab.id);
});

// Listen for tab activation (user switches to this tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
  recordTabAccess(activeInfo.tabId);
});

// Listen for tab updates (page navigation complete)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab loaded:', tabId, tab.title);
    recordTabAccess(tabId);
  }
});

// Listen for tab removal and cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab removed:', tabId);
  
  chrome.storage.local.get('tabAccessTimes').then((result) => {
    const accessTimes = result.tabAccessTimes || {};
    delete accessTimes[tabId];
    return chrome.storage.local.set({ tabAccessTimes: accessTimes });
  }).catch(err => console.error('Error removing access time:', err));
});

// Record existing tabs on startup
chrome.runtime.onStartup.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  const result = await chrome.storage.local.get('tabAccessTimes');
  const accessTimes = result.tabAccessTimes || {};
  const now = Date.now();
  
  // Record any tabs that don't have access times yet
  let updated = false;
  tabs.forEach(tab => {
    if (!accessTimes[tab.id]) {
      // For existing tabs, use a heuristic: active tab is "now", others are staggered
      accessTimes[tab.id] = tab.active ? now : now - (tab.index * 1000);
      updated = true;
    }
  });
  
  if (updated) {
    await chrome.storage.local.set({ tabAccessTimes: accessTimes });
    console.log('Tab Search: Recorded access times for existing tabs');
  }
  
  console.log('Tab Search: Extension started');
});

console.log('Tab Search: Background script loaded');
