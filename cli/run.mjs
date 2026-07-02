#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const bundled = join(root, 'packages', 'arboris-cli', 'dist', 'cli.mjs')
const args = process.argv.slice(2)

if (existsSync(bundled)) {
  const result = spawnSync(process.execPath, [bundled, ...args], { stdio: 'inherit' })
  process.exit(result.status ?? 1)
}

const tsx = join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const result = spawnSync(
  process.execPath,
  ['--import', tsx, join(root, 'cli', 'main.ts'), ...args],
  { stdio: 'inherit', cwd: root },
)
process.exit(result.status ?? 1)
