'use client'
import { useEffect, useState } from 'react'

export function useBusinessId() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only runs on client - safe to import browser client here
    const load = async () => {
      try {
        const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser')
        const supabase = createSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return setLoading(false)
        const { data } = await supabase.from('businesses').select('id').eq('owner_user_id', user.id).single()
        setBusinessId(data?.id ?? null)
      } catch (e) {
        console.error('useBusinessId error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { businessId, loading }
}
