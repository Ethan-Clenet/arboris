#!/usr/bin/env node
/**
 * Télécharge un skill vendor vers prisma/skills (évaluation SkillSpector).
 * Usage: node scripts/fetch-vendor-skill.mjs <id> <org/repo> <skillPath>
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [id, source, skillPath] = process.argv.slice(2)
if (!id || !source || !skillPath) {
  console.error('Usage: node scripts/fetch-vendor-skill.mjs <id> <org/repo> <skillPath>')
  process.exit(1)
}

function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })
}

const scratch = mkdtempSync(join(tmpdir(), 'arboris-fetch-skill-'))
const workdir = join(scratch, 'repo')
const skillRelDir = skillPath.replace(/\/SKILL\.md$/i, '').replace(/\\/g, '/')
const env = { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' }

mkdirSync(workdir, { recursive: true })
sh('git', ['init', '-q'], { cwd: workdir, env })
sh('git', ['remote', 'add', 'origin', `https://github.com/${source}.git`], { cwd: workdir, env })
sh('git', ['fetch', '--depth', '1', '--filter=blob:none', 'origin', 'HEAD'], { cwd: workdir, env })
sh('git', ['sparse-checkout', 'init', '--no-cone'], { cwd: workdir, env })
writeFileSync(join(workdir, '.git/info/sparse-checkout'), `/${skillRelDir}/\n`)
sh('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: workdir, env })

const src = join(workdir, skillRelDir)
const dest = join(ROOT, 'prisma', 'skills', id)
if (!existsSync(join(src, 'SKILL.md'))) {
  console.error(`SKILL.md introuvable: ${src}`)
  process.exit(1)
}
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
rmSync(scratch, { recursive: true, force: true })
console.log(`✓ ${id} → prisma/skills/${id}`)
