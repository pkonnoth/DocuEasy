'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuditLogger } from '@/utils/auditLogger'

export async function signIn(formData) {
  const supabase = createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Log failed login attempt
    try {
      const serverSupabase = createClient()
      await serverSupabase
        .from('audit_logs')
        .insert({
          actor_email: email,
          action: 'user_login_failed',
          result_status: 'failure',
          result_error_message: error.message,
          requested_at: new Date().toISOString()
        })
    } catch (auditError) {
      console.error('Failed to log failed login attempt:', auditError)
    }
    
    return { error: error.message }
  }

  // Get role from user metadata
  const userRole = data.user.user_metadata?.role || 'clinician'

  // Log successful login
  try {
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: data.user.id,
        actor_email: email,
        actor_role: userRole,
        action: 'user_login',
        result_status: 'success',
        requested_at: new Date().toISOString()
      })
  } catch (auditError) {
    console.error('Failed to log successful login:', auditError)
  }

  revalidatePath('/', 'layout')
  redirect('/patients')
}

export async function signOut() {
  const supabase = createClient()
  
  // Get current user for audit log
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Get role from user metadata
    const userRole = user.user_metadata?.role || 'clinician'

    // Log logout before signing out
    try {
      await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: user.id,
          actor_email: user.email,
          actor_role: userRole,
          action: 'user_logout',
          result_status: 'success',
          requested_at: new Date().toISOString()
        })
    } catch (auditError) {
      console.error('Failed to log logout:', auditError)
    }
  }

  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}