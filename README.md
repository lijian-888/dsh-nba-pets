# dsh-nba-pets

An unofficial basketball desktop-pet collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It ships as a proper DSH bundle and Web client plugin and contributes an additive `shell.overlay` entry.

Features include Curry 30 and the original King 23 tribute character, instant character switching, draggable/persisted placement, wake/tuck-away controls, a task activity tray, reduced-motion support, idle shooting, task-state animations, and 16-direction pointer tracking. Task priority follows Codex Pets: Needs input → Blocked → Ready → Running → Idle.

## Installation

### Prerequisites

- Node.js 22+ with pnpm (the `dsh` CLI forwards to pnpm)
- DeepSeek Harness `0.1.0-rc.5` to `<0.2.0`
- A DSH `web` profile (created automatically the first time you add a plugin)

### Option 1 — Install from npm (recommended)

The plugin is published to the public npm registry, so any DSH installation can add it with one command:

```sh
dsh plugin --profile web add dsh-nba-pets
```

Running DSH from a source checkout (no global `dsh` binary):

```powershell
cd D:\IDEA-Project\deepseek-harness
corepack pnpm dsh plugin --profile web add dsh-nba-pets
```

The first use initializes the profile (`@deepseek-ai/dsh-base` plus the Web app bundle) and appends `dsh-nba-pets` to its bundle list.

### Option 2 — Install from GitHub

```sh
dsh plugin --profile web add github:lijian-888/dsh-nba-pets
```

A git install fetches sources, not built artifacts, so pnpm runs the package's `prepare` script to build them. pnpm ≥ 10 blocks that build until you allow it: copy the exact package key pnpm prints into the profile's `pnpm-workspace.yaml`, then re-run the `add`:

```yaml
allowBuilds:
  dsh-nba-pets: true
```

Only allow packages whose source you trust, and consider pinning a commit (`github:lijian-888/dsh-nba-pets#<sha>`).

### Option 3 — Install from a local checkout

```sh
git clone https://github.com/lijian-888/dsh-nba-pets.git
cd dsh-nba-pets
npm install
npm run check
dsh plugin --profile web add .
```

### Verify

```sh
dsh --profile web --dump-config
```

The output must include a `# == dsh-nba-pets` layer with an `id: nba-pets` row. Then boot:

```sh
dsh --profile web
```

The pets float inside the DSH Web application: refresh the browser page after installing, and restart an already-running DSH process so it re-reads the profile.

### Uninstall

```sh
dsh plugin --profile web remove dsh-nba-pets
```

### Troubleshooting

- **npm registry mirror**: mirrors (e.g. `registry.npmmirror.com`) can lag behind the official registry. Add explicitly from the official one: `dsh plugin --profile web add dsh-nba-pets --registry=https://registry.npmjs.org`.
- **Dead proxy variables**: `dsh plugin` forwards to pnpm, which honors `HTTP_PROXY`/`HTTPS_PROXY`. If those point at an unreachable proxy, unset them (or point them at a working proxy) before adding packages.

## Development

```sh
npm run build
npm test
npm run check
```

The build embeds both 1536×2288 RGBA WebP v2 atlases in the client closure, avoiding installation-path-dependent asset routes.

## Marketplace publishing

Update `package.json.repository.url`, run `npm run check`, publish with `npm publish --access public`, and add the GitHub topics `dsh-plugin`, `deepseek-harness`, `desktop-pet`, and `basketball`.

## Notice

This is an unofficial fan project and is not affiliated with or endorsed by the NBA, any team, or any player. Team/NBA logos are excluded. King 23 is an original tribute character, not an exact portrait. Publishers remain responsible for publicity, trademark, and local-law clearance. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

Code is MIT licensed; art redistribution remains subject to the notices above.
