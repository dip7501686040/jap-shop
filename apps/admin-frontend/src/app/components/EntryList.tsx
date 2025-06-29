import React from "react"

interface Entry {
  id: string
  type: "GAVE" | "GOT"
  amount: number
  date: string
  time: string
}

export default function EntryList({ entries, onSelect }: { entries: Entry[]; onSelect: (entry: Entry) => void }) {
  // Show message when no entries
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h11.25A2.25 2.25 0 0019.5 14.25V3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
        </svg>
        <p className="text-center text-sm">No entries yet</p>
        <p className="text-center text-xs mt-1">Add your first transaction using the buttons below</p>
      </div>
    )
  }

  // Calculate running balance for each entry
  // Since entries are sorted newest first, we need to reverse for calculation, then map back
  const entriesOldestFirst = [...entries].reverse()
  const entriesWithBalance = entries.map((entry) => {
    // Find the index in the oldest-first array
    const oldestFirstIndex = entriesOldestFirst.findIndex((e) => e.id === entry.id)
    const entriesUpToThis = entriesOldestFirst.slice(0, oldestFirstIndex + 1)
    const balance = entriesUpToThis.reduce((acc, e) => {
      return e.type === "GOT" ? acc + e.amount : acc - e.amount
    }, 0)
    return { ...entry, balance }
  })

  return (
    <div className="space-y-3">
      {entriesWithBalance.map((entry) => (
        <div key={entry.id} className="flex flex-col rounded-xl bg-[#18181a] px-4 py-3 cursor-pointer hover:bg-[#232225]" onClick={() => onSelect(entry)}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm">
              {entry.date} • {entry.time}
            </span>
            <span className={entry.type === "GOT" ? "text-green-400 text-base font-semibold" : "text-red-500 text-base font-semibold"}>₹ {entry.amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs rounded px-2 py-0.5 ${entry.balance > 0 ? "bg-green-900/30 text-green-400" : entry.balance < 0 ? "bg-red-900/30 text-red-400" : "bg-[#2c2b2e] text-gray-300"}`}>
              Bal. ₹ {Math.abs(entry.balance)} {entry.balance > 0 ? "↑" : entry.balance < 0 ? "↓" : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
