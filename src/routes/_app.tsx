import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout'
import { fetchMe } from '@/features/auth'

export const Route = createFileRoute('/_app')({
  ssr: false,
  beforeLoad: async () => {
    if (!localStorage.getItem('access_token')) {
      throw redirect({ to: '/login' })
    }
    try {
      await fetchMe()
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayoutWrapper,
})

function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
