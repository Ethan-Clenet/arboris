import { useEffect, useState } from 'react'
import { isMeasurementDisabled, setMeasurementDisabled } from '#/lib/analytics-optout'

/** Opt-out local `va-disable` (doc Vercel `beforeSend`). */
export default function AnalyticsOptOut() {
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    setDisabled(isMeasurementDisabled())
  }, [])

  const toggle = () => {
    const next = !disabled
    setMeasurementDisabled(next)
    setDisabled(next)
  }

  return (
    <p>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={disabled}
        className="cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[13.5px] font-medium text-[var(--text-1)] transition-colors hover:border-[var(--border-2)]"
      >
        {disabled ? 'Autoriser la mesure' : 'Ne pas être mesuré'}
      </button>
      <span className="ml-2 text-[13.5px] text-[var(--text-3)]">
        {disabled
          ? 'Les événements Analytics et Speed Insights sont ignorés sur cet appareil (localStorage va-disable).'
          : 'Enregistre une préférence locale (va-disable) pour refuser Web Analytics et Speed Insights.'}
      </span>
    </p>
  )
}
