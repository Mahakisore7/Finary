'use client'

import { Progress } from "@/components/ui/progress"

interface BudgetProps {
  category: string
  spent: number
  limit: number
}

export function BudgetCard({ category, spent, limit }: BudgetProps) {
  const percentage = Math.min((spent / limit) * 100, 100)
  const isOver = spent > limit
  const remaining = limit - spent

  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 transition-all hover:border-zinc-700 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">
            {category}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              ₹{spent.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              / ₹{limit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-[10px] font-black tracking-widest uppercase ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
            {isOver ? 'Limit Exceeded' : `${Math.round(percentage)}% Consumed`}
          </p>
          {!isOver && (
            <p className="text-[10px] text-zinc-600 font-medium mt-1">
              ₹{remaining.toLocaleString('en-IN')} left
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="space-y-2">
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              isOver ? 'bg-red-600' : percentage > 85 ? 'bg-amber-500' : 'bg-white'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Warning message for high usage */}
        {!isOver && percentage > 85 && (
          <p className="text-[10px] text-amber-500 font-bold animate-pulse">
            ⚠️ APPROACHING LIMIT
          </p>
        )}
      </div>
    </div>
  )
}