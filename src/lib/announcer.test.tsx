// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnnouncerProvider, useAnnouncer } from './announcer'
import { act } from 'react'

function Probe() {
  const announce = useAnnouncer()
  return (
    <button type="button" onClick={() => announce('Copié')}>
      go
    </button>
  )
}

describe('AnnouncerProvider', () => {
  it('expose une région live et annonce un message', async () => {
    render(
      <AnnouncerProvider>
        <Probe />
      </AnnouncerProvider>,
    )
    const live = document.querySelector('[aria-live="polite"]')
    expect(live).toBeTruthy()
    await act(async () => {
      screen.getByRole('button', { name: 'go' }).click()
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(live?.textContent).toBe('Copié')
  })

  it('jette hors provider', () => {
    expect(() => render(<Probe />)).toThrow(/AnnouncerProvider/)
  })
})
