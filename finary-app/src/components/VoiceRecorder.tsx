'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Mic, StopCircle, Loader2 } from 'lucide-react'

// Define the interface to accept the refresh trigger from Dashboard
interface VoiceRecorderProps {
  onSuccess?: () => void;
}

export function VoiceRecorder({ onSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Use standard audio/wav for better Gemini compatibility
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await uploadAudio(audioBlob)
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone Access Denied:", err)
      alert("Please allow microphone access to use voice notes.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadAudio = async (blob: Blob) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const formData = new FormData()
      formData.append('file', blob, 'recording.wav')

      // API Call to your FastAPI backend
      // Use environment variable for the URL to make deployment easier later
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/api/v1/voice-entry`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: formData
      })

      if (response.ok) {
        console.log("🚀 AI Voice Entry Successful")
        // Trigger the reactive update in the Dashboard
        if (onSuccess) onSuccess() 
      } else {
        const errorData = await response.json()
        console.error("Backend Error:", errorData.detail)
      }
    } catch (err) {
      console.error("Voice Upload Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant={isRecording ? "destructive" : "outline"}
      className={`border-white/10 bg-zinc-900/50 text-white transition-all duration-300 ${
        isRecording ? 'ring-2 ring-red-500/50 scale-105' : 'hover:bg-zinc-800'
      }`}
      disabled={loading}
      onClick={isRecording ? stopRecording : startRecording}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Syncing...</span>
        </div>
      ) : isRecording ? (
        <div className="flex items-center gap-2">
          <StopCircle className="h-4 w-4 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Stop Recording</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-orange-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Voice Note</span>
        </div>
      )}
    </Button>
  )
}