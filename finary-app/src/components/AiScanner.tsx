'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Loader2, Sparkles } from 'lucide-react'

// Define the interface to accept the refresh trigger
interface AiScannerProps {
  onSuccess?: () => void;
}

export function AiScanner({ onSuccess }: AiScannerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not logged in")

      const formData = new FormData()
      formData.append('file', file)

      // Use environment variable for deployment flexibility
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${backendUrl}/api/v1/scan-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error("AI Scan failed")

      // Success sequence
      setOpen(false)
      
      // Trigger the reactive dashboard update instantly
      if (onSuccess) onSuccess() 
      
    } catch (error) {
      console.error(error)
      alert("Scanning failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 bg-zinc-900/50 text-white hover:bg-zinc-800 transition-all">
          <Sparkles className="mr-2 h-4 w-4 text-emerald-400" /> 
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Scan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic tracking-tighter flex items-center gap-2 uppercase">
            <Camera className="h-5 w-5 text-emerald-500" /> Smart Receipt Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/30 gap-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-300 font-medium">
              Upload a photo of your receipt.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Gemini AI will extract the total, category, and date automatically.
            </p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />

          <Button 
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white text-black font-black h-12 hover:bg-zinc-200 rounded-xl uppercase tracking-tighter italic"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> 
                AI is Extracting...
              </div>
            ) : (
              "Take Photo or Upload"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}