import { describe, expect, it } from 'vitest'
import { AGENT_LOGO_PATH, agentLogoColor } from './agent-logos'
import { hasPublisherLogo, publisherLogoAsset } from './publisher-logos'
import { fontPreloadLinks } from './font-preload'
import { findCollectionSeed } from './collections-data'

describe('agentLogoColor', () => {
  it('couleur Claude vs currentColor', () => {
    expect(agentLogoColor('Claude')).toBe('#D97757')
    expect(agentLogoColor('Cursor')).toBe('var(--text-1)')
    expect(Object.keys(AGENT_LOGO_PATH)).toEqual(['Claude', 'Cursor', 'Codex', 'Copilot'])
  })
})

describe('publisher logos', () => {
  it('détecte assets et paths', () => {
    expect(hasPublisherLogo('Brave')).toBe(true)
    expect(publisherLogoAsset('Brave')).toBe('/publishers/brave.svg')
    expect(hasPublisherLogo('Vercel')).toBe(true)
    expect(publisherLogoAsset('Vercel')).toBeUndefined()
    expect(hasPublisherLogo('Hugging Face')).toBe(true)
    expect(publisherLogoAsset('Hugging Face')).toBe('/publishers/huggingface.svg')
    expect(hasPublisherLogo('Ollama')).toBe(true)
    expect(publisherLogoAsset('Ollama')).toBeUndefined()
    expect(hasPublisherLogo('Nous Research')).toBe(true)
    expect(publisherLogoAsset('Nous Research')).toBe('/publishers/nous-research.webp')
    expect(hasPublisherLogo('vinta')).toBe(true)
    expect(hasPublisherLogo('Context7')).toBe(true)
    expect(publisherLogoAsset('Context7')).toBe('/publishers/context7.svg')
    expect(hasPublisherLogo('Microsoft')).toBe(true)
    expect(publisherLogoAsset('Microsoft')).toBe('/publishers/microsoft.svg')
    expect(hasPublisherLogo('Arboris')).toBe(true)
    expect(publisherLogoAsset('Arboris')).toBe('/publishers/arboris.svg')
    expect(hasPublisherLogo('affaan-m')).toBe(true)
    expect(publisherLogoAsset('affaan-m')).toBe('/publishers/affaan-m.webp')
    expect(hasPublisherLogo('Yunt')).toBe(true)
    expect(publisherLogoAsset('Yunt')).toBe('/publishers/yunt.svg')
    expect(publisherLogoAsset('yunt')).toBe('/publishers/yunt.svg')
    expect(hasPublisherLogo('FastAPI')).toBe(true)
    // Logos monochromes rendus en path inline coloré (plus d'asset <img> noir).
    expect(publisherLogoAsset('FastAPI')).toBeUndefined()
    expect(hasPublisherLogo('Supabase')).toBe(true)
    expect(publisherLogoAsset('Supabase')).toBeUndefined()
    expect(hasPublisherLogo('supabase')).toBe(true)
    expect(hasPublisherLogo('.NET')).toBe(true)
    expect(publisherLogoAsset('.NET')).toBeUndefined()
    expect(hasPublisherLogo('Storybook')).toBe(true)
    expect(hasPublisherLogo('Prisma')).toBe(true)
    expect(hasPublisherLogo('Ansible')).toBe(true)
    expect(hasPublisherLogo('Alibaba')).toBe(true)
    expect(hasPublisherLogo('PyTorch')).toBe(true)
    expect(hasPublisherLogo('NextLevelBuilder')).toBe(true)
    expect(publisherLogoAsset('NextLevelBuilder')).toBe('/publishers/nextlevelbuilder.webp')
    expect(hasPublisherLogo('nextlevelbuilder')).toBe(true)
    expect(hasPublisherLogo('Inconnu')).toBe(false)
  })
})

describe('fontPreloadLinks', () => {
  it('précharge Space Grotesk 600 (LCP)', () => {
    expect(fontPreloadLinks).toHaveLength(1)
    for (const link of fontPreloadLinks) {
      expect(link).toMatchObject({ rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
      expect(link.href).toMatch(/space-grotesk.*600.*\.woff2/)
    }
  })
})

describe('findCollectionSeed', () => {
  it('trouve un pack et ignore un id inconnu', () => {
    expect(findCollectionSeed('sonar')?.kind).toBe('pack')
    expect(findCollectionSeed('nope')).toBeUndefined()
  })
})
