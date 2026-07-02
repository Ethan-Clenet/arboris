import * as esbuild from 'esbuild'
import { chmod, readFile, writeFile } from 'node:fs/promises'
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
  logLevel: 'info',
})

let code = await readFile(outfile, 'utf-8')
code = code.replace(/\r\n/g, '\n').replace(/^#!.*\n/, '')
code = `#!/usr/bin/env node\n${code}`
await writeFile(outfile, code, { encoding: 'utf-8' })
await chmod(outfile, 0o755)

console.log(`✅ CLI compilée: ${outfile}`)
