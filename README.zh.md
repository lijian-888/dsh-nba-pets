# dsh-nba-pets

适用于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 桌面的非官方篮球宠物合集。插件以 DSH `bundle + client` 双声明发布，安装后作为 `shell.overlay` 的加法式浮层运行，不替换会话、侧栏或输入区。

## 功能

- 两个可即时切换的完整角色：`Curry 30` 与原创 `King 23（LeBron 致敬形象）`。
- 复刻 Codex Pets 的核心状态语义及优先级：需要输入 → 受阻 → 已就绪 → 执行中 → 待机。
- 点击宠物打开任务动态，点击任务直接进入对应 DSH 会话。
- 待机投篮、左右拖动跑步、招手、跳跃、受阻、等待、执行中、完成审阅动作。
- 16 向光标追踪；支持拖动、角色/位置/隐藏状态持久化。
- 尊重系统 `prefers-reduced-motion`，减少动态时使用静态帧。
- 两套 `spriteVersionNumber: 2` 图集：8 列 × 11 行、单格 192×208、总尺寸 1536×2288、透明 RGBA WebP。

> DSH 当前 Web 表层中的宠物浮在应用窗口内。浏览器页面本身无法获得跨操作系统窗口的全局置顶权限；若未来 DSH 桌面壳为 `shell.overlay` 提供原生窗口承载，本插件不需要改状态协议。

## 环境

- Node.js 22+
- DeepSeek Harness `0.1.0-rc.5` 至 `<0.2.0`（在 rc.5 源码与 rc.7 发布类型上校验）
- DSH `web` profile

## 安装

### 环境要求

- Node.js 22+ 与 pnpm（`dsh` CLI 会把参数转发给 pnpm）
- DeepSeek Harness `0.1.0-rc.5` 至 `<0.2.0`
- DSH `web` profile（首次添加插件时自动创建）

### 方式一：从 npm 安装（推荐）

插件已发布到公共 npm 仓库，任何 DSH 安装都可用一条命令添加：

```powershell
dsh plugin --profile web add dsh-nba-pets
```

从 DSH 源码 checkout 运行（没有全局 `dsh` 命令时）：

```powershell
cd D:\IDEA-Project\deepseek-harness
corepack pnpm dsh plugin --profile web add dsh-nba-pets
```

首次使用会初始化 profile（自动带上 `@deepseek-ai/dsh-base` 与 Web 应用 bundle），并把 `dsh-nba-pets` 追加到 bundle 列表。

### 方式二：从 GitHub 安装

```powershell
dsh plugin --profile web add github:lijian-888/dsh-nba-pets
```

Git 安装拉取的是源码而非构建产物，pnpm 会执行包的 `prepare` 脚本完成构建。pnpm ≥ 10 默认阻止该构建：把 pnpm 打印的包名写进 profile 的 `pnpm-workspace.yaml`，然后重新执行 `add`：

```yaml
allowBuilds:
  dsh-nba-pets: true
```

只应放行你信任的源码包；必要时可固定提交：`github:lijian-888/dsh-nba-pets#<sha>`。

### 方式三：从本地源码安装

```powershell
git clone https://github.com/lijian-888/dsh-nba-pets.git
cd dsh-nba-pets
npm install
npm run check
dsh plugin --profile web add .
```

### 验证

```powershell
dsh --profile web --dump-config
```

输出中应出现 `# == dsh-nba-pets` 层与 `id: nba-pets` 行，然后启动：

```powershell
dsh --profile web
```

插件浮在 DSH Web 应用窗口内：安装后刷新浏览器页面；如果 DSH 进程已在运行，需要重启让它重新读取 profile 依赖。

### 卸载

```powershell
dsh plugin --profile web remove dsh-nba-pets
```

### 常见问题

- **npm 镜像滞后**：如果使用镜像源（如 `registry.npmmirror.com`），包同步可能落后于官方源。可显式指定官方源安装：`dsh plugin --profile web add dsh-nba-pets --registry=https://registry.npmjs.org`。
- **代理环境变量失效**：`dsh plugin` 会转发给 pnpm，而 pnpm 会读取 `HTTP_PROXY`/`HTTPS_PROXY`。如果这两个变量指向不可达的代理，先取消（或改指向可用代理）再安装。

## 开发与验证

```powershell
npm run build      # 将两个 WebP 图集嵌入 client.js，并生成类型与双入口
npm test           # TypeScript + manifest / 图集 / loader 闭包测试
npm run check      # build + test + npm pack --dry-run
```

浏览器包不从文件系统读取图集；`scripts/embed-assets.mjs` 在构建时将它们写成 data URL。这样插件被 DSH 动态加载时不需要自建 HTTP 路由，也不会受安装目录或 scoped package URL 影响。

## DSH 插件结构

```text
package.json                  dsh.bundle + dsh.client manifest
cordis.patch.yml              插入 nba-pets 插件行
src/index.ts                  Node/Cordis 生命周期入口
src/client/index.ts           shell.overlay 注册入口
src/client/PetOverlay.tsx     宠物、角色面板、拖动、任务状态
src/client/activity.ts        全会话 agent error 观察器
assets/pets/*/spritesheet.webp
```

状态映射：

| DSH 状态 | 宠物动作 | 颜色 |
|---|---|---|
| `pendingInteraction` | 等待输入 | 琥珀色 |
| `lastAgentError` | 受阻/失败 | 红色 |
| `completed` | 完成审阅 | 绿色 |
| `running` | 执行中 | 蓝色 |
| 无活动 | 待机投篮/看向光标 | 灰色 |

## 发布到插件市场

1. 将 `package.json.repository.url` 改成真实仓库地址。
2. 执行 `npm run check`，确认 `npm pack --dry-run` 只包含运行所需文件。
3. 发布 npm：`npm publish --access public`。
4. 在 GitHub 仓库添加主题：`dsh-plugin`、`deepseek-harness`、`desktop-pet`、`basketball`。
5. Release 说明中给出上面的 `dsh plugin --profile web add dsh-nba-pets` 命令和 DSH 兼容范围。

## 法律与素材说明

这是非官方粉丝项目，与 NBA、球队或球员本人无隶属或背书关系。插件不包含 NBA/球队标志。`King 23` 是原创致敬形象，不是精确真人肖像。公开或商业分发前，发布者仍需自行确认姓名、肖像、商标及所在地法律要求。参考素材与生成过程说明见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

代码采用 MIT License；角色美术的再分发仍受上述人格权、商标与素材来源注意事项约束。
