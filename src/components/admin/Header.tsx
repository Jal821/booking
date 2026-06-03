'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const [businessName, setBusinessName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser')
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('name').eq('owner_user_id', user.id).single()
      setBusinessName(data?.name || '')
    }
    load()
  }, [])

  const handleLogout = async () => {
    const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser')
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <p className="text-sm font-medium text-gray-700">{businessName}</p>
      <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
        Sign out
      </button>
    </header>
  )
}
