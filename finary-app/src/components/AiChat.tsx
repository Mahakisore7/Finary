'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'ai', text: string }

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your Finary Assistant. Ask me anything about your spending or budgets.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function sendMessage() {
    if (!input.trim()) return
    
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      // 1. Get the current session and user
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      // 2. Use the live Render URL from environment variables
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          // 3. Pass the userId in the header for the SQL Agent
          'x-user-id': user.id 
        },
        body: JSON.stringify({ message: userMsg })
      })

      if (!response.ok) throw new Error("Backend response error")

      const data = await response.json()

      const aiResponseText = typeof data.answer === 'object' 
        ? (data.answer.text || JSON.stringify(data.answer)) 
        : data.answer

      setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }])
    } catch (error) {
      console.error("AI Chat Error:", error)
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble reaching the database. Please check your connection or backend logs." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px] w-full max-w-lg border border-zinc-800 bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
        <Bot className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-xs tracking-widest uppercase text-zinc-400">Finary AI Advisor</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                m.role === 'user' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin"/> 
              AI is analyzing your database...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex gap-2">
        <Input 
          placeholder="Ask about your spending..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-emerald-500 rounded-xl"
        />
        <Button 
          size="icon" 
          onClick={sendMessage} 
          disabled={loading} 
          className="bg-white text-black hover:bg-emerald-400 hover:text-white transition-all rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}