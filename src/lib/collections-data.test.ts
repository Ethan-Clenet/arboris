import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COLLECTIONS, findCollectionSeed } from './collections-data'

const SKILLS_DIR = join(process.cwd(), 'prisma/skills')

describe('COLLECTIONS', () => {
  it('a des ids uniques et des champs requis', () => {
    const ids = COLLECTIONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const collection of COLLECTIONS) {
      expect(collection.id).toBeTruthy()
      expect(collection.labelFr).toBeTruthy()
      expect(collection.labelEn).toBeTruthy()
      expect(['featured', 'pack']).toContain(collection.kind)
      expect(Array.isArray(collection.skillIds)).toBe(true)
      expect(Array.isArray(collection.commandIds)).toBe(true)
    }
  })

  it('embarque le pack Sonar attendu', () => {
    const sonar = COLLECTIONS.find((c) => c.id === 'sonar')
    expect(sonar?.commandIds).toContain('sonar')
    expect(sonar?.skillIds).toContain('skill-sonar')
    expect(findCollectionSeed('sonar')?.id).toBe('sonar')
    expect(findCollectionSeed('__nope__')).toBeUndefined()
  })

  it('résout les alias courts de collections', () => {
    expect(findCollectionSeed('tanstack')?.id).toBe('tanstack-starter')
    expect(findCollectionSeed('TanStack')?.id).toBe('tanstack-starter')
    expect(findCollectionSeed('prisma-postgres')?.id).toBe('prisma-postgres-starter')
    expect(findCollectionSeed('n8n')?.id).toBe('n8n-starter')
    expect(findCollectionSeed('flutter')?.id).toBe('flutter-starter')
    expect(findCollectionSeed('kotlin')?.id).toBe('kotlin-starter')
    expect(findCollectionSeed('swift')?.id).toBe('swift-starter')
    expect(findCollectionSeed('huggingface')?.id).toBe('huggingface-starter')
    expect(findCollectionSeed('google-workspace')?.id).toBe('google-workspace-starter')
  })

  it('embarque les packs Docker et n8n', () => {
    const docker = COLLECTIONS.find((c) => c.id === 'docker-ops-starter')
    expect(docker?.skillIds).toContain('docker-patterns')
    expect(docker?.commandIds).toContain('docker-rebuild')

    const n8n = COLLECTIONS.find((c) => c.id === 'n8n-starter')
    expect(n8n?.kind).toBe('pack')
    expect(n8n?.skillIds).toEqual(
      expect.arrayContaining(['n8n-patterns', 'docker-patterns', 'api-design', 'error-handling']),
    )
    expect(n8n?.commandIds).toContain('docker-rebuild')
    expect(findCollectionSeed('n8n-starter')?.id).toBe('n8n-starter')
  })

  it('ne référence aucun skill absent du disque', () => {
    for (const collection of COLLECTIONS) {
      for (const skillId of collection.skillIds) {
        expect(
          existsSync(join(SKILLS_DIR, skillId, 'SKILL.md')),
          `${collection.id} → ${skillId}`,
        ).toBe(true)
      }
    }
  })

  it('embarque le pack Ship safely avec les audits CWE/CAPEC', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'ship-safely')
    expect(pack?.kind).toBe('pack')
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining([
        'cve-scan',
        'cwe-code-audit',
        'capec-code-audit',
        'security-review',
        'security-audit',
      ]),
    )
    expect(pack?.skillIds).toHaveLength(5)
    expect(findCollectionSeed('ship-safely')?.id).toBe('ship-safely')
  })

  it('embarque Ansible, .NET et Supabase officiels', () => {
    const ansible = COLLECTIONS.find((c) => c.id === 'ansible-starter')
    expect(ansible?.kind).toBe('pack')
    expect(ansible?.skillIds.some((id) => id.includes('td-ansible-creator'))).toBe(true)

    const dotnet = COLLECTIONS.find((c) => c.id === 'dotnet-starter')
    expect(dotnet?.kind).toBe('pack')
    expect(dotnet?.skillIds.some((id) => id.includes('dotnet-webapi'))).toBe(true)

    const supabase = COLLECTIONS.find((c) => c.id === 'supabase-starter')
    expect(supabase?.skillIds.some((id) => id.includes('supabase-agent-skills'))).toBe(true)
  })

  it('ajoute Prisma au pack Node et Storybook au pack React', () => {
    const node = COLLECTIONS.find((c) => c.id === 'node-api-starter')
    expect(node?.skillIds).toEqual(expect.arrayContaining(['prisma-patterns']))
    expect(node?.skillIds.some((id) => id.includes('prisma-client-api'))).toBe(true)

    const react = COLLECTIONS.find((c) => c.id === 'react-ts-starter')
    expect(react?.skillIds.some((id) => id.includes('storybook-init'))).toBe(true)
    expect(react?.skillIds.some((id) => id.includes('storybookjs-mcp'))).toBe(true)
  })

  it('embarque le pack Prisma + PostgreSQL', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'prisma-postgres-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining([
        'prisma-patterns',
        'postgres',
        'postgres-patterns',
        'database-migrations',
        'neon-postgres',
        'backend-patterns',
      ]),
    )
    expect(pack?.commandIds).toEqual(expect.arrayContaining(['db-migrate-smoke', 'commit']))
    expect(findCollectionSeed('prisma-postgres-starter')?.id).toBe('prisma-postgres-starter')
  })

  it('embarque le pack Flutter', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'flutter-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.labelFr).toBe('Flutter')
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining([
        'dart-flutter-patterns',
        'flutter-apply-architecture-best-practices',
        'flutter-add-widget-test',
        'flutter-dart-code-review',
        'firebase-basics',
      ]),
    )
    expect(pack?.skillIds).not.toContain('dart-build-cli-app')
    expect(pack?.skillIds).not.toContain('dart-use-ffigen')
    expect(pack?.skillIds).not.toContain('dart-setup-ffi-assets')
    expect(pack?.commandIds).toEqual(expect.arrayContaining(['commit', 'ready-pr', 'review-pr', 'explain-code']))
    expect(findCollectionSeed('flutter-starter')?.id).toBe('flutter-starter')
    expect(findCollectionSeed('flutter')?.id).toBe('flutter-starter')
  })

  it('embarque le pack Yunt — Docker', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'yunt-docker')
    expect(pack?.kind).toBe('pack')
    expect(pack?.skillIds).toEqual([
      'yunt-docker-fundamentals',
      'yunt-docker-containers',
      'yunt-docker-images-build',
      'yunt-docker-volumes-networks',
      'yunt-docker-compose',
    ])
    expect(findCollectionSeed('yunt')?.id).toBe('yunt-docker')
    expect(findCollectionSeed('yunt-docker')?.id).toBe('yunt-docker')
    // `docker` reste l’alias de docker-ops-starter (pas yunt-docker)
    expect(findCollectionSeed('docker')?.id).toBe('docker-ops-starter')
  })

  it('compte 28 collections', () => {
    expect(COLLECTIONS).toHaveLength(28)
  })

  it('embarque le pack Kotlin (8 skills first-party)', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'kotlin-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.labelFr).toBe('Kotlin')
    expect(pack?.skillIds).toHaveLength(8)
    expect(pack?.skillIds).toEqual([
      'kotlin-patterns',
      'kotlin-coroutines-flows',
      'kotlin-ktor-patterns',
      'kotlin-exposed-patterns',
      'kotlin-testing',
      'compose-multiplatform-patterns',
      'android-clean-architecture',
      'apollo-kotlin',
    ])
    expect(pack?.commandIds).toEqual(['commit', 'ready-pr', 'review-pr', 'explain-code'])
    expect(findCollectionSeed('kotlin-starter')?.id).toBe('kotlin-starter')
  })

  it('embarque le pack Swift (8 skills)', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'swift-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.labelFr).toBe('Swift')
    expect(pack?.skillIds).toHaveLength(8)
    expect(pack?.skillIds).toEqual([
      'swiftui-patterns',
      'swift-concurrency-6-2',
      'swift-actor-persistence',
      'swift-protocol-di-testing',
      'foundation-models-on-device',
      'ios-icon-gen',
      'figma-swiftui',
      'apollo-ios',
    ])
    expect(pack?.commandIds).toEqual(['commit', 'ready-pr', 'review-pr', 'explain-code'])
    expect(findCollectionSeed('swift-starter')?.id).toBe('swift-starter')
  })

  it('embarque le pack Hugging Face (produits officiels, sans CI ni kernels)', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'huggingface-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.labelFr).toBe('Hugging Face')
    expect(pack?.skillIds).toHaveLength(9)
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining([
        'huggingface-llm-trainer__huggingface-skills__skills-955045b18625',
        'huggingface-datasets__huggingface-skills__skills-ebb42bcb0d99',
        'huggingface-gradio__huggingface-skills__skills-f590c3a4e2fc',
        'huggingface-spaces__huggingface-skills__skills-d8a00a89959f',
        'transformers-js__huggingface-skills__skills-5bf8a39ad389',
        'trl-training__huggingface-skills__skills-87c5c166e35a',
        'pytorch-patterns',
        'mle-workflow',
        'ml-adoption-playbook',
      ]),
    )
    expect(pack?.skillIds.some((id) => id.includes('kernel'))).toBe(false)
    expect(pack?.skillIds.some((id) => id.includes('pytorch-ci'))).toBe(false)
    expect(pack?.skillIds.some((id) => id.includes('huggingface-kernels'))).toBe(false)
    expect(pack?.skillIds.some((id) => id.includes('huggingface-mlclaw'))).toBe(false)
    expect(pack?.commandIds).toEqual(['commit', 'ready-pr', 'review-pr', 'explain-code'])
    expect(findCollectionSeed('huggingface-starter')?.id).toBe('huggingface-starter')
  })

  it('embarque le pack Google Workspace (~15 skills gws/recipe)', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'google-workspace-starter')
    expect(pack?.kind).toBe('pack')
    expect(pack?.labelFr).toBe('Google Workspace')
    expect(pack?.skillIds).toHaveLength(15)
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining([
        'gws-gmail',
        'gws-drive',
        'gws-calendar',
        'gws-docs',
        'gws-sheets',
        'recipe-label-and-archive-emails',
        'recipe-organize-drive-folder',
        'recipe-generate-report-from-sheet',
      ]),
    )
    expect(pack?.skillIds.filter((id) => id.startsWith('recipe-'))).toHaveLength(3)
    expect(pack?.commandIds).toEqual(['commit', 'ready-pr', 'review-pr', 'explain-code'])
    expect(findCollectionSeed('google-workspace-starter')?.id).toBe('google-workspace-starter')
  })
})
