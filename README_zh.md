# Article Navigator（文章导航）

> [Obsidian](https://obsidian.md) 社区插件 · [English](README.md)

通过标准 frontmatter 属性为笔记添加**上一篇 / 下一篇 / 相关阅读**导航。支持 VitePress 风格的底部内联导航栏、浮动侧边按钮和自动反向链接，无任何外部依赖。

---

## 功能特性

| 功能 | 说明 |
|---|---|
| **内联导航** | 在每篇笔记底部渲染上一篇/下一篇卡片（阅读视图与源码视图均支持） |
| **浮动侧边按钮** | 在文档区域内显示圆形或全高条形的浮动按钮 |
| **相关阅读列表** | 在笔记顶部或底部渲染相关笔记列表 |
| **自动反向链接** | 设置上一篇/下一篇后，插件自动在目标笔记中维护反向链接 |
| **新笔记初始化** | 新建的空白笔记自动获得三个导航属性 |
| **边缘/点击导航** | 可选：双击页边距或在移动端点击屏幕半侧进行导航 |
| **国际化** | 界面语言自动跟随 Obsidian 的语言设置 |

---

## Demo

![导航至前一篇文章](doc/img/previous-article-demo.png)

![相关阅读演示](doc/img/seealso-demo.png)

![导航至下一篇文章（圆形按钮样式）](doc/img/next-circle-demo.png)

---

## 安装方式

使用插件前，请确保你已经前往 **设置 → 第三方插件** 关闭了**安全模式**，以允许使用社区插件。

### 通过 Obsidian URI 安装

1. 点击此链接：[obsidian://show-plugin?id=article-navigator](obsidian://show-plugin?id=article-navigator)，在 Obsidian 的社区插件浏览器中打开插件页面。
2. 点击 **安装**，然后点击 **启用**。

### 社区插件市场

1. 打开 **设置 → 第三方插件 → 社区插件市场 → 浏览**。
2. 搜索 **Article Navigator**。
3. 点击**安装**，然后点击**启用**。

### 手动安装

1. 从[最新 Release](../../releases/latest) 下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 将三个文件复制到 `<库>/.obsidian/plugins/article-navigator/`。
3. 重启 Obsidian，在**设置 → 社区插件**中启用该插件。

---

## 快速上手

### 第一步：为笔记添加导航属性

打开任意笔记，执行命令：

> **Article Navigator: 为当前笔记插入导航属性**

若属性尚不存在，将自动插入以下三个空键：

```yaml
---
PreviousArticle: ""
NextArticle: ""
SeeAlso: []
---
```

### 第二步：填入链接

用 wikilink 格式填写属性值：

```yaml
PreviousArticle: "[[上一篇笔记]]"
NextArticle: "[[下一篇笔记]]"
SeeAlso:
  - "[[相关主题 A]]"
  - "[[相关主题 B]]"
```

### 第三步：开始导航

- 点击笔记底部的**内联导航卡片**。
- 点击文档边缘的**浮动侧边按钮**。
- 使用命令**跳转到上一篇文章** / **跳转到下一篇文章**（可自定义快捷键）。

---

## 设置项说明

### 显示

| 设置项 | 默认值 | 说明 |
|---|---|---|
| 为新笔记添加属性 | 开启 | 对新建的空白笔记自动添加三个导航属性 |
| 底部内联导航 | 开启 | 显示 VitePress 风格的上一篇/下一篇导航栏 |
| 浮动侧边按钮 | 高条形 | 按钮样式：`关闭`、`圆形`、`高条形` |
| See Also 位置 | 底部 | 相关阅读列表的渲染位置：`顶部`、`底部`、`隐藏` |

### 浮动按钮行为

| 设置项 | 默认值 | 说明 |
|---|---|---|
| 空闲时淡出按钮 | 开启 | 无操作一段时间后将按钮淡化至 12% 不透明度 |
| 空闲淡出延迟 | 3 秒 | 淡出前等待的秒数（1–15） |

### 点击导航

| 设置项 | 默认值 | 说明 |
|---|---|---|
| 双击页边距导航 | 关闭 | 双击内容区两侧空白处跳转上一篇/下一篇 |
| 移动端点击半屏导航 | 关闭 | 在移动端或小屏幕上，点击屏幕左/右半侧进行导航 |

### 自动反向链接

| 设置项 | 默认值 | 说明 |
|---|---|---|
| 启用自动反向链接 | 开启 | 自动在目标笔记中维护对应的反向链接 |
| 冲突处理方式 | 弹窗确认 | 目标已有不同链接时的处理方式：`弹窗确认`、`静默自动更新`、`静默跳过` |

### 属性键名

自定义 frontmatter 属性的键名。修改后仅影响新建的链接，已使用旧键名的笔记不会自动迁移。

| 设置项 | 默认值 |
|---|---|
| 上一篇属性键 | `PreviousArticle` |
| 下一篇属性键 | `NextArticle` |
| See Also 属性键 | `SeeAlso` |

### 显示标签

留空则使用 Obsidian 当前语言的默认值。

| 设置项 | 英文默认 | 中文默认 |
|---|---|---|
| 上一篇标签 | Previous | 上一篇 |
| 下一篇标签 | Next | 下一篇 |
| See Also 标签 | See also | 相关阅读 |

---

## 命令列表

| 命令 | 说明 |
|---|---|
| 跳转到上一篇文章 | 导航到 `PreviousArticle` 对应的笔记 |
| 跳转到下一篇文章 | 导航到 `NextArticle` 对应的笔记 |
| 为当前笔记插入导航属性 | 在当前笔记中添加空的上一篇/下一篇/SeeAlso 属性 |

三条命令均可在**设置 → 快捷键**中绑定自定义键位。

---

## 开发

### 环境要求

- Node.js ≥ 18（推荐 LTS 版本）
- npm

### 初始化

```bash
git clone https://github.com/IvanHanloth/obsidian-article-navigator
cd obsidian-article-navigator
npm install
```

### 脚本命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 监听模式，文件变更时自动重新构建 `main.js` |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run deploy` | 构建并将产物复制到 `test_vault` |
| `npm run deploy -- /path/to/vault` | 构建并部署到指定库路径 |
| `npm run lint` | ESLint 检查（含 Obsidian 专属规则） |
| `npm run version` | 同步升级 `manifest.json` 和 `versions.json` 中的版本号 |

> **提示：** 也可以通过环境变量指定目标库路径：
> ```bash
> VAULT_PATH=/path/to/my-vault npm run deploy
> ```

### 目录结构

```
src/
├── main.ts                 插件生命周期——事件注册、onload / onunload
├── types.ts                共享 TypeScript 类型
├── constants.ts            CSS 类名、定时器毫秒数等常量
├── settings.ts             设置接口、默认值、迁移逻辑
├── settings-tab.ts         设置面板 UI
├── commands.ts             命令注册
├── i18n/
│   ├── index.ts            I18n 类、locale 探测
│   └── locales/
│       ├── en.ts           英文
│       └── zh.ts           中文
├── nav/
│   ├── link-resolver.ts    frontmatter 链接解析与跳转
│   ├── frontmatter.ts      frontmatter 读写工具函数
│   └── auto-backlink.ts    自动反向链接控制器
└── ui/
    ├── view-manager.ts     视图刷新协调
    ├── floating-buttons.ts 浮动上一篇/下一篇按钮
    ├── inline-injections.ts 内联导航栏 + 相关阅读块
    ├── edge-handlers.ts    边缘/移动端点击处理
    └── confirm-modal.ts    确认对话框
```

### 添加语言支持

1. 在 `src/i18n/locales/<语言代码>.ts` 中创建新文件，实现 `src/i18n/index.ts` 中定义的 `Translation` 接口。
2. 在 `src/i18n/index.ts` 的 `BUNDLES` 映射中导入并注册该语言。
3. 将语言代码添加到 `LocaleCode` 联合类型中。

---

## 发布流程

1. 如有需要，更新 `manifest.json` 中的 `minAppVersion`（参考 [Obsidian 版本参考](https://docs.obsidian.md/Reference/Versions)）。
2. 运行 `npm version patch|minor|major`，自动同步 `manifest.json`、`package.json` 和 `versions.json` 中的版本号。
3. 推送 tag 并创建 GitHub Release，将 `main.js`、`manifest.json` 和 `styles.css` 作为 Release 附件上传。

---

## 兼容性

- **最低 Obsidian 版本：** 1.4.0
- **移动端：** ✓ 完全支持（`isDesktopOnly: false`）
- 无外部网络请求，无数据收集。

---

## 许可证

MIT License 
