# Tab Search - Cross Window

一个 Chrome 浏览器扩展，帮助你在所有窗口中快速搜索并跳转到指定的 Tab。

## ✨ 功能特点

- **🔍 跨窗口搜索**：在所有 Chrome 窗口中搜索 Tab，不只是当前窗口
- **⚡ 实时过滤**：输入关键词即时过滤 Tab 标题和 URL
- **🎯 一键跳转**：选中后自动聚焦窗口并激活 Tab
- **⌨️ 键盘导航**：
  - `Ctrl+Shift+T`（Mac: `⌘+Shift+T`）快速打开
  - `↑/↓` 上下选择
  - `Enter` 跳转
  - `Esc` 关闭
- **🪟 智能分组**：按窗口分组显示，当前窗口优先
- **🔊 状态标识**：显示当前 Tab、播放声音的 Tab

## 📦 安装方法

### 方法一：直接下载安装（推荐，无需 Chrome Web Store）

1. 下载 [`chrome-tab-search-store.zip`](./chrome-tab-search-store.zip)
2. 解压 ZIP 文件到任意文件夹
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启右上角「**开发者模式**」（Developer mode）
5. 点击「**加载已解压的扩展程序**」（Load unpacked）
6. 选择解压后的文件夹
7. 完成！插件图标会出现在浏览器工具栏

### 方法二：开发者模式安装（使用源码）

1. 克隆本仓库或下载源码
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角「**开发者模式**」
4. 点击「**加载已解压的扩展程序**」
5. 选择 `chrome-tab-search` 文件夹

### 固定到工具栏（推荐）

1. 点击 Chrome 工具栏的拼图图标 (🧩)
2. 找到 "Tab Search - Cross Window"
3. 点击图钉图标 📌 将其固定到工具栏

## 🚀 使用方法

| 操作 | 说明 |
|------|------|
| 打开搜索 | 点击插件图标或按 `Ctrl+Shift+T` |
| 搜索 Tab | 输入关键词（标题或 URL） |
| 选择结果 | 使用 `↑/↓` 键或鼠标点击 |
| 跳转 | 按 `Enter` 或点击结果 |
| 关闭 | 按 `Esc` 或点击外部 |

## 📁 文件结构

```
chrome-tab-search/
├── manifest.json          # 扩展配置
├── popup.html             # 弹窗界面
├── popup.js               # 核心逻辑
├── styles.css             # 界面样式
├── icons/
│   ├── icon-16.png        # 16x16 图标
│   ├── icon-48.png        # 48x48 图标
│   └── icon-128.png       # 128x128 图标
├── chrome-tab-search-store.zip  # Chrome Web Store 发布包
├── PRIVACY_POLICY.md      # 隐私政策
└── README.md              # 本文件
```

## 🔒 权限说明

本插件需要以下权限：
- `tabs`：读取所有窗口的 Tab 信息
- `activeTab`：激活选中的 Tab

所有数据均在本地处理，不会上传任何信息。

## 📝 快捷键设置

如需修改快捷键：
1. 打开 `chrome://extensions/`
2. 点击左侧「**键盘快捷键**」
3. 找到「Tab Search」进行修改

## 🔗 相关链接

- **隐私政策**: [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) | [在线查看](https://chongxing.github.io/chrome-tab-search/PRIVACY_POLICY.md)
- **Chrome Web Store**: （审核通过后更新）

## 🛠️ 技术信息

- Manifest V3 标准
- 纯原生 JavaScript，无外部依赖
- 轻量级设计，快速响应

## 📸 截图

![Tab Search 截图](./screenshot-1280x800.jpg)

---

Made with ❤️ for multi-window users
