# Chrome Web Store Submission v1.0.7 (English)

## Version Information
- **Version**: 1.0.7
- **Release Date**: 2026-03-25
- **Update Type**: Feature Update

## What's New

### ✨ New Feature: Persistent Search State
- **Remember search query**: Search keyword is preserved when you reopen the popup
- **Remember selection position**: Your last selected tab index is saved
- **Seamless workflow**: Jump to a tab, find it's not the right one, reopen Tab Search and continue from where you left off
- **Smart clearing**: Press `Esc` to close and clear selection, but search query remains

### 🎯 Improvements
- Enhanced user experience for multi-tab browsing
- Reduced repetitive typing for frequent searches
- Faster navigation when iterating through search results

---

## Store Listing Information

### Title (Maximum 75 characters)
Tab Search - Cross Window Tab Manager with PIN

### Short Description (Maximum 132 characters)
Quickly search, PIN, and jump to any tab across all windows. Persistent search + time-based sorting for efficient tab management.

### Detailed Description
🔍 **Tab Search - Cross Window** is a powerful tab manager that helps you find and switch to any tab instantly, even across multiple browser windows.

**Key Features:**

🔍 **NEW: Persistent Search State**
- Search query is remembered when you reopen the popup
- Your last selected position is saved
- Continue searching from where you left off
- No more retyping the same keywords

📌 **PIN Important Tabs**
- Pin your most important tabs to keep them at the top
- Quick toggle with click or `P` key
- Persistent across browser sessions
- Works in both sorting modes

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
- `storage`: To save PIN states, preferences, and search state

Perfect for power users who keep dozens of tabs open across multiple windows!

### Category
Productivity

### Language
English (primary), 中文 (Chinese)

### Privacy Policy
See PRIVACY_POLICY.md

### Support Email
chongxingpcg@gmail.com

### Website
https://github.com/chongxing/chrome-tab-search

---

## Screenshots Required
1. **screenshot-window-mode.jpg** - Main window showing window grouping
2. **screenshot-time-sort.jpg** - Time-based sorting view with PIN feature

---

## Upload Steps

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in and select "Tab Search - Cross Window"
3. Click "Package" tab
4. Upload `chrome-tab-search-store-v1.0.7.zip`
5. Update "Store Listing":
   - Title: Tab Search - Cross Window Tab Manager with PIN
   - Short description: Quickly search, PIN, and jump to any tab across all windows
   - Detailed description: Copy from above
   - Screenshots: Upload both screenshots
6. Click "Submit for review"

---

## Release Notes (GitHub)

```markdown
## v1.0.7 - Persistent Search State

### ✨ New Features
- **Persistent Search Query**: Search keyword is saved and restored when reopening popup
- **Remember Selection**: Last selected tab index is preserved
- **Seamless Browsing**: Jump to tab, check it, reopen Tab Search and continue from same position
- **Smart State Management**: Search query stays, selection clears on Escape

### 🔧 Technical Changes
- Added `lastSearchQuery` variable for tracking search state
- Modified `init()` to restore search query and selection from storage
- Updated `filterTabs()` to async and save query to chrome.storage.local
- Modified `switchToTab()` to save selected index before jumping
- Updated Escape key handler to clear selection index
- Version bump to 1.0.7

### Files Changed
- popup.js: +46 lines (search state persistence logic)
- manifest.json: Version bump to 1.0.7
```
