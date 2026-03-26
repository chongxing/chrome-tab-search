# Tab Search 开发维护记录

> 记录 Tab Search Chrome 扩展的开发、维护过程及相关决策。

---

## 2026-03-26 维护记录

### 1. Chrome Web Store 链接检查

**背景**：用户分享 Chrome Web Store 链接，建议放到 README 方便用户找到。

**检查结果发现**：README 中已存在该链接，出现在以下位置：
- "方式一：Chrome Web Store 安装（推荐）" 部分
- "🌐 Chrome Web Store" 版本状态表格
- "📣 推荐文案" 分享段落

**链接**：
```
https://chromewebstore.google.com/detail/anegolpfjipjfddbddlmfblpdbiianka?utm_source=item-share-cb
```

**结论**：无需修改，链接已存在且位置合理。

---

### 2. 商店上传资料本地化管理

**问题**：Chrome Web Store 上传所需的资料（提交文档、截图、打包文件等）不需要同步到 GitHub，这些只对开发者有用，与普通用户无关。

**解决方案**：

1. **创建本地专用文件夹**
   ```
   chrome-tab-search/chrome-store-assets/
   ```

2. **移入文件夹的内容**（仅本地保留，不上传 GitHub）
   - 商店提交文档：`CHROME_WEB_STORE_*.md`, `STORE_UPDATE_*.md`
   - 打包文件：`chrome-tab-search-store-*.zip`
   - 商店截图：`screen*.png`, `screenshot-*.jpg`（除 README 引用的两张）
   - 生成脚本：`generate_icons.py`, `convert_screenshots.py`

3. **更新 .gitignore**
   ```gitignore
   # Chrome Web Store assets (local only)
   chrome-store-assets/
   ```

4. **保留的文件**（README 展示需要）
   - `screenshot-window-mode.jpg` - README 主截图
   - `screenshot-time-sort.jpg` - 时间排序功能截图

5. **Git 操作**
   - `git rm --cached` 删除已追踪的商店相关文件
   - `git commit` 提交变更
   - `git push` 推送到 GitHub

**结果**：从 GitHub 删除了 21 个商店相关文件，仓库更干净，只保留核心代码和 README 展示所需的截图。

**后续操作**：以后上传 Chrome Web Store 需要的资料直接放 `chrome-store-assets/` 目录，不会同步到 GitHub。

---

### 3. README 安装说明更新

**问题**：README 中方式二的 zip 下载链接指向的文件已移到 `chrome-store-assets/`，链接失效。

**修改内容**：

**修改前**：
```markdown
### 方式二：下载安装

1. **下载** → [`chrome-tab-search-store-v1.0.7.zip`](./chrome-tab-search-store-v1.0.7.zip)（最新版）
2. **解压** → 将 ZIP 解压到任意文件夹
3. **安装** → 打开 Chrome，访问 `chrome://extensions/`
4. **开启开发者模式** → 打开右上角开关
5. **加载扩展** → 点击「**加载已解压的扩展程序**」，选择解压后的文件夹
```

**修改后**：
```markdown
### 方式二：源码安装

1. **克隆仓库** → 
   ```bash
   git clone https://github.com/chongxing/chrome-tab-search.git
   ```
2. **安装** → 打开 Chrome，访问 `chrome://extensions/`
3. **开启开发者模式** → 打开右上角开关
4. **加载扩展** → 点击「**加载已解压的扩展程序**」，选择克隆后的 `chrome-tab-search` 文件夹
```

**同时更新**：文件说明部分去掉了 `chrome-tab-search-store-v1.0.7.zip` 的引用。

**Git 提交**：`docs: update install instructions to use git clone instead of zip download`

---

### 4. Esc 键清除选中位置问题

**需求**：按 Esc 关闭插件时清除选中位置（但保留搜索关键字）。

**问题分析**：
- 代码中已实现该逻辑：
  ```javascript
  case 'Escape':
    e.preventDefault();
    await chrome.storage.local.set({ lastSelectedIndex: -1 });
    window.close();
    break;
  ```
- **但 Chrome 会拦截 Esc 键来关闭 popup**，导致 JS 事件可能捕获不到，保存操作没执行。

**尝试方案 1**：使用 `setTimeout` 延迟关闭
```javascript
setTimeout(() => window.close(), 10);
```

**讨论的其他方案**：

| 快捷键 | 说明 |
|--------|------|
| `Ctrl+.` / `⌘+.` | 类似 iOS "取消"手势，不易冲突 |
| `Q`（搜索框未聚焦时）| 单键退出 |
| `Backspace`（搜索框为空时）| 回退关闭 |
| `visibilitychange` 事件 | 在 popup 隐藏时自动清理 |

**最终决策**：用户决定"先不用了"，暂时保持现状。

---

## 历史记录

### 2026-03-25 及之前

- v1.0.7 版本开发完成
- 新增功能：搜索状态保持（记住搜索关键字和选中位置）
- 商店截图和提交文档准备
- README 中文版完善

---

## 常用命令

```bash
# 进入项目目录
cd chrome-tab-search/

# 查看状态
git status

# 提交变更
git add .
git commit -m "描述"
git push origin main

# 打包商店版本（如需要）
zip -r chrome-tab-search-store-v1.0.x.zip manifest.json popup.html popup.js styles.css icons/ _locales/ PRIVACY_POLICY.md
```

---

## 注意事项

1. **商店资料管理**：所有 Chrome Web Store 相关资料放 `chrome-store-assets/`，不提交 GitHub
2. **截图保留**：README 引用的 `screenshot-window-mode.jpg` 和 `screenshot-time-sort.jpg` 必须保留在项目根目录
3. **版本号更新**：发布新版本时记得同步更新 README 中的版本表格

---

*最后更新：2026-03-26*
