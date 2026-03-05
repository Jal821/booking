export function StaffSelector({ staff, onSelect, onBack, allowAny }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 mb-4">← Back</button>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a staff member</h2>
      <div className="space-y-3">
        {allowAny && (
          <button
            onClick={() => onSelect(null)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg">
              🎲
            </div>
            <div>
              <p className="font-medium text-gray-800">Any available</p>
              <p className="text-xs text-gray-400">We will assign the first available staff</p>
            </div>
          </button>
        )}
        {staff.map(member => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {member.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{member.name}</p>
              {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}