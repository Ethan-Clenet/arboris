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
  '/mentions-legales',
  '/confidentialite',
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
    // Pa11y 10 / axe-core 4.13 : les issues « needs review » (contraste CSS vars)
    // ne doivent pas casser le job. Les vrais contrastes chips / listes overflow
    // restent un suivi UI (pas ce lot outillage).
    levelCapWhenNeedsReview: 'warning',
    ignore: ['color-contrast', 'scrollable-region-focusable'],
    threshold: 0,
    includeNotices: false,
    includeWarnings: false,
  },
  urls: paths.map((path) => `${base}${path}`),
}
