const base = (process.env.LHCI_BASE_URL || 'https://arboris-three.vercel.app').replace(
  /\/$/,
  '',
)

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        `${base}/`,
        `${base}/skills`,
        `${base}/commands`,
        `${base}/collections`,
        `${base}/getting-started`,
        `${base}/skills/accessibility`,
      ],
      settings: {
        // CI / conteneurs Linux
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      // Seuils prudents au départ — on pourra durcir ensuite.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Liens publics temporaires (~7 jours) dans les logs CI
      target: 'temporary-public-storage',
    },
  },
}
