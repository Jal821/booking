'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export function useBusinessId() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data } = await supabase.from('businesses').select('id').eq('owner_user_id', user.id).single()
      setBusinessId(data?.id ?? null)
      setLoading(false)
    }
    load()
  }, [])

  return { businessId, loading }
}
