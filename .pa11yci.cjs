/**
 * Pa11y CI — audit accessibilité (axe-core, WCAG 2 AA) sur le catalogue.
 * Base URL : PA11Y_BASE_URL ou LHCI_BASE_URL (défaut prod).
 */
const base = (
  process.env.PA11Y_BASE_URL ||
  process.env.LHCI_BASE_URL ||
  'https://arboristhree.xyz'
).replace(/\/$/, '')

/** Pages catalogue à auditer (alignées Lighthouse + packs Sonar). */
const paths = [
  '/',
  '/skills',
  '/commands',
  '/collections',
  '/getting-started',
  '/skills/accessibility',
  '/skills/skill-sonar',
  '/skills/gateguard',
  '/collections/sonar',
]

module.exports = {
  defaults: {
    timeout: 90_000,
    wait: 2_000,
    standard: 'WCAG2AA',
    runners: ['axe'],
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    },
    // Bootstrap : home / fiches skill ont encore color-contrast + aria-prohibited-attr.
    // Baisser progressivement vers 0 une fois les correctifs UI mergeés.
    threshold: 0,
    includeNotices: false,
    includeWarnings: false,
  },
  urls: paths.map((path) => `${base}${path}`),
}
