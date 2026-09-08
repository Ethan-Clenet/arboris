import Icon from '#/components/Icon'

type ToastProps = {
  show: boolean
  text: string
}

/** Toast flottant de confirmation (copie, actions UI, etc.). */
export default function Toast({ show, text }: ToastProps) {
  if (!show) return null

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
    >
      <div className="animate-toast-in flex items-center gap-2.5 rounded-[11px] bg-[var(--text-1)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--bg)] shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <Icon name="check-circle" bold size={17} className="text-[var(--accent)]" />
        {text}
      </div>
    </div>
  )
}
