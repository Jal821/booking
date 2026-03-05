export function ServiceSelector({ services, onSelect }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Service</h2>
      <p className="text-gray-500 text-sm mb-6">Choose the service you would like to book</p>
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: service.color }} />
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-700">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-gray-900">{service.price} {service.currency}</p>
                <p className="text-sm text-gray-500">{service.duration_minutes} min</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
