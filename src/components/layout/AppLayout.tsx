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
  GearFineIcon
} from '@phosphor-icons/react'
import { logout } from '@/features/auth'

interface NavItem {
  to: string
  label: string
  icon: typeof SquaresFourIcon
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Utama',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: SquaresFourIcon },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { to: '/sales', label: 'Penjualan', icon: CreditCardIcon },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { to: '/products', label: 'Produk', icon: PackageIcon },
      { to: '/categories', label: 'Kategori', icon: ListBulletsIcon },
      { to: '/stock', label: 'Stok', icon: ChartBarIcon },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { to: '/settings', label: 'Pengaturan', icon: GearFineIcon },
    ],
  },
]

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

const COLLAPSED_KEY = 'lattepos_sidebar_collapsed'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === '1',
  )
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const matches = useMatches()
  const navigate = useNavigate()
  const currentPath = matches[matches.length - 1]?.fullPath ?? '/'

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSED_KEY, prev ? '0' : '1')
      return !prev
    })
  }

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
    try {
      await logout()
    } finally {
      navigate({ to: '/login' })
    }
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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-all duration-200 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16 md:w-16' : 'w-55'}`}
      >
        {/* Logo */}
        <div className={`flex h-12 shrink-0 items-center px-3 ${collapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="px-1 text-[15px] font-bold tracking-[-0.01em] text-text-primary">
            {collapsed ? 'L' : 'LattePOS'}
          </Link>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg md:hidden"
            aria-label="Tutup menu"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Navigasi utama">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className={groupIndex > 0 ? (collapsed ? 'mt-2 border-t border-border pt-2' : 'mt-4') : ''}>
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary/70">
                  {group.label}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.to === '/dashboard'
                    ? currentPath === '/dashboard'
                    : currentPath.startsWith(item.to)

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          collapsed ? 'justify-center px-0' : ''
                        } ${
                          active
                            ? 'bg-primary/8 text-primary'
                            : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                        }`}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon size={16} weight={active ? 'fill' : 'regular'} className="shrink-0" />
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-surface px-3 md:px-4">
          {/* Sidebar toggle — desktop: collapse, mobile: drawer */}
          <button
            type="button"
            className="mr-2 hidden size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          >
            <ListIcon size={18} />
          </button>
          <button
            type="button"
            className="mr-2 flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Buka menu"
          >
            <ListIcon size={18} />
          </button>

          {/* Page title from current route */}
          <h1 className="text-[14px] font-medium text-text-primary">
            {NAV_ITEMS.find((item) =>
              item.to === '/dashboard'
                ? currentPath === '/dashboard'
                : currentPath.startsWith(item.to),
            )?.label ?? 'Dashboard'}
          </h1>

          <div className="flex-1" />

          {/* User area */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              U
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-level-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-bg hover:text-secondary"
                >
                  <SignOutIcon size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
