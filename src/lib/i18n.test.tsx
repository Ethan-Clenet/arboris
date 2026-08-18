// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { I18nProvider, useI18n } from './i18n'

function Probe() {
  const { lang, setLang, t } = useI18n()
  return (
    <div>
      <p data-testid="brand">{t.nav.brand}</p>
      <p data-testid="count">{t.home.footerCount(3)}</p>
      <p data-testid="lang">{lang}</p>
      <button type="button" onClick={() => setLang('en')}>
        en
      </button>
    </div>
  )
}

describe('I18nProvider', () => {
  it('fournit le français par défaut et bascule en anglais', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )
    expect(screen.getByTestId('brand').textContent).toBe('Arboris')
    expect(screen.getByTestId('count').textContent).toMatch(/3/)
    expect(screen.getByTestId('lang').textContent).toBe('fr')
    await user.click(screen.getByRole('button', { name: 'en' }))
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('relit la langue depuis localStorage', async () => {
    window.localStorage.setItem('sp-lang', 'en')
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('en')
    })
  })
})

describe('useI18n', () => {
  it('jette hors provider', () => {
    expect(() => render(<Probe />)).toThrow(/I18nProvider/)
  })
})
