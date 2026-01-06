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

  // Auto-scroll logic to keep the latest message in view
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
      // 1. Authenticate session for the Secure Handshake
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || !session) {
        setMessages(prev => [...prev, { role: 'ai', text: "Please sign in to access your personal financial advisor." }])
        return
      }

      // 2. Resolve API Endpoint
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          // PRIVACY HANDSHAKE: Injects the specific user identity into the AI Agent loop
          'x-user-id': user.id 
        },
        body: JSON.stringify({ message: userMsg })
      })

      if (!response.ok) throw new Error("Backend connection failed")

      const data = await response.json()

      // --- BULLETPROOF PARSER: Fixes JSON Leakage ---
      let aiResponseText = ""
      const rawAnswer = data.answer

      if (Array.isArray(rawAnswer)) {
        // Handle the format: [{"type": "text", "text": "..."}] seen in screenshots
        aiResponseText = rawAnswer[0]?.text || rawAnswer[0]?.output || JSON.stringify(rawAnswer)
      } else if (typeof rawAnswer === 'object' && rawAnswer !== null) {
        // Handle standard object outputs
        aiResponseText = rawAnswer.output || rawAnswer.text || JSON.stringify(rawAnswer)
      } else {
        // Standard string output
        aiResponseText = String(rawAnswer)
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }])
    } catch (error) {
      console.error("AI Chat Error:", error)
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the AI Agent. Please ensure your backend is live." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[400px] md:h-[500px] w-full max-w-lg border border-zinc-800 bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl transition-all">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
        <Bot className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-xs tracking-widest uppercase text-zinc-400">Finary AI Advisor</span>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                m.role === 'user' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin"/> 
              AI is querying your personal vault...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex gap-2">
        <Input 
          placeholder="Ask about spending..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="bg-zinc-950 border-zinc-800 text-white text-base focus-visible:ring-emerald-500 rounded-xl"
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