'use client'

import { createClient } from '@/lib/supabase/client'
import { AddTransaction } from '@/components/AddTransaction'
import { SetBudget } from '@/components/SetBudget'
import { TransactionList } from '@/components/TransactionList'
import { BudgetCard } from '@/components/BudgetTracker'
import { AiScanner } from '@/components/AiScanner'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AiChat } from '@/components/AiChat'
import { SpendingChart } from '@/components/SpendingChart'
import { AiInsightCard } from '@/components/AiInsightCard'
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useCallback } from 'react'
import { Download, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PRIMARY_CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Misc"];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) 
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user: activeUser } } = await supabase.auth.getUser()
    if (!activeUser) return

    setUser(activeUser)

    const [transResponse, budgetResponse] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', activeUser.id).order('transaction_date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', activeUser.id)
    ])

    setTransactions(transResponse.data || [])
    setBudgets(budgetResponse.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  const triggerRefresh = () => setRefreshKey(prev => prev + 1)

  const exportToCSV = () => {
    const headers = ["Date", "Category", "Description", "Amount"]
    const rows = transactions.map(t => [t.transaction_date, t.category, t.description, t.amount])
    const content = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Finary_Report_${new Date().toLocaleDateString()}.csv`
    a.click()
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-4">
      <Skeleton className="h-14 w-64 bg-zinc-900" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <Skeleton className="h-64 bg-zinc-900 rounded-3xl" />
          <Skeleton className="h-48 bg-zinc-900 rounded-3xl" />
        </div>
        <Skeleton className="h-[500px] bg-zinc-900 rounded-3xl" />
      </div>
    </div>
  )

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const spendingByCategory = transactions.reduce((acc: any, t) => {
    const cat = PRIMARY_CATEGORIES.includes(t.category) ? t.category : 'Misc';
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {});

  const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({ 
    category, 
    amount: Number(amount) 
  }));

  const totalSpending = transactions.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBudgetLimit = budgets.reduce((sum, item) => sum + Number(item.budget_limit), 0);
  const budgetedCategories = budgets.map(b => b.category);
  const trackedSpending = transactions
    .filter(t => budgetedCategories.includes(t.category))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetUtilization = totalBudgetLimit > 0 
    ? Math.round((trackedSpending / totalBudgetLimit) * 100) 
    : 0;

  const isFirstTimeUser = transactions.length === 0 && budgets.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 py-6 md:py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* RESPONSIVE HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Hello, {userName}</h1>
          <p className="text-zinc-500 font-medium tracking-tight text-sm md:text-base">
            Consumed <span className={budgetUtilization > 90 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{budgetUtilization}%</span> of tracked limits.
          </p>
        </div>
        
        {/* BUTTON GROUP: Scrollable on mobile to prevent layout breaking */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto bg-zinc-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md justify-start md:justify-center">
          <Button onClick={exportToCSV} variant="ghost" size="sm" className="text-zinc-500 hover:text-white uppercase text-[10px] font-bold tracking-widest px-3 md:px-4">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden md:block" />
          <div className="flex gap-2 flex-wrap">
            <AiScanner onSuccess={triggerRefresh} /> 
            <VoiceRecorder onSuccess={triggerRefresh} /> 
            <SetBudget onSuccess={triggerRefresh} />
            <AddTransaction onSuccess={triggerRefresh} />
          </div>
        </div>
      </div>

      {isFirstTimeUser ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-zinc-950 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-zinc-800 text-center space-y-6 px-6">
          <div className="h-12 w-12 md:h-16 md:w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Rocket className="h-6 w-6 md:h-8 md:w-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter">Ready to take off?</h2>
            <p className="text-zinc-500 max-w-sm mx-auto mt-2 text-sm md:text-base font-medium">Scan your first receipt or set a budget to unlock Gemini AI insights.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <SetBudget onSuccess={triggerRefresh} />
            <AddTransaction onSuccess={triggerRefresh} />
          </div>
        </div>
      ) : (
        /* RESPONSIVE GRID SYSTEM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          
          {/* Main Content: Becomes bottom section on mobile (order-2) to prioritize Chat/AI if desired */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10 order-2 lg:order-1">
            <AiInsightCard />
            
            {/* Charts & Stats: Stack vertically on mobile, side-by-side on tablet/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SpendingChart data={chartData} />
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors min-h-[180px]">
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Outflow</p>
                  <p className="mt-4 text-4xl md:text-5xl font-black text-white leading-none">₹{totalSpending.toLocaleString('en-IN')}</p>
                </div>
                <div className="pt-6 border-t border-zinc-900 flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full animate-pulse ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                   <span className="text-zinc-300 text-sm font-medium italic">{budgetUtilization > 100 ? 'Over Limit' : 'Safe Zone'}</span>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h3 className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs uppercase flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Budgets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map(b => (
                  <BudgetCard 
                    key={b.id} 
                    category={b.category} 
                    limit={Number(b.budget_limit)} 
                    spent={spendingByCategory[b.category] || 0} 
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs uppercase flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Recent Activity
              </h3>
              {/* Transaction list handles internal overflow safely */}
              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl">
                 <TransactionList transactions={transactions} />
              </div>
            </section>
          </div>

          {/* SIDEBAR / AI CHAT: Priority order-1 on mobile so it appears first */}
          <div className="space-y-4 order-1 lg:order-2">
            <h3 className="text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs uppercase flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> AI Advisor
            </h3>
            {/* Sticky only applies on large screens to avoid layout jumps on mobile */}
            <div className="lg:sticky lg:top-24 w-full">
              <AiChat />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}