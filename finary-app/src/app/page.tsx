'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { Chrome } from 'lucide-react'

export default function LandingPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-bold uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Now Powered by Gemini 2.5
        </div>
        
        <h1 className="text-7xl md:text-8xl font-black text-white italic tracking-tighter uppercase">
          Finary <span className="text-emerald-500 underline decoration-zinc-800">AI</span>
        </h1>
        
        <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
          The autonomous financial cockpit for the next generation. Scan, Speak, and chat with your money.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            onClick={handleGoogleLogin}
            size="lg" 
            className="bg-white text-black hover:bg-zinc-200 h-14 px-8 text-md font-bold rounded-2xl flex gap-3"
          >
            <Chrome className="h-5 w-5" /> Get Started with Google
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => router.push('/login')}
            className="border-zinc-800 bg-transparent text-white hover:bg-zinc-900 h-14 px-8 text-md font-bold rounded-2xl"
          >
            Log in with Email
          </Button>
        </div>
      </div>
    </div>
  )
}