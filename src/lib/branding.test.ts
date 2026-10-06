import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AGENT_LOGO_PATH, agentLogoColor } from './agent-logos'
import {
  contrastSafeFill,
  hasPublisherLogo,
  PUBLISHER_LOGO_ASSET,
  PUBLISHER_LOGO_COLOR,
  PUBLISHER_LOGO_NATIVE,
  publisherLogoAsset,
  publisherLogoIsNative,
  publisherLogoPaint,
} from './publisher-logos'
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
    expect(publisherLogoAsset('Vercel')).toBe('/publishers/vercel.svg')
    expect(hasPublisherLogo('Hugging Face')).toBe(true)
    expect(publisherLogoAsset('Hugging Face')).toBe('/publishers/huggingface.svg')
    expect(hasPublisherLogo('Ollama')).toBe(true)
    expect(publisherLogoAsset('Ollama')).toBe('/publishers/ollama.svg')
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
    expect(publisherLogoAsset('FastAPI')).toBe('/publishers/fastapi.svg')
    expect(hasPublisherLogo('Supabase')).toBe(true)
    expect(publisherLogoAsset('Supabase')).toBe('/publishers/supabase.svg')
    expect(hasPublisherLogo('supabase')).toBe(true)
    expect(hasPublisherLogo('.NET')).toBe(true)
    expect(publisherLogoAsset('.NET')).toBe('/publishers/net.svg')
    expect(hasPublisherLogo('Storybook')).toBe(true)
    expect(hasPublisherLogo('Prisma')).toBe(true)
    expect(hasPublisherLogo('Ansible')).toBe(true)
    expect(hasPublisherLogo('Alibaba')).toBe(true)
    expect(hasPublisherLogo('PyTorch')).toBe(true)
    expect(hasPublisherLogo('NextLevelBuilder')).toBe(true)
    expect(publisherLogoAsset('NextLevelBuilder')).toBe('/publishers/nextlevelbuilder.webp')
    expect(hasPublisherLogo('nextlevelbuilder')).toBe(true)
    expect(hasPublisherLogo('Inconnu')).toBe(false)
    expect(publisherLogoIsNative('Brave')).toBe(true)
    expect(publisherLogoIsNative('Microsoft')).toBe(true)
    expect(publisherLogoIsNative('FastAPI')).toBe(false)
    expect(publisherLogoIsNative('Vercel')).toBe(false)
  })

  it('peint les silhouettes en couleur marque, adapté clair/sombre', () => {
    expect(publisherLogoPaint('FastAPI')).toBe('#009688')
    expect(publisherLogoPaint('Angular')).toBe('#DD0031')
    expect(publisherLogoPaint('TanStack')).toBe('#FF4154')
    expect(publisherLogoPaint('Vercel')).toBe('var(--text-1)')
    expect(publisherLogoPaint('Ollama')).toBe('var(--text-1)')
    expect(publisherLogoPaint('FastAPI', true)).toBe('currentColor')
    expect(contrastSafeFill('#F4F4F5')).toBe('var(--text-1)')
    expect(contrastSafeFill('#0A0A0A')).toBe('var(--text-1)')
    expect(contrastSafeFill('#009688')).toBe('#009688')
  })

  it('les SVG silhouettes portent la couleur de marque, pas le gris #888888', () => {
    for (const [name, src] of Object.entries(PUBLISHER_LOGO_ASSET)) {
      if (PUBLISHER_LOGO_NATIVE.has(name) || !src.endsWith('.svg')) continue
      const svg = readFileSync(join(process.cwd(), 'public', src.replace(/^\//, '')), 'utf8')
      const color = PUBLISHER_LOGO_COLOR[name]
      expect(svg.includes('#888888'), `${name} still gray`).toBe(false)
      expect(color, name).toBeTruthy()
      expect(svg.toLowerCase().includes(color.toLowerCase()), `${name} missing ${color}`).toBe(true)
    }
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
