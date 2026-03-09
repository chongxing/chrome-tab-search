// Tab Search - Popup Script

let allTabs = [];
let filteredTabs = [];
let selectedIndex = -1;
let windowsMap = new Map();
let tabTimestamps = {};
let currentSortMode = 'window'; // 'window' or 'time'

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tabList = document.getElementById('tabList');
const stats = document.getElementById('stats');
const sortByWindowBtn = document.getElementById('sortByWindow');
const sortByTimeBtn = document.getElementById('sortByTime');

// Initialize
async function init() {
  // Load saved sort mode
  const result = await chrome.storage.local.get('sortMode');
  currentSortMode = result.sortMode || 'window';
  updateSortButtons();
  
  await loadTabTimestamps();
  await loadAllTabs();
  setupEventListeners();
  searchInput.focus();
}

// Load tab timestamps from storage
async function loadTabTimestamps() {
  try {
    const result = await chrome.storage.local.get('tabTimestamps');
    tabTimestamps = result.tabTimestamps || {};
    console.log('Loaded timestamps:', Object.keys(tabTimestamps).length);
  } catch (error) {
    console.error('加载时间戳失败:', error);
    tabTimestamps = {};
  }
}

// Load all tabs from all windows
async function loadAllTabs() {
  try {
    // Get all windows with their tabs
    const windows = await chrome.windows.getAll({ populate: true });
    console.log('Loaded windows:', windows.length);
    
    allTabs = [];
    windowsMap.clear();
    
    // Get current window for sorting
    const currentWindow = await chrome.windows.getCurrent();
    
    windows.forEach((window, index) => {
      const isFocused = window.id === currentWindow.id;
      
      // Use active tab title as window name
      const activeTab = window.tabs?.find(t => t.active);
      const windowName = activeTab ? (activeTab.title || '未命名窗口') : '未命名窗口';
      
      windowsMap.set(window.id, {
        index: index + 1,
        focused: isFocused,
        tabCount: window.tabs?.length || 0,
        name: windowName
      });
      
      if (window.tabs) {
        window.tabs.forEach(tab => {
          // Get timestamp for this tab, fallback to current time if not recorded
          const timestamp = tabTimestamps[tab.id] || Date.now();
          
          allTabs.push({
            ...tab,
            windowIndex: index + 1,
            windowFocused: isFocused,
            openTime: timestamp
          });
        });
      }
    });

    console.log('Total tabs loaded:', allTabs.length);

    // Sort based on current mode
    sortTabs();

    filteredTabs = [...allTabs];
    updateStats();
    renderTabs();
    
    // Debug: show window count in UI
    console.log('Debug - Windows found:', windowsMap.size, 'Tabs total:', allTabs.length);
    
  } catch (error) {
    console.error('加载Tab失败:', error);
    tabList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <div class="no-results-text">加载失败</div>
        <div style="font-size:12px;color:#888;margin-top:8px;">${error.message}</div>
      </div>
    `;
  }
}

// Sort tabs based on current mode
function sortTabs() {
  if (currentSortMode === 'window') {
    // Sort: current window first, then by window id, then by tab index
    const currentWindow = Array.from(windowsMap.values()).find(w => w.focused);
    const currentWindowId = currentWindow ? 
      Array.from(windowsMap.entries()).find(([_, v]) => v.focused)?.[0] : null;
    
    allTabs.sort((a, b) => {
      if (a.windowId === currentWindowId && b.windowId !== currentWindowId) return -1;
      if (b.windowId === currentWindowId && a.windowId !== currentWindowId) return 1;
      if (a.windowId !== b.windowId) return a.windowId - b.windowId;
      return a.index - b.index;
    });
  } else {
    // Sort by open time, most recent first
    allTabs.sort((a, b) => b.openTime - a.openTime);
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
  
  // Save preference
  await chrome.storage.local.set({ sortMode: mode });
  
  updateSortButtons();
  sortTabs();
  
  // Re-apply current filter
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
    return '刚刚';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}分钟前`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}小时前`;
  } else if (diff < 2 * day) {
    const date = new Date(timestamp);
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diff < week) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date(timestamp);
    return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

// Update statistics
function updateStats() {
  const windowCount = windowsMap.size;
  const totalTabs = allTabs.length;
  const filteredCount = filteredTabs.length;
  
  if (currentSortMode === 'window') {
    if (filteredCount === totalTabs) {
      stats.textContent = `共 ${windowCount} 个窗口，${totalTabs} 个Tab`;
    } else {
      stats.textContent = `找到 ${filteredCount} 个结果 (共 ${totalTabs} 个Tab)`;
    }
  } else {
    if (filteredCount === totalTabs) {
      stats.textContent = `共 ${totalTabs} 个Tab，按打开时间排序`;
    } else {
      stats.textContent = `找到 ${filteredCount} 个结果 (共 ${totalTabs} 个Tab)`;
    }
  }
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
        <div class="no-results-text">未找到匹配的Tab</div>
      </div>
    `;
    return;
  }
  
  // Debug info
  console.log('Rendering tabs:', filteredTabs.length, 'mode:', currentSortMode);

  const query = searchInput.value;
  let html = '';

  if (currentSortMode === 'window') {
    // Group tabs by window
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
            <span title="${escapeHtml(windowInfo.name || '')}">窗口 ${windowInfo.index}${windowInfo.name ? ' - ' + escapeHtml(windowInfo.name.substring(0, 30)) + (windowInfo.name.length > 30 ? '...' : '') : ''} ${isCurrentWindow ? '(当前)' : ''}</span>
            <span class="window-tabs-count">${tabs.length} 个Tab</span>
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
    // Time sort mode - flat list with time info
    html += '<div class="time-list">';
    
    filteredTabs.forEach((tab, index) => {
      const timeText = formatRelativeTime(tab.openTime);
      html += renderTabItem(tab, query, timeText, index);
    });
    
    html += '</div>';
  }

  tabList.innerHTML = html;

  // Add error handlers for images
  document.querySelectorAll('.tab-icon[data-fallback="true"]').forEach(img => {
    img.addEventListener('error', function() {
      this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E📄%3C/text%3E%3C/svg%3E";
    });
  });

  // Add click handlers
  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = parseInt(item.dataset.tabId);
      const windowId = parseInt(item.dataset.windowId);
      switchToTab(tabId, windowId);
    });
  });

  // Scroll selected into view
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
  const favicon = tab.favIconUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E📄%3C/text%3E%3C/svg%3E";

  let badges = '';
  if (tab.active || tab.audible) {
    badges = '<div class="tab-badges">';
    if (tab.active) badges += '<span class="tab-badge active">当前</span>';
    if (tab.audible) badges += '<span class="tab-badge audible">🔊</span>';
    badges += '</div>';
  }
  
  // Add time info for time sort mode
  let timeInfo = '';
  if (timeText) {
    timeInfo = `<div class="tab-time">${timeText}</div>`;
  }

  return `
    <div class="tab-item ${isActive} ${isSelected}" data-index="${index}" data-tab-id="${tab.id}" data-window-id="${tab.windowId}">
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
    
    // First update the tab to be active
    await chrome.tabs.update(tabId, { active: true });
    
    // Then focus the window containing this tab
    await chrome.windows.update(windowId, { focused: true });
    
    console.log('Successfully switched to tab');
    
    // Close the popup
    window.close();
  } catch (error) {
    console.error('跳转失败:', error);
    // Show error in UI
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:#fee;color:#c33;padding:10px;border-radius:4px;z-index:1000;';
    errorDiv.textContent = '跳转失败: ' + error.message;
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
    // If nothing selected but there are results, select the first one
    const tab = filteredTabs[0];
    switchToTab(tab.id, tab.windowId);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', (e) => {
    filterTabs(e.target.value);
  });

  // Sort buttons
  if (sortByWindowBtn) {
    sortByWindowBtn.addEventListener('click', () => switchSortMode('window'));
  }
  if (sortByTimeBtn) {
    sortByTimeBtn.addEventListener('click', () => switchSortMode('time'));
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Number keys 1 and 2 for sort mode switching
    if (e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('window');
      return;
    }
    if (e.key === '2' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      switchSortMode('time');
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

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
