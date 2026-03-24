# Chrome Web Store Submission v1.0.6

## Version Information
- **Version**: 1.0.6
- **Release Date**: 2026-03-20
- **Update Type**: Feature Update

## What's New in v1.0.6

### ✨ New Feature: PIN Tabs
- **PIN functionality**: Pin important tabs to keep them at the top of your tab list
- **Visual indicator**: Pinned tabs show a 📌 icon and have an orange highlight
- **Quick toggle**: Click the PIN button or press `P` to pin/unpin any tab
- **Persistent**: PIN state is saved and persists across browser sessions
- **Works in both modes**: Pinned tabs appear first in both Window and Time sort modes

### 🎯 Improvements
- Enhanced tab sorting with PIN priority
- Updated statistics to show pinned tab count
- Added keyboard shortcut hint for PIN function

## Store Listing Information

### Title (Maximum 75 characters)
Tab Search - Cross Window Tab Manager with PIN

### Short Description (Maximum 132 characters)
Quickly search, PIN, and jump to any tab across all windows. Time-based sorting + PIN feature for important tabs.

### Detailed Description
🔍 **Tab Search - Cross Window** is a powerful tab manager that helps you find and switch to any tab instantly, even across multiple browser windows.

**Key Features:**

📌 **NEW: PIN Important Tabs**
- Pin your most important tabs to keep them at the top
- Quick toggle with click or `P` key
- Persistent across browser sessions
- Works in both sorting modes

🔍 **Cross-Window Search**
- Search through ALL tabs across ALL windows instantly
- Fuzzy search by title or URL
- Highlighted matching text

🪟 **Two Sorting Modes**
- **Window Mode**: Group tabs by window with current window first
- **Time Mode**: Sort by last accessed time, most recent first

⚡ **Lightning Fast**
- Keyboard shortcut: Ctrl+Shift+T (Cmd+Shift+T on Mac)
- Arrow keys to navigate, Enter to jump
- Instant search with no delay

🎨 **Clean & Modern UI**
- Beautiful, distraction-free interface
- Window grouping with clear visual hierarchy
- Active tab and audible tab indicators

**Privacy:**
- No data collection or tracking
- All data stays on your device
- Only accesses tab information you can already see

**Permissions:**
- `tabs`: To search and switch between tabs
- `windows`: To find tabs across all windows
- `storage`: To save PIN states and preferences

Perfect for power users who keep dozens of tabs open across multiple windows!

### Category
Productivity

### Language
English (primary), 中文 (Chinese)

### Screenshots Required
1. **screenshot-window-mode.jpg** - Main window showing window grouping
2. **screenshot-time-sort.jpg** - Time-based sorting view with PIN feature

### Promotional Images
- Small: 440x280 (optional)
- Large: 1400x560 (optional)

### Privacy Policy
See PRIVACY_POLICY.md

### Support Email
[Your email]

### Website
[Your website/GitHub]

## Package Contents
```
chrome-tab-search-store-v1.0.6.zip
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── background.js
├── PRIVACY_POLICY.md
└── icons/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

## Testing Checklist
- [x] Search functionality works across windows
- [x] Window sorting mode displays correctly
- [x] Time sorting mode displays correctly
- [x] PIN button appears on all tabs
- [x] Clicking PIN button toggles pin state
- [x] Pinned tabs appear at top in both modes
- [x] PIN state persists after browser restart
- [x] Keyboard shortcut `P` toggles PIN
- [x] Keyboard shortcut `1` switches to window mode
- [x] Keyboard shortcut `2` switches to time mode
- [x] Arrow keys navigate tab list
- [x] Enter jumps to selected tab
- [x] Escape closes popup
- [x] Extension icon displays correctly
- [x] No console errors

## Chrome Web Store Developer Dashboard
1. Go to https://chrome.google.com/webstore/devconsole
2. Select "Tab Search - Cross Window"
3. Click "Package" tab
4. Upload `chrome-tab-search-store-v1.0.6.zip`
5. Update "Detailed description" if needed
6. Add new screenshot showing PIN feature
7. Submit for review

## GitHub Release Notes
```markdown
## v1.0.6 - PIN Feature Release

### ✨ New Features
- **PIN Tabs**: Pin important tabs to keep them at the top of your list
- **Visual indicators**: Pinned tabs show 📌 icon with orange highlight
- **Keyboard shortcut**: Press `P` to toggle PIN on selected tab
- **Persistent state**: PINs survive browser restarts

### 🔧 Technical Changes
- Added `pinnedTabIds` Set for tracking pinned tabs
- Updated `sortTabs()` to prioritize pinned tabs
- Added `loadPinnedTabs()` and `savePinnedTabs()` functions
- New CSS styles for PIN button and pinned tab styling
- Updated stats display to show pinned count

### Files Changed
- popup.js: +107 lines (PIN logic, sorting, keyboard handler)
- popup.html: Updated shortcut hint
- styles.css: +41 lines (PIN styles)
- manifest.json: Version bump to 1.0.6
```
