import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/generated/**',
        'src/routeTree.gen.ts',
        'src/router.tsx',
        'src/fonts.ts',
        'src/routes/**',
        'src/test/**',
        'src/**/*.{test,spec}.{ts,tsx}',
        // Données / types / config (pas de logique métier)
        'src/lib/i18n.tsx',
        'src/lib/agent-logos.ts',
        'src/lib/publisher-logos.ts',
        'src/lib/collections-data.ts',
        'src/lib/font-preload.ts',
        'src/components/NvidiaLogo.tsx',
        'src/components/Footer.tsx',
        // Infra / glue (wrappers TanStack, Prisma, devtools)
        'src/server/db.ts',
        'src/server/functions.ts',
        'src/components/DevtoolsPanel.tsx',
        'src/components/DevtoolsGate.tsx',
        // Animation / CSS / contexte routeur Start (pas pertinents en unitaire)
        'src/components/HomeTerminal.tsx',
        'src/components/ui/shimmer-button.tsx',
      ],
    },
  },
})
