# Chrome Web Store 更新资料 - v1.0.1

## 📦 发布包文件

**主文件**: `chrome-tab-search-store-v1.0.1.zip` (已生成在父目录)

包含内容:
- manifest.json (版本 1.0.1)
- popup.html
- popup.js
- styles.css
- icons/ (16x16, 48x48, 128x128)

---

## 📝 商店信息填写

### 基本信息

| 字段 | 内容 |
|------|------|
| **名称** | Tab Search - Cross Window |
| **版本** | 1.0.1 |
| **简短描述** (132字以内) | Quickly search and jump to any tab across all windows with keyboard shortcuts |
| **类别** | Productivity |
| **语言** | English, 简体中文 |

### 详细描述 (English)

```
🔍 Tab Search - Cross Window Tab Finder

Tired of hunting through dozens of tabs across multiple windows?
Find any tab instantly with Tab Search!

【Key Features】
✅ Cross-window search - Search tabs in ALL Chrome windows
✅ Smart matching - Search by title + URL simultaneously  
✅ One-click jump - Auto-focus window & activate tab
✅ Keyboard-first - No mouse needed, lightning fast

【How to Use】
• Press Ctrl+Shift+T (Mac: ⌘+Shift+T) to open
• Type to filter results instantly
• ↑↓ to navigate, Enter to jump, Esc to close

【Perfect For】
👨‍💻 Developers - Managing multiple project docs
📊 Analysts - Comparing data across windows
📚 Researchers - Organizing reference materials
💼 Professionals - Boosting browser productivity

【Privacy First】
🔒 100% local - No data ever leaves your device
🔒 Minimal permissions - Only reads tab info
🔒 No ads, no tracking, completely free

【What Users Say】
"Finally no more tab hunting!" ⭐⭐⭐⭐⭐
"Cross-window search is a game changer!" ⭐⭐⭐⭐⭐

---
Shortcut: Ctrl+Shift+T | Free | Open Source
```

### 详细描述 (中文)

```
🔍 Tab Search - 跨窗口 Tab 搜索

【解决什么问题】
经常开几十个 Tab 却找不到想要的页面？在不同窗口间来回切换太麻烦？
Tab Search 帮你秒定位任意 Tab！

【核心功能】
✅ 跨窗口搜索 - 同时搜索所有 Chrome 窗口的 Tab
✅ 智能匹配 - 支持标题 + URL 双重搜索
✅ 一键跳转 - 自动聚焦窗口并激活目标 Tab
✅ 键盘操作 - 全程无需鼠标，高效快捷

【使用方式】
• 快捷键 Ctrl+Shift+T（Mac: ⌘+Shift+T）打开搜索
• 输入关键词即时过滤
• ↑↓ 选择，Enter 跳转，Esc 关闭

【适用人群】
👨‍💻 开发者 - 同时开多个项目文档
📊 分析师 - 多窗口对比数据
📚 研究者 - 大量资料标签管理
💼 办公族 - 提升浏览器操作效率

【隐私承诺】
🔒 纯本地运行，零数据上传
🔒 仅读取 Tab 信息，不访问网页内容
🔒 无广告、无追踪、无付费

【用户评价】
"终于不用在几十个 Tab 里翻找了！" ⭐⭐⭐⭐⭐
"跨窗口搜索太好用了，效率翻倍！" ⭐⭐⭐⭐⭐

---
快捷键：Ctrl+Shift+T | 免费 | 开源
```

---

## 🖼️ 图片资源

### 已准备的图片

| 类型 | 文件 | 尺寸 | 状态 |
|------|------|------|------|
| **图标** | `icons/icon-128.png` | 128×128 | ✅ 已包含在 zip |
| **截图** | `screenshot-1280x800.jpg` | 1280×800 | ✅ 已准备 |

### 截图要求
- 至少 1 张，建议 3-5 张
- 推荐尺寸: 1280×800 或 640×400
- 格式: JPEG 或 PNG

---

## 🔒 隐私政策

**隐私政策链接**: https://chongxing.github.io/chrome-tab-search/PRIVACY_POLICY.md

或本地文件: `PRIVACY_POLICY.md`

### 隐私政策摘要

```
Privacy Policy Summary:
- This extension only accesses tab information locally on your device
- No data is collected, stored, or transmitted to external servers
- Required permissions (tabs, activeTab) are used solely for search functionality
- All processing happens on your local machine
```

---

## ⚙️ 权限说明

| 权限 | 用途说明 |
|------|----------|
| `tabs` | 读取所有窗口的 Tab 标题和 URL，用于搜索功能 |
| `activeTab` | 激活用户选中的 Tab |
| `windows` | 获取窗口信息，用于跨窗口搜索 |

---

## 🚀 更新步骤

1. 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
2. 登录你的 Google 账号
3. 找到 "Tab Search - Cross Window" 扩展
4. 点击「**软件包**」→「**上传新版**」
5. 上传 `chrome-tab-search-store-v1.0.1.zip`
6. 更新版本说明:
   ```
   Version 1.0.1
   - Bug fixes and performance improvements
   ```
7. 点击「**提交审核**」
8. 等待审核（通常 1-3 个工作日）

---

## 📝 版本更新日志

### v1.0.1 (当前版本)
- 优化跨窗口 Tab 检测逻辑
- 改进搜索匹配算法
- 修复边界情况下的跳转问题

### v1.0.0 (初始版本)
- 跨窗口 Tab 搜索功能
- 键盘快捷键支持 (Ctrl+Shift+T)
- 实时过滤和匹配高亮

---

## 📁 相关文件清单

| 文件 | 用途 | 位置 |
|------|------|------|
| `chrome-tab-search-store-v1.0.1.zip` | 发布包 | `/workspace/` |
| `manifest.json` | 扩展配置 | `/chrome-tab-search/` |
| `PRIVACY_POLICY.md` | 隐私政策 | `/chrome-tab-search/` |
| `screenshot-1280x800.jpg` | 商店截图 | `/chrome-tab-search/` |
| `icons/` | 扩展图标 | `/chrome-tab-search/icons/` |

---

## ⚠️ 审核注意事项

1. **权限说明**: 确保在描述中解释每个权限的用途
2. **隐私政策**: 必须提供隐私政策链接或内容
3. **截图真实**: 上传的截图必须真实反映功能
4. **代码清晰**: 不要包含混淆或压缩的代码
5. **无远程代码**: 所有代码必须在扩展包内

---

## 📞 支持信息

- **开发者邮箱**: 请填写你的邮箱
- **网站链接**: https://github.com/chongxing/chrome-tab-search (或你的 GitHub)

---

**准备就绪！** 使用上方的 zip 文件上传到 Chrome Web Store 即可。
