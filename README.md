# dsh-nba-pets

An unofficial basketball desktop-pet collection for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It ships as a proper DSH bundle and Web client plugin and contributes an additive `shell.overlay` entry.

Features include Curry 30 and the original King 23 tribute character, instant character switching, draggable/persisted placement, wake/tuck-away controls, a task activity tray, reduced-motion support, idle shooting, task-state animations, and 16-direction pointer tracking. Task priority follows Codex Pets: Needs input → Blocked → Ready → Running → Idle.

## Install from source

```sh
git clone https://github.com/<your-account>/dsh-nba-pets.git
cd dsh-nba-pets
npm install
npm run check
dsh plugin --profile web add .
dsh --profile web --dump-config
dsh --profile web
```

When running DSH from its source checkout:

```powershell
cd D:\IDEA-Project\deepseek-harness
corepack pnpm dsh plugin --profile web add C:\path\to\dsh-nba-pets
corepack pnpm dsh --profile web --dump-config
corepack pnpm dsh --profile web
```

After npm publication:

```sh
dsh plugin --profile web add dsh-nba-pets
```

Remove with `dsh plugin --profile web remove dsh-nba-pets`.

The pets float inside the DSH Web application. A browser page cannot create a globally always-on-top OS window by itself.

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
