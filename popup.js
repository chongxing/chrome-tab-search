// Tab Search - Popup Script

let allTabs = [];
let filteredTabs = [];
let selectedIndex = -1;
let windowsMap = new Map();
let tabAccessTimes = {};
let pinnedTabIds = new Set(); // 存储被 PIN 的 tab IDs
let currentSortMode = 'window'; // 'window' or 'time'

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tabList = document.getElementById('tabList');
const stats = document.getElementById('stats');
const sortByWindowBtn = document.getElementById('sortByWindow');
const sortByTimeBtn = document.getElementById('sortByTime');

// Initialize
async function init() {
  try {
    // Load saved sort mode
    if (chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get('sortMode');
      currentSortMode = result.sortMode || 'window';
    } else {
      console.warn('Storage API not available, using default sort mode');
      currentSortMode = 'window';
    }
    updateSortButtons();
    
    await loadTabAccessTimes();
    await loadPinnedTabs(); // 加载 PIN 状态
    await loadAllTabs();
    setupEventListeners();
    searchInput.focus();
  } catch (error) {
    console.error('初始化失败:', error);
    // Fallback: just load tabs without storage
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
    console.error('加载访问时间失败:', error);
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
    console.error('加载PIN状态失败:', error);
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
    console.error('保存PIN状态失败:', error);
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
  
  // Re-sort and re-render
  sortTabs();
  filterTabs(searchInput.value);
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
          // Check if this tab has a recorded access time
          const hasAccessTime = tabAccessTimes.hasOwnProperty(tab.id);
          // If no access time, use 0 (will be sorted to bottom)
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
      // PIN 的 tab 在最前面（即使在窗口模式下也优先）
      const aPinned = pinnedTabIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedTabIds.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      
      if (a.windowId === currentWindowId && b.windowId !== currentWindowId) return -1;
      if (b.windowId === currentWindowId && a.windowId !== currentWindowId) return 1;
      if (a.windowId !== b.windowId) return a.windowId - b.windowId;
      return a.index - b.index;
    });
  } else {
    // Sort by last access time, most recent first
    // PIN 的 tab 永远在最前面
    allTabs.sort((a, b) => {
      const aPinned = pinnedTabIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedTabIds.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      
      // 非 PIN 的 tab 按访问时间排序
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
  
  // Save preference
  try {
    if (chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ sortMode: mode });
    }
  } catch (error) {
    console.error('保存排序模式失败:', error);
  }
  
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
  const pinnedCount = pinnedTabIds.size;
  
  let text = '';
  if (currentSortMode === 'window') {
    if (filteredCount === totalTabs) {
      text = `共 ${windowCount} 个窗口，${totalTabs} 个Tab`;
    } else {
      text = `找到 ${filteredCount} 个结果 (共 ${totalTabs} 个Tab)`;
    }
  } else {
    if (filteredCount === totalTabs) {
      text = `共 ${totalTabs} 个Tab`;
      if (pinnedCount > 0) {
        text += `，${pinnedCount} 个已PIN`;
      }
      text += '，按最近访问排序';
    } else {
      text = `找到 ${filteredCount} 个结果 (共 ${totalTabs} 个Tab)`;
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
      const timeText = tab.hasAccessTime ? formatRelativeTime(tab.accessTime) : '之前已访问';
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
    item.addEventListener('click', (e) => {
      // 如果点击的是 PIN 按钮，不触发跳转
      if (e.target.closest('.pin-btn')) return;
      
      const tabId = parseInt(item.dataset.tabId);
      const windowId = parseInt(item.dataset.windowId);
      switchToTab(tabId, windowId);
    });
  });

  // Add PIN button click handlers
  document.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tabId = btn.dataset.tabId;
      await togglePinTab(tabId);
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
  const isPinned = pinnedTabIds.has(tab.id);
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

  // PIN 按钮
  const pinButton = `<button class="pin-btn ${isPinned ? 'pinned' : ''}" data-tab-id="${tab.id}" title="${isPinned ? '取消PIN' : 'PIN住此标签'}">${isPinned ? '📌' : '📍'}</button>`;

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
  document.addEventListener('keydown', async (e) => {
    // Check if search input is focused
    const isSearchFocused = document.activeElement === searchInput;
    
    // Number keys 1 and 2 for sort mode switching (only when search is not focused)
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
    
    // Arrow keys Left/Right for sort mode switching (only when search is not focused)
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
    
    // 'p' key to toggle PIN on selected tab (only when search is not focused)
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

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
