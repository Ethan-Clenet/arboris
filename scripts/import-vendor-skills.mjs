#!/usr/bin/env node
/**
 * Importe les skills officiels depuis les repos vendors listés.
 * Usage: node scripts/import-vendor-skills.mjs
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
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'prisma', 'skills')
const COMMANDS_DIR = join(ROOT, 'prisma', 'commands')

/** @typedef {{ repo: string, ref?: string, publisher: string, roots: string[], commands?: string[] }} Source */

/** @type {Source[]} */
const SOURCES = [
  // Skills officiels Context7 (Upstash). Les copies plugins/*/context7-mcp
  // sont des duplicatas du skill MCP canonique — on n’importe que les
  // skills/ racine + context7-docs (packages/pi).
  { repo: 'upstash/context7', publisher: 'Context7', roots: ['skills', 'packages/pi/skills'] },
]

function slugifyForId(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildPathBasedSkillId({
  baseId,
  repoSlug,
  relToRepo,
}) {
  // Conserve le "baseId" au début (important pour la heuristique de catégorisation),
  // puis ajoute un suffixe basé sur le chemin relatif pour éviter les collisions (traductions).
  const relParts = relToRepo.split(/[/\\]/)
  relParts.pop() // baseId
  const suffixRaw = relParts.join('/')
  const suffix = suffixRaw ? slugifyForId(suffixRaw) : ''
  const hash = createHash('sha256').update(relToRepo).digest('hex').slice(0, 12)
  const repoChunk = slugifyForId(repoSlug)
  const suffixChunk = suffix ? `${suffix.slice(0, 80)}-` : ''
  return `${baseId}__${repoChunk}__${suffixChunk}${hash}`
}

function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

const HIDDEN_SKILL_DIRS = new Set([
  '.ai',
  '.agents',
  '.claude',
  '.codex',
  '.fast-agent',
  '.github',
  '.opencode',
])

function findSkillDirs(dir, out = []) {
  if (!existsSync(dir)) return out
  if (existsSync(join(dir, 'SKILL.md'))) {
    out.push(dir)
    return out
  }
  for (const name of readdirSync(dir)) {
    if (name === '.git') continue
    if (name.startsWith('.') && !HIDDEN_SKILL_DIRS.has(name)) continue
    const full = join(dir, name)
    if (!statSync(full).isDirectory()) continue
    if (existsSync(join(full, 'SKILL.md'))) out.push(full)
    else findSkillDirs(full, out)
  }
  return out
}

function patchOrigin(skillMd, publisher) {
  let text = skillMd
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  if (!text.startsWith('---')) {
    return `---\nmetadata:\n  origin: ${publisher}\n---\n\n${text}`
  }
  const end = text.indexOf('\n---', 3)
  if (end === -1) return text
  const fm = text.slice(4, end)
  const body = text.slice(end + 4)
  let nextFm = fm
  if (/^metadata:\s*$/m.test(fm) || /^metadata:\s*\n/m.test(fm)) {
    if (/^[ \t]+origin:/m.test(fm)) {
      nextFm = fm.replace(/^[ \t]+origin:\s*.+$/m, `  origin: ${publisher}`)
    } else {
      nextFm = fm.replace(/^metadata:\s*$/m, `metadata:\n  origin: ${publisher}`)
      if (nextFm === fm) {
        nextFm = fm.replace(/^(metadata:\s*\n)/m, `$1  origin: ${publisher}\n`)
      }
    }
  } else if (/^origin:/m.test(fm)) {
    nextFm = fm.replace(/^origin:\s*.+$/m, `origin: ${publisher}`)
  } else {
    nextFm = `${fm.trimEnd()}\nmetadata:\n  origin: ${publisher}\n`
  }
  return `---\n${nextFm.trimEnd()}\n---${body.startsWith('\n') ? body : `\n${body}`}`
}

function copySkillDir(srcDir, destId, publisher) {
  const dest = join(SKILLS_DIR, destId)
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(srcDir, dest, { recursive: true })
  const skillPath = join(dest, 'SKILL.md')
  const patched = patchOrigin(readFileSync(skillPath, 'utf-8'), publisher)
  writeFileSync(skillPath, patched)
}

function slugCommandId(name, prefix) {
  const base = name.replace(/\.md$/i, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return `${prefix}-${base}`.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-')
}

function importCommands(absDir, publisher, prefix) {
  if (!existsSync(absDir)) return 0
  let n = 0
  for (const name of readdirSync(absDir)) {
    if (!name.endsWith('.md')) continue
    const raw = readFileSync(join(absDir, name), 'utf-8')
    const id = slugCommandId(name, prefix)
    const title = name.replace(/\.md$/i, '')
    const body = `---
description: ${publisher} — ${title}
---

${raw.trim()}\n`
    writeFileSync(join(COMMANDS_DIR, `${id}.md`), body)
    n++
  }
  return n
}

function sparseClone(repo, ref, workdir) {
  mkdirSync(workdir, { recursive: true })
  const env = { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' }
  sh('git', ['init', '-q'], { cwd: workdir, env })
  sh('git', ['remote', 'add', 'origin', `https://github.com/${repo}.git`], { cwd: workdir, env })
  try {
    sh('git', ['fetch', '--depth', '1', '--filter=blob:none', 'origin', ref], { cwd: workdir, env })
  } catch {
    sh('git', ['fetch', '--depth', '1', '--filter=blob:none', 'origin', 'HEAD'], { cwd: workdir, env })
  }
  sh('git', ['sparse-checkout', 'init', '--no-cone'], { cwd: workdir, env })
  const tree = execFileSync('git', ['ls-tree', '-r', '--name-only', 'FETCH_HEAD'], {
    cwd: workdir,
    env,
    encoding: 'utf8',
  })
  const dirs = new Set()
  for (const line of tree.split('\n')) {
    if (!/(^|\/)SKILL\.md$/i.test(line)) continue
    const parts = line.split('/')
    parts.pop()
    if (parts.length === 0) dirs.add('/SKILL.md')
    else dirs.add(`/${parts.join('/')}/**`)
  }
  const patterns = dirs.size ? [...dirs] : ['/**/SKILL.md']
  writeFileSync(join(workdir, '.git/info/sparse-checkout'), `${patterns.join('\n')}\n`)
  sh('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: workdir, env })
}

function main() {
  const scratch = mkdtempSync(join(tmpdir(), 'arboris-vendor-'))
  const summary = []
  let skills = 0
  let commands = 0

  try {
    for (const source of SOURCES) {
      const ref = source.ref ?? 'HEAD'
      const repoDir = join(scratch, source.repo.replace('/', '__'))
      console.log(`\n→ ${source.repo} (${source.publisher})`)
      try {
        sparseClone(source.repo, ref, repoDir)
      } catch (err) {
        console.error(`  ✗ clone failed:`, err instanceof Error ? err.message : err)
        summary.push({ repo: source.repo, ok: false, error: String(err) })
        continue
      }

      const imported = []
      for (const root of source.roots) {
        const abs = root === '.' ? repoDir : join(repoDir, root)
        const dirs = findSkillDirs(abs)
        for (const dir of dirs) {
          const baseId = dir.split(/[/\\]/).pop()
          if (!baseId || baseId.startsWith('.')) continue
          // Meta-outil dupliqué dans plusieurs repos vendors
          if (baseId === 'skill-creator' && source.publisher !== 'Anthropic') continue
          // Helpers partagés Google Workspace (pas un skill utilisateur)
          if (baseId === 'gws-shared') continue

          const relToRepo = relative(repoDir, dir)
          const relNorm = relToRepo.replace(/\\/g, '/')
          if (
            (/\/(tests|test|testdata|fixtures|__tests__|_template)\//i.test(`/${relNorm}/`) ||
              baseId.startsWith('_template')) &&
            !(source.publisher === 'Ollama' && baseId === 'release-notes')
          ) {
            continue
          }
          const repoSlug = source.repo // e.g. microsoft/skills
          const destId = buildPathBasedSkillId({ baseId, repoSlug, relToRepo })

          copySkillDir(dir, destId, source.publisher)
          imported.push(destId)
          skills++
        }
      }

      if (source.commands) {
        for (const cmdRoot of source.commands) {
          const n = importCommands(
            join(repoDir, cmdRoot),
            source.publisher,
            source.publisher.toLowerCase().replace(/\s+/g, '-'),
          )
          commands += n
        }
      }

      console.log(`  ✓ ${imported.length} skills: ${imported.slice(0, 8).join(', ')}${imported.length > 8 ? '…' : ''}`)
      summary.push({ repo: source.repo, ok: true, count: imported.length, ids: imported })
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true })
  }

  writeFileSync(
    join(ROOT, 'scripts', '.vendor-skills-import.json'),
    `${JSON.stringify({ at: new Date().toISOString(), skills, commands, summary }, null, 2)}\n`,
  )
  console.log(`\nDone: ${skills} skills, ${commands} commands`)
}

main()
