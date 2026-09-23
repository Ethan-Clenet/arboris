// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PageShell from './PageShell'
import StatusPage from './StatusPage'
import Toast from './Toast'
import SecurityBadge, { resolveSecurityTone } from './SecurityBadge'
import Icon, { PhosphorSprite } from './Icon'
import NvidiaLogo from './NvidiaLogo'
import PublisherLogo from './PublisherLogo'
import AgentLogo, { AgentBadge, AgentCompatList, AgentLogoRow, AgentLogoSprite } from './AgentLogo'
import { Button } from './Button'
import DevtoolsGate from './DevtoolsGate'

const labels = {
  unscanned: 'Non scanné',
  safe: 'Sûr',
  caution: 'Attention',
  unsafe: 'Risqué',
  score: (n: number) => `Score ${n}`,
}

describe('resolveSecurityTone', () => {
  it('privilégie la reco explicite', () => {
    expect(resolveSecurityTone(10, 'SAFE')).toBe('SAFE')
    expect(resolveSecurityTone(null, null)).toBe('UNKNOWN')
    expect(resolveSecurityTone(90, 'UNKNOWN')).toBe('SAFE')
    expect(resolveSecurityTone(60, undefined)).toBe('CAUTION')
    expect(resolveSecurityTone(20, undefined)).toBe('UNSAFE')
  })
})

describe('SecurityBadge', () => {
  it('affiche le label et le score', () => {
    render(<SecurityBadge score={92} recommendation="SAFE" labels={labels} />)
    expect(screen.getByText('Sûr')).toBeTruthy()
    expect(screen.getByText('92')).toBeTruthy()
  })

  it('mode compact sans label', () => {
    const { container } = render(
      <SecurityBadge score={null} compact labels={labels} showLabel={false} />,
    )
    expect(container.textContent).toContain('—')
  })
})

describe('PageShell / StatusPage / Toast', () => {
  it('PageShell pose l’id main-content', () => {
    render(<PageShell>hello</PageShell>)
    expect(document.getElementById('main-content')?.textContent).toBe('hello')
  })

  it('StatusPage affiche code et titre', () => {
    render(
      <StatusPage code="404" title="Introuvable" body="Perdu" icon="compass">
        <a href="/">home</a>
      </StatusPage>,
    )
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Introuvable' })).toBeTruthy()
    expect(screen.getByText('home')).toBeTruthy()
  })

  it('Toast masqué puis visible', () => {
    const { rerender } = render(<Toast show={false} text="ok" />)
    expect(screen.queryByRole('status')).toBeNull()
    rerender(<Toast show text="Copié" />)
    expect(screen.getByRole('status').textContent).toContain('Copié')
  })
})

describe('Icon / logos', () => {
  it('pointe vers le sprite SVG externe', () => {
    const { container } = render(
      <>
        <PhosphorSprite />
        <Icon name="tree" size={20} />
        <Icon name="unknown-icon" bold />
      </>,
    )
    const hrefs = [...container.querySelectorAll('use')].map((u) => u.getAttribute('href'))
    expect(hrefs[0]).toBe('/phosphor-sprite.svg#ph-tree')
    expect(hrefs[1]).toBe('/phosphor-sprite.svg#ph-bold-unknown-icon')
  })

  it('NvidiaLogo / PublisherLogo / AgentLogo', () => {
    const { rerender } = render(<NvidiaLogo title="NVIDIA" />)
    expect(screen.getByRole('img', { name: 'NVIDIA' })).toBeTruthy()

    rerender(<PublisherLogo name="Brave" />)
    expect(screen.getByAltText('Logo Brave')).toBeTruthy()

    rerender(<PublisherLogo name="Vercel" />)
    expect(screen.getByRole('img', { name: 'Logo Vercel' })).toBeTruthy()

    rerender(<PublisherLogo name="InconnuXYZ" />)
    expect(screen.queryByRole('img')).toBeNull()

    rerender(
      <>
        <AgentLogoSprite />
        <AgentLogo agent="Cursor" title="Cursor" />
        <AgentLogo agent="Autre" />
        <AgentBadge agent="Claude" active onClick={() => {}} />
        <AgentCompatList agents={['Claude', 'Cursor']} />
        <AgentLogoRow agents={['Codex']} />
      </>,
    )
    expect(screen.getAllByRole('img', { name: 'Cursor' }).length).toBeGreaterThan(0)
    expect(screen.getByTitle('Autre').textContent).toBe('A')
    expect(screen.getByRole('button', { name: 'Claude' }).getAttribute('aria-pressed')).toBe('true')
  })
})

describe('Button / DevtoolsGate', () => {
  it('Button primary', async () => {
    const user = userEvent.setup()
    render(<Button variant="primary">Go</Button>)
    const btn = screen.getByRole('button', { name: 'Go' })
    await user.click(btn)
    expect(btn).toBeTruthy()
  })

  it('DevtoolsGate ne rend rien en production', () => {
    const { container } = render(<DevtoolsGate />)
    expect(container.innerHTML).toBe('')
  })
})
