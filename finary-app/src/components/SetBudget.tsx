'use client'

import { useState } from 'react'
import { setBudget } from '@/app/dashboard/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Target, Loader2 } from 'lucide-react'

// Define the primary categories to match backend and dashboard logic
const PRIMARY_CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Misc"];

interface SetBudgetProps {
  onSuccess?: () => void;
}

export function SetBudget({ onSuccess }: SetBudgetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true) 
    try {
      const result = await setBudget(formData)
      
      if (result.success) {
        setOpen(false) 
        // Trigger the reactive update in the parent Dashboard
        if (onSuccess) onSuccess() 
      } else {
        console.error("Budget update failed:", result.error)
      }
    } catch (err) {
      console.error("Unexpected Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 rounded-xl">
          <Target className="mr-2 h-4 w-4" /> 
          <span className="text-[10px] tracking-widest font-bold uppercase">Set Budget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-white shadow-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white">
            Budget Target
          </DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Category</label>
            {/* Switched to Select to ensure data consistency */}
            <select 
              name="category" 
              required
              className="flex h-14 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-700 appearance-none"
            >
              <option value="" disabled selected>Select a category</option>
              {PRIMARY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-950">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Monthly Limit (₹)</label>
            <Input 
              name="limit" 
              type="number" 
              placeholder="5000" 
              required 
              className="bg-zinc-900/50 border-zinc-800 h-14 text-xl font-black focus:ring-zinc-700 rounded-xl" 
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-zinc-200 h-14 font-black text-lg transition-all rounded-xl uppercase italic tracking-tighter"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Saving...
              </div>
            ) : (
              'Save Budget'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}