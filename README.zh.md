# 🏀 dsh-nba-pets

[English / 中英双语 README](./README.md) · **简体中文**

[![npm version](https://img.shields.io/npm/v/dsh-nba-pets?logo=npm&color=cb3837)](https://www.npmjs.com/package/dsh-nba-pets)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin-4f46e5)](https://github.com/deepseek-ai/deepseek-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](./LICENSE)

> 把篮球赛场带进 DeepSeek Harness：让 Curry 30 在待机时练习投篮，一键切换 King 23，用宠物动作直观掌握 AI 任务状态。

`dsh-nba-pets` 是专为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 打造的篮球桌面宠物合集。它不会替换会话、侧栏或输入区，只是在 DSH 中增加一个能表达任务状态、也能陪你工作的篮球伙伴。

## 亮点

- **两个角色随时切换**：Curry 30 与原创 King 23 致敬形象。
- **一眼看懂 AI 进度**：需要输入、受阻、已就绪、执行中和待机分别使用不同动作。
- **不只是装饰**：点击宠物即可查看活动任务，并直接进入对应 DSH 会话。
- **真正适合长期陪伴**：支持自由拖动、角色与位置记忆、收起和唤醒。
- **丰富篮球动作**：待机投篮、跑步、招手、跳跃、等待、受阻、工作、审阅及 16 向光标追踪。
- **尊重系统设置**：开启“减少动态效果”后自动改用静态帧。

## 一分钟安装

环境要求：Node.js 22+、DeepSeek Harness `0.1.0-rc.5` 至 `<0.2.0`。首次安装时会自动创建 DSH `web` profile。

### 方式一：npm 一键安装——最简单、最推荐

已经可以使用 `dsh` 命令的用户，只需执行：

```powershell
dsh plugin --profile web add dsh-nba-pets
```

这会从公共 npm 仓库安装已经构建和测试过的版本，适合绝大多数用户。

### 方式二：从 DSH 源码目录安装——适合 DSH 开发者

如果你直接从 DeepSeek Harness 源码运行，没有全局 `dsh` 命令：

```powershell
cd D:\IDEA-Project\deepseek-harness
corepack pnpm dsh plugin --profile web add dsh-nba-pets
```

### 方式三：从 GitHub 安装——体验仓库最新代码

```powershell
dsh plugin --profile web add github:lijian-888/dsh-nba-pets
```

GitHub 安装会在本地构建源码。pnpm 10 及以上版本首次可能要求放行构建：把下面内容加入 profile 的 `pnpm-workspace.yaml`，再重新执行安装命令。

```yaml
allowBuilds:
  dsh-nba-pets: true
```

如需稳定复现，建议固定可信提交：

```powershell
dsh plugin --profile web add github:lijian-888/dsh-nba-pets#<commit-sha>
```

## 启动与验证

安装后重启 DSH，让它重新读取 profile，然后启动 Web profile：

```powershell
dsh --profile web
```

刷新页面后，Curry 30 会出现在 DSH 中。点击宠物即可切换角色或查看任务动态。

验证插件是否写入配置：

```powershell
dsh --profile web --dump-config
```

输出中应包含 `# == dsh-nba-pets` 和 `id: nba-pets`。

如果 npm 镜像尚未同步新版本，可直接指定官方源：

```powershell
dsh plugin --profile web add dsh-nba-pets --registry=https://registry.npmjs.org
```

## 卸载

```powershell
dsh plugin --profile web remove dsh-nba-pets
```

## 本地开发安装

```powershell
git clone https://github.com/lijian-888/dsh-nba-pets.git
cd dsh-nba-pets
npm install
npm run check
dsh plugin --profile web add .
```

常用开发命令：

```powershell
npm run build
npm test
npm run check
```

构建过程会把两套 1536×2288 RGBA WebP v2 动画图集直接嵌入 DSH 客户端包，安装后不依赖本地素材路径或额外的 HTTP 服务。

## 状态规则

任务优先级遵循 Codex Pets 的状态语义：

| DSH 状态 | 宠物表现 | 优先级 |
|---|---|---:|
| `pendingInteraction` | 等待用户输入 | 1 |
| `lastAgentError` | 显示受阻或错误动作 | 2 |
| `completed` | 显示已就绪或审阅动作 | 3 |
| `running` | 显示任务执行动作 | 4 |
| 无活动 | 投篮待机或看向光标 | 5 |

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

## 声明

这是非官方粉丝项目，与 NBA、任何球队或球员本人无隶属或背书关系。插件不包含 NBA 或球队标志。King 23 是原创致敬形象，并非真人精确肖像。详细说明见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

宠物浮动在 DSH Web 应用窗口内；浏览器插件无法创建跨操作系统窗口的全局置顶宠物。

代码采用 MIT License。角色美术的再分发仍受上述人格权、商标与素材来源注意事项约束。

如果这个插件让你的 DSH 工作区更有趣，欢迎点一个 ⭐。
