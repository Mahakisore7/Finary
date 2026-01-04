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
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 1. Define Primary Categories to match the Backend schema
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
      <div className="flex justify-between items-center">
        <Skeleton className="h-14 w-64 bg-zinc-900" />
        <Skeleton className="h-12 w-80 bg-zinc-900 hidden md:block" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <Skeleton className="h-24 w-full bg-zinc-900 rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 bg-zinc-900 rounded-3xl" />
            <Skeleton className="h-64 bg-zinc-900 rounded-3xl" />
          </div>
          <Skeleton className="h-48 bg-zinc-900 rounded-3xl" />
        </div>
        <Skeleton className="h-[500px] bg-zinc-900 rounded-3xl" />
      </div>
    </div>
  )

  if (budgets.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Welcome to Finary AI
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Configure Your <br /> <span className="text-emerald-500 underline decoration-zinc-800">First Budget</span></h2>
          <p className="text-zinc-500 max-w-sm mx-auto font-medium">Setting a budget allows our AI Advisor to analyze your spending and provide proactive insights.</p>
        </div>
        <div className="bg-zinc-950 p-6 md:p-10 rounded-[2.2rem] border border-zinc-800 shadow-2xl mx-4">
             <SetBudget onSuccess={triggerRefresh} />
        </div>
      </div>
    )
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  // 2. REFINED CALCULATIONS: Map AI output to defined categories
  const spendingByCategory = transactions.reduce((acc: any, t) => {
    // Treat any non-primary category as 'Misc' for clean UI charts
    const cat = PRIMARY_CATEGORIES.includes(t.category) ? t.category : 'Misc';
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {});

  const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({ 
    category, 
    amount: Number(amount) 
  }));

  const totalSpending = transactions.reduce((sum, item) => sum + Number(item.amount), 0);
  
  // 3. FIX: Only sum budgets for defined categories
  const totalBudgetLimit = budgets.reduce((sum, item) => sum + Number(item.budget_limit), 0);

  // 4. FIX: Calculate utilization based only on tracked (budgeted) categories
  const budgetedCategories = budgets.map(b => b.category);
  const trackedSpending = transactions
    .filter(t => budgetedCategories.includes(t.category))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetUtilization = totalBudgetLimit > 0 
    ? Math.round((trackedSpending / totalBudgetLimit) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Hello, {userName}</h1>
          <p className="text-zinc-500 font-medium tracking-tight">
            Consumed <span className={budgetUtilization > 90 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{budgetUtilization}%</span> of your tracked monthly limits.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto bg-zinc-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md justify-center md:justify-start">
          <Button onClick={exportToCSV} variant="ghost" size="sm" className="text-zinc-500 hover:text-white gap-2 uppercase text-[10px] font-bold tracking-widest px-4">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden md:block" />
          <div className="flex gap-2">
            <AiScanner onSuccess={triggerRefresh} /> 
            <VoiceRecorder onSuccess={triggerRefresh} /> 
          </div>
          <div className="flex gap-2">
            <SetBudget onSuccess={triggerRefresh} />
            <AddTransaction onSuccess={triggerRefresh} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <AiInsightCard />
          
          <div className="grid gap-6 md:grid-cols-2">
            <SpendingChart data={chartData} />
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Outflow</p>
                <p className="mt-4 text-5xl font-black text-white leading-none">₹{totalSpending.toLocaleString('en-IN')}</p>
              </div>
              <div className="pt-6 border-t border-zinc-900">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Risk Status</p>
                <div className="flex items-center gap-2">
                   {/* Utilization logic applied to risk dot */}
                   <div className={`h-2 w-2 rounded-full animate-pulse ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                   <span className="text-zinc-300 font-medium italic">{budgetUtilization > 100 ? 'Over Limit' : 'Safe Zone'}</span>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Budgets
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
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
            <h3 className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Recent Activity
            </h3>
            <TransactionList transactions={transactions} />
          </section>
        </div>

        <div className="space-y-4">
          <h3 className="text-zinc-500 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> AI Advisor
          </h3>
          <div className="sticky top-24">
            <AiChat />
          </div>
        </div>
      </div>
    </div>
  )
}