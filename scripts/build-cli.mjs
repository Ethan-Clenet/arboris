import * as esbuild from 'esbuild'
import { chmod, cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publishDir = join(root, 'packages', 'arboris-cli')
const outfile = join(publishDir, 'dist', 'cli.mjs')

await mkdir(join(publishDir, 'dist'), { recursive: true })

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

await cp(join(root, 'cli', 'manifest.json'), join(publishDir, 'manifest.json'))
await cp(join(root, 'prisma', 'skills'), join(publishDir, 'prisma', 'skills'), {
  recursive: true,
})

console.log(`✅ CLI publiable: ${publishDir}`)
