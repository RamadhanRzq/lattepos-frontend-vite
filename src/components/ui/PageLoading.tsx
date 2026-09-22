import { SyncLoader } from 'react-spinners'

interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({ message = 'Memuat...', className = 'py-8' }: PageLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <SyncLoader color="#36d7b7" speedMultiplier={0.8} />
      <p className="text-[13px] text-text-secondary">{message}</p>
    </div>
  )
}
