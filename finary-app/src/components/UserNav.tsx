'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

export function UserNav({ userEmail }: { userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Pull Google data from user metadata
        setAvatarUrl(user.user_metadata.avatar_url)
        setFullName(user.user_metadata.full_name)
      }
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-800 bg-zinc-950 p-0 overflow-hidden hover:bg-zinc-900 transition-all">
          <Avatar className="h-10 w-10">
            {/* The AvatarImage pulls the actual Google photo */}
            <AvatarImage src={avatarUrl || ""} alt={fullName || "User"} />
            <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs">
              {userEmail.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-zinc-950 border-zinc-800 text-white p-2 rounded-2xl" align="end">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-bold leading-none">{fullName || 'Account'}</p>
            <p className="text-xs leading-none text-zinc-500 truncate">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-900 rounded-lg py-2">
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-900 rounded-lg py-2">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-400 cursor-pointer hover:bg-zinc-900 rounded-lg py-2">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}