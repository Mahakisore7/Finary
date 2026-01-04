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

  // Auto-scroll to the bottom when new messages arrive
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
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ message: userMsg })
      })

      const data = await response.json()

      // FIX: Check if answer is an object and extract text, or stringify it
      const aiResponseText = typeof data.answer === 'object' 
        ? (data.answer.text || JSON.stringify(data.answer)) 
        : data.answer

      setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please check if the backend is running." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px] w-full max-w-lg border border-zinc-800 bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
        <Bot className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-xs tracking-widest uppercase text-zinc-400">Finary AI Advisor</span>
      </div>
      
      {/* Chat Area */}
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
          <div ref={scrollRef} /> {/* Anchor for auto-scroll */}
        </div>
      </div>

      {/* Input Area */}
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