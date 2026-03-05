import { supabase } from '@/lib/supabase'
import { BookingWidget } from '@/components/widget/BookingWidget'
import { notFound } from 'next/navigation'

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) return notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .eq('active', true)
    .order('name')

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('business_id', business.id)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {business.logo_url && (
            <img src={business.logo_url} alt={business.name} className="h-16 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-500 mt-1">Book your appointment online</p>
        </div>
        <BookingWidget
          business={business}
          services={services || []}
          staff={staff || []}
        />
      </div>
    </div>
  )
}
