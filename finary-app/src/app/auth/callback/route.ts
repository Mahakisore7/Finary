import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // If "next" is in the parameters, redirect there; otherwise, go to dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Success! Send the user to the dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something goes wrong, return the user to the login page
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`)
}