import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-hero">
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 py-2">
            <div className="flex items-center justify-between xl:hidden">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                  CMP1058
                </p>
                <h1 className="text-xl font-bold">Courses Platform</h1>
              </div>
              <Button variant="outline" size="sm">
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </Button>
            </div>

            <AppHeader />
            <div className="page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
