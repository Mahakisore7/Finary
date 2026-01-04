import { UserNav } from "@/components/UserNav"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* GLOBAL NAVIGATION BAR */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl italic">F</span>
            </div>
            <span className="font-black text-xl tracking-tighter italic uppercase">Finary AI</span>
          </div>
          
          {/* Profile Dropdown */}
          <UserNav userEmail={user?.email || ""} />
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}