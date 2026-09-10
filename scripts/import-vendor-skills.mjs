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
  // Batch SkillsMP créateurs :
  // fastapi, supabase, pytorch, dotnet, storybookjs, alibaba, ansible, prisma
  // Repos listés sur chaque page créateur SkillsMP (explorateur / schema.org hasPart).

  // fastapi — https://skillsmp.com/fr/creators/fastapi
  { repo: 'fastapi/fastapi', publisher: 'FastAPI', roots: ['.'] },
  { repo: 'fastapi/full-stack-fastapi-template', publisher: 'FastAPI', roots: ['.'] },
  { repo: 'fastapi/typer', publisher: 'FastAPI', roots: ['.'] },
  { repo: 'fastapi/sqlmodel', publisher: 'FastAPI', roots: ['.'] },
  { repo: 'fastapi/asyncer', publisher: 'FastAPI', roots: ['.'] },

  // supabase — https://skillsmp.com/fr/creators/supabase
  { repo: 'supabase/supabase', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/supabase-js', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/agent-skills', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/supabase-swift', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/middleware', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/postgres', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/splinter', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/server', publisher: 'Supabase', roots: ['.'] },
  { repo: 'supabase/sdk', publisher: 'Supabase', roots: ['.'] },

  // pytorch — https://skillsmp.com/fr/creators/pytorch
  { repo: 'pytorch/pytorch', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/test-infra', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/ci-infra', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/executorch', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/torchtitan', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/helion', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/TensorRT', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/tutorials', publisher: 'PyTorch', roots: ['.'] },
  { repo: 'pytorch/kineto', publisher: 'PyTorch', roots: ['.'] },

  // dotnet — https://skillsmp.com/fr/creators/dotnet (top repos SkillsMP)
  { repo: 'dotnet/skills', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/maui-labs', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/maui', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/runtime', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/msbuild', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/efcore', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/dotnet', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/core', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/fsharp', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/sdk', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/roslyn', publisher: '.NET', roots: ['.'] },
  { repo: 'dotnet/arcade-skills', publisher: '.NET', roots: ['.'] },

  // storybookjs — https://skillsmp.com/fr/creators/storybookjs
  { repo: 'storybookjs/storybook', publisher: 'Storybook', roots: ['.'] },
  { repo: 'storybookjs/mcp', publisher: 'Storybook', roots: ['.'] },
  { repo: 'storybookjs/react-native', publisher: 'Storybook', roots: ['.'] },

  // alibaba — https://skillsmp.com/fr/creators/alibaba (top repos SkillsMP)
  { repo: 'alibaba/anolisa', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/skill-up', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/loongcollector', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/obz-cli', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/MNN', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/xquic', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/druid', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/neug', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/opc-starter', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/PyFlightProfiler', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/spring-ai-alibaba', publisher: 'Alibaba', roots: ['.'] },
  { repo: 'alibaba/atrex-kernel-agent', publisher: 'Alibaba', roots: ['.'] },

  // ansible — https://skillsmp.com/fr/creators/ansible
  { repo: 'ansible/apme', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/team-devtools', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/apme-operator', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/ansible', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/ansible-ui', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/tox-ansible', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/vscode-ansible', publisher: 'Ansible', roots: ['.'] },
  { repo: 'ansible/ansible.platform', publisher: 'Ansible', roots: ['.'] },

  // prisma — https://skillsmp.com/fr/creators/prisma
  { repo: 'prisma/cursor-plugin', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/prisma-next', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/orm', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/prisma', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/open-chat', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/web', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/skills', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/composer', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/mrkdwn', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/studio', publisher: 'Prisma', roots: ['.'] },
  { repo: 'prisma/prisma-cli', publisher: 'Prisma', roots: ['.'] },

  // TanStack — https://skillsmp.com/creators/tanstack
  { repo: 'TanStack/table', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/ai', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/router', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/db', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/charts', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/devtools', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/markdown', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/cli', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/highlight', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/intent', publisher: 'TanStack', roots: ['.'] },
  { repo: 'TanStack/tanstack.com', publisher: 'TanStack', roots: ['.'] },

  // cypress-io — https://skillsmp.com/creators/cypress-io
  { repo: 'cypress-io/ai-toolkit', publisher: 'Cypress', roots: ['.'] },
  { repo: 'cypress-io/cypress', publisher: 'Cypress', roots: ['.'] },
  { repo: 'cypress-io/cypress-design', publisher: 'Cypress', roots: ['.'] },
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
  // Gros monorepos : écrire ls-tree sur disque (évite ENOBUFS sur stdout).
  const treeFile = join(workdir, '.git', 'arboris-ls-tree.txt')
  const treeOut = execFileSync('git', ['ls-tree', '-r', '--name-only', 'FETCH_HEAD'], {
    cwd: workdir,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  writeFileSync(treeFile, treeOut)
  const dirs = new Set()
  for (const line of treeOut.split('\n')) {
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
  // Filtre optionnel par éditeur : `node scripts/import-vendor-skills.mjs TanStack Cypress`
  const filters = process.argv.slice(2).map((s) => s.toLowerCase())
  const sources = filters.length
    ? SOURCES.filter((s) => filters.includes(s.publisher.toLowerCase()))
    : SOURCES
  if (filters.length && sources.length === 0) {
    console.error(`Aucun éditeur ne correspond à : ${filters.join(', ')}`)
    process.exit(1)
  }

  const scratch = mkdtempSync(join(tmpdir(), 'arboris-vendor-'))
  const summary = []
  let skills = 0
  let commands = 0

  try {
    for (const source of sources) {
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
