import type { ReactNode } from 'react'
import Toast from '#/components/Toast'

export default function AdminToast({ show, text }: { show: boolean; text: string }) {
  return <Toast show={show} text={text} />
}

export function AdminCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  )
}

export function AdminIconBtn({
  title,
  onClick,
  danger,
  children,
}: {
  title: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)] ${
        danger ? 'hover:border-[var(--danger)] hover:text-[var(--danger)]' : ''
      }`}
    >
      {children}
    </button>
  )
}

export const adminFieldClass =
  'h-[42px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]'

export const adminTextareaClass =
  'w-full resize-y rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[14px] leading-normal text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]'
