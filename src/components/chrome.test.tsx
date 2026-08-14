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
  it('affiche le bouton thème', () => {
    render(
      <I18nProvider>
        <ThemeToggle />
      </I18nProvider>,
    )
    expect(screen.getByLabelText(/thème|theme/i).getAttribute('aria-pressed')).toBe('true')
  })
})
