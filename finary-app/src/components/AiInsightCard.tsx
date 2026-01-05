'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

export function AiInsightCard() {
  const [insight, setInsight] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchInsight() {
      setIsLoading(true)
      try {
        // 1. Ensure user is authenticated before calling backend
        const { data: { session } } = await supabase.auth.getSession()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !session) return

        // 2. Use the live Render URL from environment variables
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        const res = await fetch(`${baseUrl}/api/v1/proactive-insight`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            // 3. SECURE HANDSHAKE: Pass the specific ID for multi-user isolation
            'x-user-id': user.id 
          }
        })

        if (!res.ok) throw new Error("Insight fetch failed")

        const data = await res.json()
        setInsight(data.insight)
      } catch (error) {
        console.error("Insight Error:", error)
        setInsight("Tracking your spending to unlock smart trends.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchInsight()
  }, [supabase])

  return (
    <div className="relative group overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50 animate-gradient-x">
      <div className="bg-zinc-950 rounded-[23px] p-6 h-full transition-all group-hover:bg-zinc-900/50">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className={`h-5 w-5 text-emerald-400 ${isLoading ? 'animate-pulse' : ''}`} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              AI Financial Insight
            </h4>
            <p className="text-zinc-200 text-sm font-medium leading-relaxed italic">
              "{insight || 'Analyzing your spending patterns...'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}