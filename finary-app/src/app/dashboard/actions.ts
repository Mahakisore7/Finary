'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Adds a new spending entry to the transactions table.
 * Linked to the "Add Transaction" modal.
 */
export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 2. Extract and format data
  const amount = formData.get('amount')
  const category = formData.get('category')
  const description = formData.get('description')

  if (!amount || !category) {
    return { error: 'Amount and Category are required' }
  }

  const rawData = {
    user_id: user.id,
    amount: parseFloat(amount as string),
    category: category as string,
    description: description as string,
    transaction_date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  }

  // 3. Insert into Supabase transactions table
  const { error } = await supabase
    .from('transactions')
    .insert([rawData])

  if (error) {
    console.error('Insert error:', error.message)
    return { error: error.message }
  }

  // 4. Refresh the UI cache to show new data immediately
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Sets or updates a spending limit for a specific category.
 * Linked to the "Set Budget" modal.
 */
export async function setBudget(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const category = formData.get('category') as string
  const limit = formData.get('limit') as string

  if (!category || !limit) {
    return { error: 'Category and Limit are required' }
  }

  // Uses upsert to either create a new budget or update an existing one
  const { error } = await supabase
    .from('budgets')
    .upsert({ 
      user_id: user.id, 
      category: category, 
      budget_limit: parseFloat(limit) 
    }, { onConflict: 'user_id,category' })

  if (error) {
    console.error('Budget error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}