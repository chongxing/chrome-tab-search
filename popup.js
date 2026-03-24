// Tab Search - Popup Script

let allTabs = [];
let filteredTabs = [];
let selectedIndex = -1;
let windowsMap = new Map();
let tabAccessTimes = {};
let pinnedTabIds = new Set();
let currentSortMode = 'window';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tabList = document.getElementById('tabList');
const stats = document.getElementById('stats');
const sortByWindowBtn = document.getElementById('sortByWindow');
const sortByTimeBtn = document.getElementById('sortByTime');

// Initialize
async function init() {
  try {
    if (chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('sortMode');
      currentSortMode = result.sortMode || 'window';
    } else {
      console.warn('Storage API not available, using default sort mode');
      currentSortMode = 'window';
    }
    updateSortButtons();
    
    await loadTabAccessTimes();
    await loadPinnedTabs();
    await loadAllTabs();
    setupEventListeners();
    searchInput.focus();
  } catch (error) {
    console.error('Init failed:', error);
    currentSortMode = 'window';
    updateSortButtons();
    await loadAllTabs();
    setupEventListeners();
    searchInput.focus();
  }
}

// Load tab access times from storage
async function loadTabAccessTimes() {
  try {
    if (chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('tabAccessTimes');
      tabAccessTimes = result.tabAccessTimes || {};
    } else {
      tabAccessTimes = {};
    }
    console.log('Loaded access times:', Object.keys(tabAccessTimes).length);
  } catch (error) {
    console.error('Load access times failed:', error);
    tabAccessTimes = {};
  }
}

// Load pinned tabs from storage
async function loadPinnedTabs() {
  try {
    if (chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('pinnedTabIds');
      const pinnedArray = result.pinnedTabIds || [];
      pinnedTabIds = new Set(pinnedArray);
    } else {
      pinnedTabIds = new Set();
    }
    console.log('Loaded pinned tabs:', pinnedTabIds.size);
  } catch (error) {
    console.error('Load PIN status failed:', error);
    pinnedTabIds = new Set();
  }
}

// Save pinned tabs to storage
async function savePinnedTabs() {
  try {
    if (chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ pinnedTabIds: Array.from(pinnedTabIds) });
    }
  } catch (error) {
    console.error('Save PIN status failed:', error);
  }
}

// Toggle pin status for a tab
async function togglePinTab(tabId) {
  tabId = parseInt(tabId);
  if (pinnedTabIds.has(tabId)) {
    pinnedTabIds.delete(tabId);
  } else {
    pinnedTabIds.add(tabId);
  }
  await savePinnedTabs();
  
  sortTabs();
  filterTabs(searchInput.value);
}

// Load all tabs from all windows
async function loadAllTabs() {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    console.log('Loaded windows:', windows.length);
    
    allTabs = [];
    windowsMap.clear();
    
    const currentWindow = await chrome.windows.getCurrent();
    
    windows.forEach((window, index) => {
      const isFocused = window.id === currentWindow.id;
      
      const activeTab = window.tabs?.find(t => t.active);
      const windowName = activeTab ? (activeTab.title || chrome.i18n.getMessage('unnamedWindow')) : chrome.i18n.getMessage('unnamedWindow');
      
      windowsMap.set(window.id, {
        index: index + 1,
        focused: isFocused,
        tabCount: window.tabs?.length || 0,
        name: windowName
      });
      
      if (window.tabs) {
        window.tabs.forEach(tab => {
          const hasAccessTime = tabAccessTimes.hasOwnProperty(tab.id);
          const accessTime = hasAccessTime ? tabAccessTimes[tab.id] : 0;
          
          allTabs.push({
            ...tab,
            windowIndex: index + 1,
            windowFocused: isFocused,
            accessTime: accessTime,
            hasAccessTime: hasAccessTime
          });
        });
      }
    });

    console.log('Total tabs loaded:', allTabs.length);

    sortTabs();
    filteredTabs = [...allTabs];
    updateStats();
    renderTabs();
    
    console.log('Debug - Windows found:', windowsMap.size, 'Tabs total:', allTabs.length);
    
  } catch (error) {
    console.error('Load tabs failed:', error);
    tabList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <div class="no-results-text">${chrome.i18n.getMessage('loadError')}</div>
        <div style="font-size:12px;color:#888;margin-top:8px;">${error.message}</div>
      </div>
    `;
  }
}

// Sort tabs based on current mode
function sortTabs() {
  if (currentSortMode === 'window') {
    const currentWindow = Array.from(windowsMap.values()).find(w => w.focused);
    const currentWindowId = currentWindow ? 
      Array.from(windowsMap.entries()).find(([_, v]) => v.focused)?.[0] : null;
    
    allTabs.sort((a, b) => {
      const aPinned = pinnedTabIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedTabIds.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      
      if (a.windowId === currentWindowId && b.windowId !== currentWindowId) return -1;
      if (b.windowId === currentWindowId && a.windowId !== currentWindowId) return 1;
      if (a.windowId !== b.windowId) return a.windowId - b.windowId;
      return a.index - b.index;
    });
  } else {
    allTabs.sort((a, b) => {
      const aPinned = pinnedTabIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedTabIds.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      
      if (a.hasAccessTime && !b.hasAccessTime) return -1;
      if (!a.hasAccessTime && b.hasAccessTime) return 1;
      return b.accessTime - a.accessTime;
    });
  }
}

// Update sort button states
function updateSortButtons() {
  if (sortByWindowBtn && sortByTimeBtn) {
    if (currentSortMode === 'window') {
      sortByWindowBtn.classList.add('active');
      sortByTimeBtn.classList.remove('active');
    } else {
      sortByWindowBtn.classList.remove('active');
      sortByTimeBtn.classList.add('active');
    }
  }
}

// Switch sort mode
async function switchSortMode(mode) {
  if (mode === currentSortMode) return;
  
  currentSortMode = mode;
  
  try {
    if (chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ sortMode: mode });
    }
  } catch (error) {
    console.error('Save sort mode failed:', error);
  }
  
  updateSortButtons();
  sortTabs();
  
  filterTabs(searchInput.value);
}

// Format relative time
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  if (diff < minute) {
    return chrome.i18n.getMessage('justNow');
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return chrome.i18n.getMessage('minutesAgo', [minutes.toString()]);
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return chrome.i18n.getMessage('hoursAgo', [hours.toString()]);
  } else if (diff < 2 * day) {
    const date = new Date(timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return chrome.i18n.getMessage('yesterdayAt', [timeStr]);
  } else if (diff < week) {
    const dayNames = [
      chrome.i18n.getMessage('sunday'),
      chrome.i18n.getMessage('monday'),
      chrome.i18n.getMessage('tuesday'),
      chrome.i18n.getMessage('wednesday'),
      chrome.i18n.getMessage('thursday'),
      chrome.i18n.getMessage('friday'),
      chrome.i18n.getMessage('saturday')
    ];
    const date = new Date(timestamp);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return chrome.i18n.getMessage('dayAtTime', [dayNames[date.getDay()], timeStr]);
  } else {
    const date = new Date(timestamp);
    return chrome.i18n.getMessage('monthDay', [(date.getMonth() + 1).toString(), date.getDate().toString()]);
  }
}

// Update statistics
function updateStats() {
  const windowCount = windowsMap.size;
  const totalTabs = allTabs.length;
  const filteredCount = filteredTabs.length;
  const pinnedCount = pinnedTabIds.size;
  
  let text = '';
  if (currentSortMode === 'window') {
    if (filteredCount === totalTabs) {
      text = chrome.i18n.getMessage('statsWindowsAndTabs', [windowCount.toString(), totalTabs.toString()]);
    } else {
      text = chrome.i18n.getMessage('statsResults', [filteredCount.toString(), totalTabs.toString()]);
    }
  } else {
    if (filteredCount === totalTabs) {
      text = chrome.i18n.getMessage('statsTotalTabs', [filteredCount.toString()]);
      if (pinnedCount > 0) {
        text += ', ' + chrome.i18n.getMessage('statsPinned', [pinnedCount.toString()]);
      }
      text += ', ' + chrome.i18n.getMessage('statsSortedByTime');
    } else {
      text = chrome.i18n.getMessage('statsResults', [filteredCount.toString(), totalTabs.toString()]);
    }
  }
  stats.textContent = text;
}

// Filter tabs based on search query
function filterTabs(query) {
  if (!query.trim()) {
    filteredTabs = [...allTabs];
  } else {
    const lowerQuery = query.toLowerCase();
    filteredTabs = allTabs.filter(tab => {
      const titleMatch = tab.title && tab.title.toLowerCase().includes(lowerQuery);
      const urlMatch = tab.url && tab.url.toLowerCase().includes(lowerQuery);
      return titleMatch || urlMatch;
    });
  }
  selectedIndex = -1;
  updateStats();
  renderTabs();
}

// Highlight matching text
function highlightText(text, query) {
  if (!query.trim() || !text) return escapeHtml(text);

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return escapeHtml(text);

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return escapeHtml(before) + `<span class="highlight">${escapeHtml(match)}</span>` + escapeHtml(after);
}

// Escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render tabs list
function renderTabs() {
  if (filteredTabs.length === 0) {
    tabList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-text">${chrome.i18n.getMessage('noResults')}</div>
      </div>
    `;
    return;
  }
  
  console.log('Rendering tabs:', filteredTabs.length, 'mode:', currentSortMode);

  const query = searchInput.value;
  let html = '';

  if (currentSortMode === 'window') {
    const groupedTabs = new Map();
    filteredTabs.forEach((tab, index) => {
      if (!groupedTabs.has(tab.windowId)) {
        groupedTabs.set(tab.windowId, []);
      }
      groupedTabs.get(tab.windowId).push({ ...tab, filteredIndex: index });
    });

    groupedTabs.forEach((tabs, windowId) => {
      const windowInfo = windowsMap.get(windowId);
      const isCurrentWindow = tabs[0].windowFocused;

      html += `
        <div class="window-group">
          <div class="window-header ${isCurrentWindow ? 'current' : ''}">
            <span class="window-icon">${isCurrentWindow ? '🪟' : '📑'}</span>
            <span title="${escapeHtml(windowInfo.name || '')}">${chrome.i18n.getMessage('windowLabel', [windowInfo.index.toString()])}${windowInfo.name ? ' - ' + escapeHtml(windowInfo.name.substring(0, 30)) + (windowInfo.name.length > 30 ? '...' : '') : ''} ${isCurrentWindow ? chrome.i18n.getMessage('currentWindow') : ''}</span>
            <span class="window-tabs-count">${chrome.i18n.getMessage('tabCount', [tabs.length.toString()])}</span>
          </div>
          <div class="window-tabs">
      `;

      tabs.forEach(tab => {
        html += renderTabItem(tab, query);
      });

      html += `
          </div>
        </div>
      `;
    });
  } else {
    html += '<div class="time-list">';
    
    filteredTabs.forEach((tab, index) => {
      const timeText = tab.hasAccessTime ? formatRelativeTime(tab.accessTime) : chrome.i18n.getMessage('previouslyVisited');
      html += renderTabItem(tab, query, timeText, index);
    });
    
    html += '</div>';
  }

  tabList.innerHTML = html;

  document.querySelectorAll('.tab-icon[data-fallback="true"]').forEach(img => {
    img.addEventListener('error', function() {
      this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E📄%3C/text%3E%3C/svg%3E";
    });
  });

  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.pin-btn')) return;
      
      const tabId = parseInt(item.dataset.tabId);
      const windowId = parseInt(item.dataset.windowId);
      switchToTab(tabId, windowId);
    });
  });

  document.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tabId = btn.dataset.tabId;
      await togglePinTab(tabId);
    });
  });

  if (selectedIndex >= 0) {
    const selected = document.querySelector('.tab-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

// Render single tab item
function renderTabItem(tab, query, timeText = null, filteredIndex = null) {
  const isActive = tab.active ? 'active' : '';
  const index = filteredIndex !== null ? filteredIndex : tab.filteredIndex;
  const isSelected = index === selectedIndex ? 'selected' : '';
  const isPinned = pinnedTabIds.has(tab.id);
  const favicon = tab.favIconUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E📄%3C/text%3E%3C/svg%3E";

  let badges = '';
  if (tab.active || tab.audible) {
    badges = '<div class="tab-badges">';
    if (tab.active) badges += `<span class="tab-badge active">${chrome.i18n.getMessage('currentTab')}</span>`;
    if (tab.audible) badges += '<span class="tab-badge audible">🔊</span>';
    badges += '</div>';
  }
  
  let timeInfo = '';
  if (timeText) {
    timeInfo = `<div class="tab-time">${timeText}</div>`;
  }

  const pinButton = `<button class="pin-btn ${isPinned ? 'pinned' : ''}" data-tab-id="${tab.id}" title="${isPinned ? chrome.i18n.getMessage('unpinTooltip') : chrome.i18n.getMessage('pinTooltip')}">${isPinned ? '📌' : '📍'}</button>`;

  return `
    <div class="tab-item ${isActive} ${isSelected} ${isPinned ? 'pinned' : ''}" data-index="${index}" data-tab-id="${tab.id}" data-window-id="${tab.windowId}">
      ${pinButton}
      <img class="tab-icon" src="${favicon}" alt="" data-fallback="true">
      <div class="tab-content">
        <div class="tab-title">${highlightText(tab.title, query)}</div>
        <div class="tab-url">${highlightText(tab.url, query)}</div>
        ${timeInfo}
      </div>
      ${badges}
    </div>
  `;
}

// Switch to a tab
async function switchToTab(tabId, windowId) {
  try {
    console.log('Switching to tab:', tabId, 'in window:', windowId);
    
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(windowId, { focused: true });
    
    console.log('Successfully switched to tab');
    
    window.close();
  } catch (error) {
    console.error('Switch failed:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:#fee;color:#c33;padding:10px;border-radius:4px;z-index:1000;';
    errorDiv.textContent = chrome.i18n.getMessage('switchError') + error.message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }
}

// Navigate selection
function navigateSelection(direction) {
  if (filteredTabs.length === 0) return;

  if (direction === 'up') {
    selectedIndex = selectedIndex <= 0 ? filteredTabs.length - 1 : selectedIndex - 1;
  } else {
    selectedIndex = selectedIndex >= filteredTabs.length - 1 ? 0 : selectedIndex + 1;
  }

  renderTabs();
}

// Select current item
function selectCurrent() {
  if (selectedIndex >= 0 && selectedIndex < filteredTabs.length) {
    const tab = filteredTabs[selectedIndex];
    switchToTab(tab.id, tab.windowId);
  } else if (filteredTabs.length > 0) {
    const tab = filteredTabs[0];
    switchToTab(tab.id, tab.windowId);
  }
}

// Setup event listeners
function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    filterTabs(e.target.value);
  });

  if (sortByWindowBtn) {
    sortByWindowBtn.addEventListener('click', () => switchSortMode('window'));
  }
  if (sortByTimeBtn) {
    sortByTimeBtn.addEventListener('click', () => switchSortMode('time'));
  }

  document.addEventListener('keydown', async (e) => {
    const isSearchFocused = document.activeElement === searchInput;
    
    if (!isSearchFocused && e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('window');
      return;
    }
    if (!isSearchFocused && e.key === '2' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('time');
      return;
    }
    
    if (!isSearchFocused && e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('window');
      return;
    }
    if (!isSearchFocused && e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('time');
      return;
    }
    
    if (!isSearchFocused && e.key === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredTabs.length) {
        const tab = filteredTabs[selectedIndex];
        await togglePinTab(tab.id);
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        navigateSelection('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateSelection('down');
        break;
      case 'Enter':
        e.preventDefault();
        selectCurrent();
        break;
      case 'Escape':
        e.preventDefault();
        window.close();
        break;
    }
  });
}

// Replace i18n placeholders in HTML
function replaceI18nPlaceholders() {
  // Replace text nodes in all elements (including those with child elements)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent;
    
    if (text.includes('__MSG_')) {
      const key = text.trim().replace(/__MSG_|__/g, '');
      const translated = chrome.i18n.getMessage(key);
      if (translated) {
        node.textContent = translated;
      }
    }
  }
  
  // Replace placeholder attributes
  document.querySelectorAll('[placeholder]').forEach(el => {
    const placeholder = el.getAttribute('placeholder');
    if (placeholder.includes('__MSG_')) {
      const key = placeholder.replace(/__MSG_|__/g, '');
      const translated = chrome.i18n.getMessage(key);
      if (translated) {
        el.setAttribute('placeholder', translated);
      }
    }
  });
  
  // Replace title attributes
  document.querySelectorAll('[title]').forEach(el => {
    const title = el.getAttribute('title');
    if (title.includes('__MSG_')) {
      const key = title.replace(/__MSG_|__/g, '');
      const translated = chrome.i18n.getMessage(key);
      if (translated) {
        el.setAttribute('title', translated);
      }
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  replaceI18nPlaceholders();
  init();
});
