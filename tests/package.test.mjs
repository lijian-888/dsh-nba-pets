import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('declares an installable DSH bundle and web client', async () => {
  assert.equal(packageJson.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(packageJson.dsh.client.platform, 'web')
  assert.deepEqual(packageJson.dsh.client.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-layout',
  ])
  assert.match(
    await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8'),
    /id: nba-pets[\s\S]*name: dsh-nba-pets/,
  )
})

test('ships two valid WebP sprite atlases', async () => {
  for (const path of [
    '../assets/pets/curry/spritesheet.webp',
    '../assets/pets/king-23/spritesheet.webp',
  ]) {
    const data = await readFile(new URL(path, import.meta.url))
    assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF')
    assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP')
    assert.ok(data.length > 500_000)
  }
})

test('builds a DSH loader closure with embedded pet assets', async () => {
  const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(client, /window\.__ModuleLoader__\.load\(\{ id: "dsh-nba-pets"/)
  assert.match(client, /data:image\/webp;base64/)
  assert.doesNotMatch(client, /assets\/pets\/[^"']+spritesheet\.webp/)
})

test('keeps official Codex-style status priority in source', async () => {
  const source = await readFile(new URL('../src/client/PetOverlay.tsx', import.meta.url), 'utf8')
  const priority = "['needs-input', 'blocked', 'ready', 'running']"
  assert.ok(source.includes(priority))
  assert.match(source, /prefers-reduced-motion/)
  assert.match(source, /pointerDirectionIndex/)
})
