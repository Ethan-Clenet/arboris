/** Couleurs marque (fallback monochrome). */
export const PUBLISHER_LOGO_COLOR: Record<string, string> = {
  Brave: '#FB542B',
  ECC: '#1f8a50',
  Community: '#4F8FF7',
  Flox: '#7C3AED',
  Angular: '#DD0031',
  Anthropic: '#D4A27F',
  Apollo: '#311C87',
  Auth0: '#EB5424',
  'Better Auth': '#FF5C00',
  Browserbase: '#F5A623',
  Cloudflare: '#F38020',
  CodeRabbit: '#FF6B35',
  Cypress: '#69D3A7',
  Figma: '#F24E1E',
  Flutter: '#02569B',
  Gemini: '#8E75B2',
  'Google Workspace': '#4285F4',
  Neon: '#00E699',
  Stitch: '#EA4335',
  Vercel: '#000000',
}

/**
 * Assets SVG isolés du thème (toujours lisibles).
 * Affichés dans une pastille claire — hors dark mode.
 */
export const PUBLISHER_LOGO_ASSET: Record<string, string> = {
  Angular: '/publishers/angular.svg',
  Anthropic: '/publishers/anthropic.svg',
  Apollo: '/publishers/apollo.svg',
  Auth0: '/publishers/auth0.svg',
  'Better Auth': '/publishers/better-auth.svg',
  Brave: '/publishers/brave.svg',
  Browserbase: '/publishers/browserbase.svg',
  Cloudflare: '/publishers/cloudflare.svg',
  CodeRabbit: '/publishers/coderabbit.svg',
  Community: '/publishers/community.svg',
  Cypress: '/publishers/cypress.svg',
  ECC: '/publishers/ecc.svg',
  Figma: '/publishers/figma.svg',
  Flox: '/publishers/flox.svg',
  Flutter: '/publishers/flutter.svg',
  Gemini: '/publishers/gemini.svg',
  'Google Workspace': '/publishers/google.svg',
  Neon: '/publishers/neon.svg',
  Stitch: '/publishers/stitch.svg',
  Vercel: '/publishers/vercel.svg',
}

/** @deprecated paths mono — conservés pour fallback rare. */
export const PUBLISHER_LOGO_PATH: Record<string, string> = {}

export function hasPublisherLogo(name: string): boolean {
  return name in PUBLISHER_LOGO_ASSET
}

export function publisherLogoAsset(name: string): string | undefined {
  return PUBLISHER_LOGO_ASSET[name]
}
