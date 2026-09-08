/**
 * Lance pa11y-ci (axe) contre le catalogue.
 * Env : PA11Y_BASE_URL ou LHCI_BASE_URL.
 *
 * Exit non-zéro si une URL dépasse le threshold (même avec --json).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

function resolvePa11yCiBin() {
  // 1) shim npm local
  const shim = join(root, 'node_modules', '.bin', 'pa11y-ci')
  if (existsSync(shim)) return { command: shim, argsPrefix: [] }

  // 2) entrée package (robuste aux layouts npm/pnpm)
  try {
    const pkgJson = require.resolve('pa11y-ci/package.json', { paths: [root] })
    const pkg = require(pkgJson)
    const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.['pa11y-ci']
    if (binRel) {
      const binPath = join(dirname(pkgJson), binRel)
      if (existsSync(binPath)) return { command: process.execPath, argsPrefix: [binPath] }
    }
  } catch {
    // ignore
  }

  return null
}

const resolved = resolvePa11yCiBin()
if (!resolved) {
  console.error('❌ pa11y-ci introuvable dans node_modules.')
  console.error('   Installe les deps : npm install --legacy-peer-deps')
  process.exit(1)
}

const reportsDir = join(root, 'pa11y-reports')
mkdirSync(reportsDir, { recursive: true })

const base = (
  process.env.PA11Y_BASE_URL ||
  process.env.LHCI_BASE_URL ||
  'https://arboristhree.xyz'
).replace(/\/$/, '')

console.log(`[pa11y] base=${base}`)
console.log(`[pa11y] runners=axe · standard=WCAG2AA`)

const configPath = join(root, '.pa11yci.cjs')
const jsonPath = join(reportsDir, 'report.json')

const result = spawnSync(
  resolved.command,
  [...resolved.argsPrefix, `--config=${configPath}`, `--json`],
  {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      PA11Y_BASE_URL: base,
      LHCI_BASE_URL: process.env.LHCI_BASE_URL || base,
    },
    maxBuffer: 20 * 1024 * 1024,
    shell: false,
  },
)

const stdout = result.stdout ?? ''
const stderr = result.stderr ?? ''
if (stderr) process.stderr.write(stderr)

if (result.error) {
  console.error('❌', result.error.message)
  if (result.error.code === 'ENOENT') {
    console.error('   Installe les deps : npm install --legacy-peer-deps')
  }
  process.exit(1)
}

let report = null
if (stdout.trim()) {
  try {
    report = JSON.parse(stdout)
    writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  } catch {
    writeFileSync(jsonPath, stdout, 'utf8')
    process.stdout.write(stdout)
  }
}

if (!report || typeof report !== 'object') {
  console.error('❌ Rapport Pa11y JSON invalide')
  process.exit(result.status && result.status !== 0 ? result.status : 1)
}

const total = Number(report.total) || 0
const passes = Number(report.passes) || 0
const errors = Number(report.errors) || 0
console.log(`[pa11y] urls=${total} passes=${passes} errors=${errors}`)
console.log(`[pa11y] rapport → ${jsonPath}`)

for (const [url, issues] of Object.entries(report.results ?? {})) {
  const count = Array.isArray(issues) ? issues.length : 0
  if (count > 0) {
    const codes = [...new Set(issues.map((i) => i.code).filter(Boolean))]
    console.log(`  ✗ ${url} — ${count} issue(s)${codes.length ? ` [${codes.join(', ')}]` : ''}`)
  } else {
    console.log(`  ✓ ${url}`)
  }
}

const failed = passes < total || (result.status != null && result.status !== 0)
if (failed) {
  console.error(`❌ Pa11y : ${passes}/${total} URLs OK`)
  process.exit(1)
}

console.log(`✅ Pa11y : ${passes}/${total} URLs OK`)
process.exit(0)
