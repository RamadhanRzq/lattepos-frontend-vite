import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-100">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-[28px] font-bold tracking-[-0.01em] text-text-primary">
              Latte<span className="text-primary">POS</span>
            </h1>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-level-2 sm:p-8">
          <h2 className="mb-1 text-[22px] font-bold tracking-[-0.01em] text-text-primary">
            Masuk
          </h2>
          <p className="mb-6 text-[14px] text-text-secondary">
            Masuk ke akun LattePOS kamu.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}