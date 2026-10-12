#!/usr/bin/env node
/**
 * Installe une slash command Arboris (et ses skills compagnons) depuis le catalogue déployé.
 *
 * Unix:
 *   curl -fsSL https://arboristhree.xyz/cli/install-command.mjs -o /tmp/arboris-install-command.mjs && node /tmp/arboris-install-command.mjs sonar
 *   node /tmp/arboris-install-command.mjs sonar --agent=Claude
 * Windows (PowerShell):
 *   iwr -UseBasicParsing https://arboristhree.xyz/cli/install-command.mjs -OutFile "$env:TEMP\arboris-install-command.mjs"; node "$env:TEMP\arboris-install-command.mjs" sonar
 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative, isAbsolute } from 'node:path'

const KIND = 'command'
const ZIP_SEGMENT = 'command-zip'
const SITE = (process.env.ARBORIS_SITE_URL || 'https://arboristhree.xyz').replace(/\/$/, '')

function parseArgs(argv) {
  const out = { id: null, agent: 'Cursor', force: false, cwd: process.cwd(), lang: 'fr' }
  for (const arg of argv) {
    if (arg === '--force') out.force = true
    else if (arg.startsWith('--agent=')) out.agent = arg.slice('--agent='.length)
    else if (arg.startsWith('--cwd=')) out.cwd = arg.slice('--cwd='.length)
    else if (arg.startsWith('--lang=')) out.lang = arg.slice('--lang='.length)
    else if (!arg.startsWith('-') && !out.id) out.id = arg
  }
  return out
}

function isInsideRoot(root, target) {
  const rel = relative(root, target)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

/** Extrateur minimal pour ZIP « store » (method 0) — format produit par Arboris. */
function extractStoreZip(buf, destRoot, { force }) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  let offset = 0
  let written = 0
  let skipped = 0
  const root = resolve(destRoot)

  while (offset + 30 <= buf.length) {
    const sig = view.getUint32(offset, true)
    if (sig !== 0x04034b50) break
    const method = view.getUint16(offset + 8, true)
    const compSize = view.getUint32(offset + 18, true)
    const nameLen = view.getUint16(offset + 26, true)
    const extraLen = view.getUint16(offset + 28, true)
    const nameStart = offset + 30
    const name = Buffer.from(buf.subarray(nameStart, nameStart + nameLen)).toString('utf8')
    const dataStart = nameStart + nameLen + extraLen
    const dataEnd = dataStart + compSize
    if (dataEnd > buf.length) throw new Error(`zip_truncated: ${name}`)
    if (method !== 0) throw new Error(`zip_compressed_unsupported (${method}): ${name}`)

    const target = resolve(destRoot, name)
    if (!isInsideRoot(root, target)) {
      throw new Error(`zip_path_escape: ${name}`)
    }
    if (existsSync(target) && !force) {
      console.log(`  ⊘ ${name}`)
      skipped++
    } else {
      mkdirSync(dirname(target), { recursive: true })
      const tmp = `${target}.${process.pid}.tmp`
      writeFileSync(tmp, buf.subarray(dataStart, dataEnd))
      renameSync(tmp, target)
      written++
      console.log(`  ✓ ${name}`)
    }
    offset = dataEnd
  }
  return { written, skipped }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error(
      `Usage: node arboris-install-${KIND}.mjs <${KIND}-id> [--agent=Cursor] [--force]`,
    )
    process.exit(1)
  }

  const lang = args.lang === 'en' ? 'en' : 'fr'
  const zipUrl = `${SITE}/cli/${ZIP_SEGMENT}/${encodeURIComponent(args.id)}?agent=${encodeURIComponent(args.agent)}&lang=${encodeURIComponent(lang)}`
  console.log(`Arboris — ${KIND} « ${args.id} » → ${args.agent}`)
  console.log(`  GET ${zipUrl}`)

  const res = await fetch(zipUrl)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`Échec téléchargement (${res.status}): ${body.slice(0, 200) || res.statusText}`)
    console.error(`Vérifie l’id via ${SITE}/commands`)
    process.exit(1)
  }

  const buf = Buffer.from(await res.arrayBuffer())
  const { written, skipped } = extractStoreZip(buf, args.cwd, { force: args.force })
  console.log(`\nTerminé: ${written} fichier(s) écrits, ${skipped} ignoré(s).`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
