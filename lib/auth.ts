import { cache } from 'react'
import { createClient } from './supabase/server'
import type { Profile } from './types'

/**
 * React.cache deduplicates these per request — both layouts and page components
 * can call them freely without extra Supabase round-trips.
 */

export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ?? null
})

export const getCurrentProfile = cache(async () => {
  const user = await getAuthUser()
  if (!user) return null
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()
  return profile ?? null
})
