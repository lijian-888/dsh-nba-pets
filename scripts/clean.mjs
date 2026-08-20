import { rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
await rm(resolve(root, 'lib'), { recursive: true, force: true })
await rm(resolve(root, 'src/client/assets.generated.ts'), { force: true })
