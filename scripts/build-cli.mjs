import * as esbuild from 'esbuild'
import { chmod } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outfile = join(root, 'dist', 'cli.mjs')

await esbuild.build({
  entryPoints: [join(root, 'cli', 'main.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile,
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'info',
})

await chmod(outfile, 0o755)
console.log(`✅ CLI compilée: ${outfile}`)
