#!/usr/bin/env node
/**
 * Batch SkillSpector (Docker, static only).
 *
 * Usage:
 *   node scripts/skillspector-scan.mjs                 # tous les skills
 *   node scripts/skillspector-scan.mjs supabase react-patterns
 *   node scripts/skillspector-scan.mjs --limit 10
 *   node scripts/skillspector-scan.mjs --force           # rescanner même si rapport frais
 *   node scripts/skillspector-scan.mjs --no-db           # fichiers seulement
 *   node scripts/skillspector-scan.mjs --resolve         # resolve semver avant scan
 *   node scripts/skillspector-scan.mjs --prefix __microsoft-
 *
 * Prérequis : image Docker `skillspector` ou `skillspector:<version>`.
 * Skip si contentHash + scannerVersion inchangés (sauf --force).
 * Score Arboris = 100 − risk_score SkillSpector.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { cp, mkdtemp, readdir, readFile, rm, writeFile, mkdir, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = join(root, 'prisma', 'skills')
const reportsDir = join(root, 'prisma', 'skillspector-reports')
const pinPath = join(root, 'skillspector-version.json')
const require = createRequire(import.meta.url)

function parseArgs(argv) {
  const skills = []
  let limit = null
  let force = false
  let noDb = false
  let resolve = false
  let prefix = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--limit') {
      limit = Number(argv[++i])
    } else if (arg === '--force') {
      force = true
    } else if (arg === '--no-db') {
      noDb = true
    } else if (arg === '--resolve') {
      resolve = true
    } else if (arg === '--prefix') {
      prefix = argv[++i]
    } else if (arg.startsWith('-')) {
      console.error(`Option inconnue: ${arg}`)
      process.exit(1)
    } else {
      skills.push(arg)
    }
  }
  return { skills, limit, force, noDb, resolve, prefix }
}

function riskToSafetyScore(riskScore) {
  const risk = Number.isFinite(riskScore) ? Math.round(riskScore) : 0
  return Math.max(0, Math.min(100, 100 - risk))
}

function normalizeRecommendation(raw) {
  const value = String(raw ?? '').trim().toUpperCase()
  if (value === 'SAFE' || value === 'ALLOW' || value === 'PASS') return 'SAFE'
  if (value === 'CAUTION' || value === 'WARN' || value === 'WARNING') return 'CAUTION'
  if (value === 'UNSAFE' || value === 'BLOCK' || value === 'FAIL' || value === 'DANGEROUS' || value === 'DO_NOT_INSTALL') return 'UNSAFE'
  return 'UNKNOWN'
}

function mapSkillspectorJson(raw) {
  const risk = raw?.risk_assessment
  const skill = raw?.skill
  if (!risk || typeof risk.score !== 'number') return null
  const issuesRaw = Array.isArray(raw.issues) ? raw.issues : []
  const issues = issuesRaw.slice(0, 25).map((item) => ({
    id: String(item.id ?? ''),
    category: String(item.category ?? ''),
    pattern: String(item.pattern ?? ''),
    severity: String(item.severity ?? ''),
    confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
    finding: typeof item.finding === 'string' ? item.finding : undefined,
    explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
    remediation: typeof item.remediation === 'string' ? item.remediation : undefined,
    location: item.location && typeof item.location === 'object'
      ? {
          file: typeof item.location.file === 'string' ? item.location.file : undefined,
          start_line: typeof item.location.start_line === 'number' ? item.location.start_line : null,
        }
      : undefined,
  }))
  return {
    riskScore: risk.score,
    severity: String(risk.severity ?? 'UNKNOWN'),
    recommendation: normalizeRecommendation(risk.recommendation),
    issueCount: issuesRaw.length,
    issues,
    scannedAt: typeof skill?.scanned_at === 'string' ? skill.scanned_at : new Date().toISOString(),
    scanMode: 'static',
    skillName: typeof skill?.name === 'string' ? skill.name : undefined,
    contentHash: undefined,
    scannerVersion: undefined,
  }
}

async function listSkillDirs() {
  const entries = await readdir(skillsDir, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory() && e.name !== 'shared')
    .map((e) => e.name)
    .sort()
}

async function hashSkillDir(skillId) {
  const dir = join(skillsDir, skillId)
  const hash = createHash('sha256')
  async function walk(rel = '') {
    const abs = join(dir, rel)
    const entries = await readdir(abs, { withFileTypes: true })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const child = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        await walk(child)
      } else if (entry.isFile()) {
        hash.update(child)
        hash.update(await readFile(join(dir, child)))
      }
    }
  }
  await walk()
  return hash.digest('hex')
}

function runCmd(command, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: opts.stdio ?? ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    if (child.stdout) child.stdout.on('data', (c) => { stdout += c.toString() })
    if (child.stderr) child.stderr.on('data', (c) => { stderr += c.toString() })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exit ${code}: ${stderr.trim() || stdout.trim() || 'failed'}`))
        return
      }
      resolvePromise({ stdout, stderr })
    })
  })
}

async function runResolve() {
  const { stdout } = await runCmd(process.execPath, [join(root, 'scripts', 'skillspector-resolve-version.mjs')], {
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  process.stdout.write(stdout)
  const match = stdout.match(/^VERSION=(.+)$/m)
  if (!match) throw new Error('resolve-version n’a pas émis VERSION=')
  return match[1].trim()
}

async function readPinnedVersion() {
  if (process.env.SKILLSPECTOR_VERSION) {
    return String(process.env.SKILLSPECTOR_VERSION).replace(/^v/i, '').trim()
  }
  try {
    const pin = JSON.parse(await readFile(pinPath, 'utf-8'))
    return String(pin.version).replace(/^v/i, '').trim()
  } catch {
    return null
  }
}

function resolveImageName(scannerVersion) {
  if (process.env.SKILLSPECTOR_IMAGE) return process.env.SKILLSPECTOR_IMAGE
  if (scannerVersion) return `skillspector:${scannerVersion}`
  return 'skillspector'
}

async function runDockerScan(image, skillId) {
  const staging = await mkdtemp(join(tmpdir(), 'skillspector-'))
  const stagedSkill = join(staging, 'skill')
  const outName = `${skillId}.raw.json`
  try {
    await cp(join(skillsDir, skillId), stagedSkill, { recursive: true })
    await new Promise((resolvePromise, reject) => {
      const args = [
        'run',
        '--rm',
        '-v',
        `${stagedSkill}:/scan/skill:ro`,
        '-v',
        `${reportsDir}:/scan/out`,
        image,
        'scan',
        './skill',
        '--no-llm',
        '--format',
        'json',
        '--output',
        `/scan/out/${outName}`,
      ]
      const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] })
      let stderr = ''
      let stdout = ''
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
      })
      child.on('error', reject)
      child.on('close', (code) => {
        const outPath = join(reportsDir, outName)
        // SkillSpector exit 1 when risk is high, but still writes a valid JSON report.
        if (existsSync(outPath)) {
          resolvePromise()
          return
        }
        if (code !== 0) {
          reject(new Error(`docker exit ${code}: ${(stderr || stdout).trim() || 'scan failed'}`))
          return
        }
        resolvePromise()
      })
    })
    return join(reportsDir, outName)
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

async function upsertDb(skillId, report, safetyScore) {
  let PrismaClient
  try {
    ;({ PrismaClient } = require('@prisma/client'))
  } catch (error) {
    console.warn(`  ⚠ Prisma indisponible (${error.message}) — rapport fichier seulement`)
    return false
  }
  const prisma = new PrismaClient()
  try {
    const existing = await prisma.skill.findUnique({ where: { id: skillId }, select: { id: true } })
    if (!existing) {
      console.warn(`  ⚠ Skill absent en DB (seed manquant ?) — rapport fichier seulement`)
      return false
    }
    await prisma.skill.update({
      where: { id: skillId },
      data: {
        score: safetyScore,
        securityRecommendation: report.recommendation,
        securityReportJson: JSON.stringify(report),
        scannedAt: new Date(report.scannedAt),
        scanMode: report.scanMode,
      },
    })
    return true
  } finally {
    await prisma.$disconnect()
  }
}

async function ensureImage(image) {
  await new Promise((resolvePromise, reject) => {
    const child = spawn('docker', ['image', 'inspect', image], { stdio: 'ignore' })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Image Docker « ${image} » introuvable. ` +
              `Build : git clone -b v<ver> https://github.com/NVIDIA/SkillSpector.git && docker build -t ${image} .`,
          ),
        )
        return
      }
      resolvePromise()
    })
  })
}

async function main() {
  const { skills: only, limit, force, noDb, resolve, prefix } = parseArgs(process.argv.slice(2))
  await mkdir(reportsDir, { recursive: true })

  let scannerVersion = await readPinnedVersion()
  if (resolve) {
    scannerVersion = await runResolve()
  }
  if (!scannerVersion) {
    throw new Error('Version SkillSpector introuvable (skillspector-version.json ou SKILLSPECTOR_VERSION)')
  }

  const image = resolveImageName(scannerVersion)
  await ensureImage(image)

  let ids = only.length ? only : await listSkillDirs()
  if (prefix) ids = ids.filter((id) => id.includes(prefix))
  if (limit != null && Number.isFinite(limit)) ids = ids.slice(0, limit)

  console.log(`🔍 SkillSpector static — ${ids.length} skill(s), image=${image}, scanner=${scannerVersion}`)

  let scanned = 0
  let skipped = 0
  let failed = 0
  let updatedDb = 0
  const failedIds = []

  for (const skillId of ids) {
    const skillPath = join(skillsDir, skillId)
    try {
      await stat(join(skillPath, 'SKILL.md'))
    } catch {
      console.warn(`✗ ${skillId} — SKILL.md manquant`)
      failed++
      failedIds.push(skillId)
      continue
    }

    const contentHash = await hashSkillDir(skillId)
    const reportPath = join(reportsDir, `${skillId}.json`)

    if (!force) {
      try {
        const prev = JSON.parse(await readFile(reportPath, 'utf-8'))
        const sameHash = prev.contentHash === contentHash
        const sameScanner = prev.scannerVersion === scannerVersion
        if (sameHash && sameScanner) {
          console.log(`· ${skillId} — inchangé, skip`)
          skipped++
          continue
        }
        if (sameHash && !sameScanner) {
          console.log(`· ${skillId} — skill inchangé, scanner ${prev.scannerVersion ?? '?'} → ${scannerVersion}`)
        }
      } catch {
        // pas de rapport précédent
      }
    }

    process.stdout.write(`→ ${skillId} … `)
    try {
      const rawPath = await runDockerScan(image, skillId)
      const raw = JSON.parse(await readFile(rawPath, 'utf-8'))
      const report = mapSkillspectorJson(raw)
      if (!report) throw new Error('rapport JSON invalide')
      report.contentHash = contentHash
      report.scannerVersion = scannerVersion
      const safety = riskToSafetyScore(report.riskScore)
      await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')

      let dbOk = false
      if (!noDb) {
        dbOk = await upsertDb(skillId, report, safety)
        if (dbOk) updatedDb++
      }

      console.log(
        `risk=${report.riskScore} → score=${safety} (${report.recommendation}, ${report.issueCount} issues)${dbOk ? ' [db]' : ''}`,
      )
      scanned++
    } catch (error) {
      console.log(`ÉCHEC`)
      console.error(`  ${error.message}`)
      failed++
      failedIds.push(skillId)
    }
  }

  console.log(
    `\n✅ Terminé : ${scanned} scannés, ${skipped} inchangés, ${failed} échecs, ${updatedDb} mis à jour en DB`,
  )
  if (failedIds.length) {
    console.log(`✗ Non scannables (${failedIds.length}) :`)
    for (const id of failedIds) console.log(`  - ${id}`)
  }
  console.log(`📁 Rapports : ${reportsDir}`)
}

main().catch((error) => {
  console.error('❌', error.message)
  process.exit(1)
})
