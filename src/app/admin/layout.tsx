import { Sidebar } from '@/components/admin/Sidebar'
import { MobileSidebarToggle } from '@/components/admin/MobileSidebarToggle'

export const metadata = {
  title: 'Admin — Ubumenyi',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3457A6]">
            <span className="text-[10px] font-bold text-white">U</span>
          </div>
          <span className="text-sm font-semibold text-[#0F172A]">Ubumenyi Admin</span>
        </div>
        <MobileSidebarToggle />
      </div>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
