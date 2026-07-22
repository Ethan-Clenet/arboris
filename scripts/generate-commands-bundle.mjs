#!/usr/bin/env node
/**
 * Génère src/generated/commands-bundle.ts depuis prisma/commands/*.md
 * pour que le catalogue web fonctionne sur Vercel (pas de FS serverless).
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const commandsDir = join(root, 'prisma', 'commands')
const outFile = join(root, 'src', 'generated', 'commands-bundle.ts')

const entries = await readdir(commandsDir, { withFileTypes: true })
const files = entries
  .filter((e) => e.isFile() && e.name.endsWith('.md'))
  .map((e) => e.name)
  .sort()

/** @type {Record<string, string>} */
const rawById = {}
for (const name of files) {
  const id = name.replace(/\.md$/i, '')
  rawById[id] = await readFile(join(commandsDir, name), 'utf-8')
}

const banner = `/* eslint-disable */
/** Auto-généré par scripts/generate-commands-bundle.mjs — ne pas éditer. */
`

const body = `${banner}export const COMMANDS_RAW: Record<string, string> = ${JSON.stringify(rawById, null, 2)} as const
`

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, body, 'utf-8')
console.log(`[generate-commands-bundle] ${Object.keys(rawById).length} commande(s) → ${outFile}`)
