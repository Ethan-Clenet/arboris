#!/usr/bin/env node
/**
 * Resynchronise les skills épinglés dans skills-lock.json vers
 * `.agents/skills/` et `prisma/skills/`.
 *
 * Usage:
 *   node scripts/sync-skills-lock.mjs
 *   node scripts/sync-skills-lock.mjs convex-auth supabase
 *   node scripts/sync-skills-lock.mjs --dry-run
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCK_PATH = join(ROOT, 'skills-lock.json')
const AGENTS_DIR = join(ROOT, '.agents', 'skills')
const PRISMA_DIR = join(ROOT, 'prisma', 'skills')

function parseArgs(argv) {
  const ids = []
  let dryRun = false
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('-')) {
      console.error(`Option inconnue: ${arg}`)
      process.exit(1)
    } else {
      ids.push(arg)
    }
  }
  return { ids, dryRun }
}

function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

async function hashSkillDir(dir) {
  const hash = createHash('sha256')
  async function walk(rel = '') {
    const abs = join(dir, rel)
    const entries = readdirSync(abs, { withFileTypes: true })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const child = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        await walk(child)
      } else if (entry.isFile()) {
        hash.update(child)
        hash.update(readFileSync(join(dir, child)))
      }
    }
  }
  await walk()
  return hash.digest('hex')
}

function sparseClone(repo, workdir, skillRelDir) {
  mkdirSync(workdir, { recursive: true })
  const env = { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' }
  const normalized = skillRelDir.replace(/\\/g, '/').replace(/\/$/, '')
  const alreadyCloned = existsSync(join(workdir, '.git'))

  if (!alreadyCloned) {
    sh('git', ['init', '-q'], { cwd: workdir, env })
    sh('git', ['remote', 'add', 'origin', `https://github.com/${repo}.git`], { cwd: workdir, env })
    try {
      sh('git', ['fetch', '--depth', '1', '--filter=blob:none', 'origin', 'HEAD'], { cwd: workdir, env })
    } catch {
      sh('git', ['fetch', '--depth', '1', 'origin', 'HEAD'], { cwd: workdir, env })
    }
    sh('git', ['sparse-checkout', 'init', '--no-cone'], { cwd: workdir, env })
  }

  writeFileSync(join(workdir, '.git/info/sparse-checkout'), `/${normalized}/\n`)
  sh('git', ['sparse-checkout', 'reapply'], { cwd: workdir, env })
  sh('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: workdir, env })
}

function copySkillTree(srcDir, destDir) {
  if (existsSync(destDir)) rmSync(destDir, { recursive: true, force: true })
  mkdirSync(dirname(destDir), { recursive: true })
  cpSync(srcDir, destDir, { recursive: true })
}

function skillDirFromPath(skillPath) {
  const normalized = skillPath.replace(/\\/g, '/')
  return normalized.replace(/\/SKILL\.md$/i, '')
}

async function syncOne(id, entry, scratch, dryRun) {
  const skillRelDir = skillDirFromPath(entry.skillPath)
  const repoDir = join(scratch, entry.source.replace('/', '__'))
  const srcDir = join(repoDir, skillRelDir)

  console.log(`→ ${id} (${entry.source}/${skillRelDir})`)
  if (!dryRun) {
    sparseClone(entry.source, repoDir, skillRelDir)
    if (!existsSync(join(srcDir, 'SKILL.md'))) {
      throw new Error(`SKILL.md introuvable: ${srcDir}`)
    }
    copySkillTree(srcDir, join(AGENTS_DIR, id))
    copySkillTree(srcDir, join(PRISMA_DIR, id))
  }

  const hashSource = dryRun ? join(PRISMA_DIR, id) : join(AGENTS_DIR, id)
  if (!existsSync(join(hashSource, 'SKILL.md'))) {
    throw new Error(`Skill local introuvable pour hash: ${hashSource}`)
  }
  const computedHash = await hashSkillDir(hashSource)
  return computedHash
}

async function main() {
  const { ids: filter, dryRun } = parseArgs(process.argv.slice(2))
  const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf-8'))
  const entries = Object.entries(lock.skills)
  const selected = filter.length
    ? entries.filter(([id]) => filter.includes(id))
    : entries

  if (filter.length && selected.length !== filter.length) {
    const missing = filter.filter((id) => !lock.skills[id])
    console.error(`Skills absents du lock: ${missing.join(', ')}`)
    process.exit(1)
  }

  const scratch = mkdtempSync(join(tmpdir(), 'arboris-skills-lock-'))
  const updated = { ...lock, skills: { ...lock.skills } }

  try {
    for (const [id, entry] of selected) {
      updated.skills[id] = {
        ...entry,
        computedHash: await syncOne(id, entry, scratch, dryRun),
      }
      console.log(`  ✓ ${id} → ${updated.skills[id].computedHash.slice(0, 12)}…`)
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }

  if (!dryRun) {
    writeFileSync(LOCK_PATH, `${JSON.stringify(updated, null, 2)}\n`)
    console.log(`\nLock mis à jour: ${LOCK_PATH}`)
  } else {
    console.log('\n(dry-run — lock non écrit)')
  }
}

main().catch((error) => {
  console.error('❌ sync-skills-lock:', error instanceof Error ? error.message : error)
  process.exit(1)
})
