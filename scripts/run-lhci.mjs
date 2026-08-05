/**
 * Lance LHCI. Sous WSL : patch chrome-launcher (tmp Linux) + Chrome Linux
 * (évite chrome.exe Windows → EACCES / GPU).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MARKER = 'Arboris WSL: use Linux tmp'
const browsersRoot = path.join(root, '.local-browsers')

function isWsl() {
  try {
    return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
  } catch {
    return false
  }
}

function patchFile(file) {
  if (!fs.existsSync(file)) return
  const src = fs.readFileSync(file, 'utf8')
  if (src.includes(MARKER)) return

  const next = src.replace(
    /case 'wsl':\r?\n\s*\/\/ We populate the user's Windows temp dir so the folder is correctly created later\r?\n\s*process\.env\.TEMP = [^;]+;\r?\n(\s*)case 'win32':/,
    `case 'wsl':\n            // ${MARKER} (Windows AppData often EACCES)\n            return makeUnixTmpDir();\n$1case 'win32':`,
  )

  if (next === src) {
    console.warn(`[lhci] could not patch ${path.relative(root, file)}`)
    return
  }
  fs.writeFileSync(file, next)
  console.log(`[lhci] patched ${path.relative(root, file)} for WSL`)
}

function findLocalChrome() {
  if (!fs.existsSync(browsersRoot)) return null
  const matches = []
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      let st
      try {
        st = fs.statSync(full)
      } catch {
        continue
      }
      if (st.isDirectory()) walk(full)
      else if (name === 'chrome' && full.includes(`${path.sep}chrome-linux`)) {
        matches.push(full)
      }
    }
  }
  walk(browsersRoot)
  matches.sort()
  return matches.at(-1) ?? null
}

function ensureLinuxChrome() {
  const existing = findLocalChrome()
  if (existing) return existing

  console.log('[lhci] téléchargement de Chrome Linux (WSL)…')
  const result = spawnSync(
    'npx',
    ['--yes', '@puppeteer/browsers', 'install', 'chrome@stable', `--path=${browsersRoot}`],
    { cwd: root, stdio: 'inherit', shell: true },
  )
  if (result.status !== 0) {
    throw new Error('Échec du téléchargement de Chrome Linux')
  }
  const chrome = findLocalChrome()
  if (!chrome) throw new Error('Chrome Linux introuvable après téléchargement')
  return chrome
}

const env = {
  ...process.env,
  TMPDIR: process.env.TMPDIR || '/tmp',
}

if (isWsl()) {
  for (const rel of [
    'node_modules/chrome-launcher/dist/utils.js',
    'node_modules/lighthouse/node_modules/chrome-launcher/dist/utils.js',
  ]) {
    patchFile(path.join(root, rel))
  }
  if (!process.env.CHROME_PATH) {
    env.CHROME_PATH = ensureLinuxChrome()
    console.log(`[lhci] CHROME_PATH=${env.CHROME_PATH}`)
  }
}

const extraArgs = process.argv.slice(2)
const result = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules/@lhci/cli/src/cli.js'),
    'autorun',
    '--config=./lighthouserc.cjs',
    ...extraArgs,
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env,
  },
)

process.exit(result.status ?? 1)
