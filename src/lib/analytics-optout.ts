export const VA_DISABLE_KEY = 'va-disable'

export function isMeasurementDisabled(): boolean {
  try {
    return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(VA_DISABLE_KEY))
  } catch {
    return false
  }
}

export function setMeasurementDisabled(disabled: boolean): void {
  try {
    if (disabled) localStorage.setItem(VA_DISABLE_KEY, '1')
    else localStorage.removeItem(VA_DISABLE_KEY)
  } catch {
    // navigation privée / quota
  }
}

/** `beforeSend` Vercel Analytics / Speed Insights : drop si `va-disable` est posé. */
export function beforeSendMeasurement<T>(event: T): T | null {
  return isMeasurementDisabled() ? null : event
}
