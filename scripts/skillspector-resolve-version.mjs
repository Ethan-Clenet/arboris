#!/usr/bin/env node
/**
 * Résout la version SkillSpector à utiliser.
 *
 * - Lit le pin `skillspector-version.json`
 * - Interroge les tags GitHub (releases semver)
 * - Patch / minor : adopte la dernière version du même major, met à jour le pin
 * - Major : garde le pin, émet une alerte, scanne avec l’ancienne version
 *
 * Usage:
 *   node scripts/skillspector-resolve-version.mjs
 *   node scripts/skillspector-resolve-version.mjs --dry-run
 *   node scripts/skillspector-resolve-version.mjs --offline   # pin seulement
 *
 * Sortie stdout (dernière ligne utile pour CI) : VERSION=<semver>
 * Si GITHUB_OUTPUT est défini, écrit aussi version / policy / message.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pinPath = join(root, 'skillspector-version.json')
const DEFAULT_REPO = 'NVIDIA/SkillSpector'

function parseArgs(argv) {
  let dryRun = false
  let offline = false
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true
    else if (arg === '--offline') offline = true
    else if (arg.startsWith('-')) {
      console.error(`Option inconnue: ${arg}`)
      process.exit(1)
    }
  }
  return { dryRun, offline }
}

function parseSemver(raw) {
  const cleaned = String(raw ?? '')
    .trim()
    .replace(/^v/i, '')
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    text: `${match[1]}.${match[2]}.${match[3]}`,
  }
}

function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}

async function loadPin() {
  const raw = JSON.parse(await readFile(pinPath, 'utf-8'))
  const version = parseSemver(raw.version)
  if (!version) {
    throw new Error(`Version pin invalide dans ${pinPath}: ${raw.version}`)
  }
  return {
    ...raw,
    version: version.text,
    repository: typeof raw.repository === 'string' ? raw.repository : DEFAULT_REPO,
  }
}

async function fetchLatestTags(repository) {
  const url = `https://api.github.com/repos/${repository}/tags?per_page=30`
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'arboris-skillspector-resolve',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`GitHub tags ${res.status}: ${await res.text()}`)
  }
  const tags = await res.json()
  if (!Array.isArray(tags)) throw new Error('Réponse tags GitHub invalide')
  return tags
    .map((t) => parseSemver(t?.name))
    .filter(Boolean)
    .sort((a, b) => cmpSemver(b, a))
}

function pickPolicy(pin, tags) {
  const latestOverall = tags[0] ?? null
  const latestSameMajor = tags.find((t) => t.major === pin.major) ?? null

  if (!latestOverall) {
    return {
      policy: 'pin',
      resolved: pin.text,
      latest: null,
      message: `Aucun tag semver trouvé — conservation du pin ${pin.text}.`,
    }
  }

  if (latestOverall.major > pin.major) {
    const same = latestSameMajor && cmpSemver(latestSameMajor, pin) > 0 ? latestSameMajor.text : pin.text
    return {
      policy: 'block-major',
      resolved: same,
      latest: latestOverall.text,
      message:
        `⚠️ SkillSpector major disponible : v${latestOverall.text} ` +
        `(pin actuel v${pin.text}). Téléchargement major bloqué — ` +
        `scan avec v${same}. Bump manuel requis après revue.`,
    }
  }

  if (latestSameMajor && cmpSemver(latestSameMajor, pin) > 0) {
    return {
      policy: 'upgrade',
      resolved: latestSameMajor.text,
      latest: latestOverall.text,
      message: `SkillSpector ${pin.text} → ${latestSameMajor.text} (même major, auto-upgrade).`,
    }
  }

  return {
    policy: 'pin',
    resolved: pin.text,
    latest: latestOverall.text,
    message: `SkillSpector à jour (pin ${pin.text}, latest ${latestOverall.text}).`,
  }
}

async function appendStepSummary(text) {
  const path = process.env.GITHUB_STEP_SUMMARY
  if (!path) return
  await writeFile(path, `${text}\n`, { flag: 'a' })
}

async function writeGithubOutput(values) {
  const path = process.env.GITHUB_OUTPUT
  if (!path) return
  const lines = Object.entries(values).map(([k, v]) => `${k}=${String(v).replace(/\n/g, '%0A')}`)
  await writeFile(path, `${lines.join('\n')}\n`, { flag: 'a' })
}

async function main() {
  const { dryRun, offline } = parseArgs(process.argv.slice(2))
  const pinFile = await loadPin()
  const pin = parseSemver(pinFile.version)

  let decision
  if (offline) {
    decision = {
      policy: 'offline',
      resolved: pin.text,
      latest: null,
      message: `Mode offline — pin ${pin.text}.`,
    }
  } else {
    try {
      const tags = await fetchLatestTags(pinFile.repository)
      decision = pickPolicy(pin, tags)
    } catch (error) {
      decision = {
        policy: 'pin',
        resolved: pin.text,
        latest: null,
        message: `⚠ Impossible de joindre GitHub (${error.message}) — pin ${pin.text}.`,
      }
    }
  }

  const upgraded = decision.policy === 'upgrade' && decision.resolved !== pin.text

  if (upgraded && !dryRun) {
    const next = {
      ...pinFile,
      version: decision.resolved,
      updatedAt: new Date().toISOString(),
    }
    await writeFile(pinPath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8')
  }

  const prefix =
    decision.policy === 'block-major' ? '🚫' : decision.policy === 'upgrade' ? '⬆️' : '📌'
  console.log(`${prefix} ${decision.message}`)
  if (dryRun && upgraded) {
    console.log(`(dry-run) pin non modifié — serait ${decision.resolved}`)
  }

  await appendStepSummary(
    [
      '## SkillSpector version',
      '',
      `- Policy: \`${decision.policy}\``,
      `- Resolved: \`v${decision.resolved}\``,
      decision.latest ? `- Latest upstream: \`v${decision.latest}\`` : null,
      '',
      decision.message,
    ]
      .filter(Boolean)
      .join('\n'),
  )

  await writeGithubOutput({
    version: decision.resolved,
    policy: decision.policy,
    latest: decision.latest ?? '',
    message: decision.message,
    pin_updated: upgraded && !dryRun ? 'true' : 'false',
  })

  // Ligne machine-lisible pour scripts locaux
  console.log(`VERSION=${decision.resolved}`)
  console.log(`POLICY=${decision.policy}`)
}

main().catch((error) => {
  console.error('❌', error.message)
  process.exit(1)
})
