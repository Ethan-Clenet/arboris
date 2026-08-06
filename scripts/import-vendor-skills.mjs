#!/usr/bin/env node
/**
 * Importe les skills officiels depuis les repos vendors listés.
 * Usage: node scripts/import-vendor-skills.mjs
 */
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
  { repo: 'angular/skills', publisher: 'Angular', roots: ['.'] },
  { repo: 'anthropics/skills', publisher: 'Anthropic', roots: ['skills'] },
  { repo: 'apollographql/skills', publisher: 'Apollo', roots: ['skills'] },
  {
    repo: 'better-auth/skills',
    publisher: 'Better Auth',
    roots: ['better-auth', 'security'],
    commands: ['better-auth/commands'],
  },
  { repo: 'auth0/agent-skills', publisher: 'Auth0', roots: ['plugins/auth0/skills'] },
  { repo: 'browserbase/skills', publisher: 'Browserbase', roots: ['skills'] },
  { repo: 'cloudflare/skills', publisher: 'Cloudflare', roots: ['skills'] },
  { repo: 'coderabbitai/skills', publisher: 'CodeRabbit', roots: ['skills'] },
  { repo: 'cypress-io/ai-toolkit', publisher: 'Cypress', roots: ['skills'] },
  { repo: 'google-gemini/gemini-skills', publisher: 'Gemini', roots: ['skills'] },
  {
    repo: 'google-labs-code/stitch-skills',
    publisher: 'Stitch',
    roots: [
      'plugins/stitch-build/skills',
      'plugins/stitch-design/skills',
      'plugins/stitch-utilities/skills',
    ],
  },
  { repo: 'googleworkspace/cli', publisher: 'Google Workspace', roots: ['skills'] },
  { repo: 'vercel/next.js', publisher: 'Vercel', roots: ['skills'], ref: 'canary' },
  { repo: 'neondatabase/agent-skills', publisher: 'Neon', roots: ['skills'] },
  { repo: 'flutter/agent-plugins', publisher: 'Flutter', roots: ['skills'] },
  {
    repo: 'figma/mcp-server-guide',
    publisher: 'Figma',
    roots: ['skills', 'workflow-skills'],
  },
]

function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

function findSkillDirs(dir, out = []) {
  if (!existsSync(dir)) return out
  if (existsSync(join(dir, 'SKILL.md'))) {
    out.push(dir)
    return out
  }
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
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
  sh('git', ['init', '-q'], { cwd: workdir })
  sh('git', ['remote', 'add', 'origin', `https://github.com/${repo}.git`], { cwd: workdir })
  // Prefer sparse later; full shallow is simpler & reliable for skill trees
  try {
    sh('git', ['fetch', '--depth', '1', 'origin', ref], { cwd: workdir })
  } catch {
    sh('git', ['fetch', '--depth', '1', 'origin', 'HEAD'], { cwd: workdir })
  }
  sh('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: workdir })
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
          const id = dir.split(/[/\\]/).pop()
          if (!id || id.startsWith('.')) continue
          // Meta-outil dupliqué dans plusieurs repos vendors
          if (id === 'skill-creator' && source.publisher !== 'Anthropic') continue
          // Helpers partagés Google Workspace (pas un skill utilisateur)
          if (id === 'gws-shared') continue
          copySkillDir(dir, id, source.publisher)
          imported.push(id)
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
