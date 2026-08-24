// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '#/lib/i18n'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'

describe('LangSwitch', () => {
  it('bascule FR / EN', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <LangSwitch />
      </I18nProvider>,
    )
    const en = screen.getByRole('button', { name: 'EN' })
    await user.click(en)
    expect(en.getAttribute('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('ThemeToggle', () => {
  it('affiche le bouton thème et bascule', async () => {
    const user = userEvent.setup()
    document.documentElement.setAttribute('data-theme', 'dark')
    render(
      <I18nProvider>
        <ThemeToggle />
      </I18nProvider>,
    )
    const btn = screen.getByLabelText(/thème|theme/i)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    await user.click(btn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
