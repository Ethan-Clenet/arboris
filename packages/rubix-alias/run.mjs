#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const root = dirname(require.resolve('arboris-cli/package.json'))
const cli = join(root, 'dist', 'cli.mjs')

if (!existsSync(cli)) {
  console.error(
    `arboris-cli non buildé (${cli}).\nDans le monorepo Arboris, lance: npm run build:cli`,
  )
  process.exit(1)
}

const child = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { stdio: 'inherit' })
process.exit(child.status ?? 1)
