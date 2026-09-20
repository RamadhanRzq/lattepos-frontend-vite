import { Link, useMatches, useNavigate } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'
import {
  SquaresFourIcon,
  CreditCardIcon,
  PackageIcon,
  ListBulletsIcon,
  ChartBarIcon,
  CookingPotIcon,
  ListIcon,
  XIcon,
  SignOutIcon,
} from '@phosphor-icons/react'
import { api } from '@/lib/api'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: SquaresFourIcon },
  { to: '/sales', label: 'Penjualan', icon: CreditCardIcon },
  { to: '/products', label: 'Produk', icon: PackageIcon },
  { to: '/categories', label: 'Kategori', icon: ListBulletsIcon },
  { to: '/stock', label: 'Stok', icon: ChartBarIcon },
  { to: '/kitchen', label: 'Dapur', icon: CookingPotIcon },
] as const

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const matches = useMatches()
  const navigate = useNavigate()
  const currentPath = matches[matches.length - 1]?.fullPath ?? '/'

  useEffect(() => {
    if (!userMenuOpen) return
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  async function handleLogout() {
    await api.post('/auth/logout')
    localStorage.removeItem('access_token')
    navigate({ to: '/login' })
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-55 flex-col border-r border-border bg-surface transition-transform md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-12 shrink-0 items-center px-4">
          <Link to="/" className="text-[15px] font-bold tracking-[-0.01em] text-text-primary">
            LattePOS
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = item.to === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.to)

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active
                        ? 'bg-primary/8 text-primary'
                        : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={16} weight={active ? 'fill' : 'regular'} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-surface px-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <XIcon size={18} /> : <ListIcon size={18} />}
          </button>

          {/* Page title from current route */}
          <h1 className="text-[14px] font-medium text-text-primary">
            {NAV_ITEMS.find((item) =>
              item.to === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.to),
            )?.label ?? 'Dashboard'}
          </h1>

          <div className="flex-1" />

          {/* User area */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              U
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-[160px] rounded-[8px] border border-border bg-surface py-1 shadow-level-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg hover:text-text-primary"
                >
                  <SignOutIcon size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
