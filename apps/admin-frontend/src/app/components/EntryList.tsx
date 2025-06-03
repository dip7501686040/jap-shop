import React from "react"

export default function EntryList({ entries, onSelect }: { entries: { id: number; type: "gave" | "got"; amount: number; date: string; time: string }[]; onSelect: (entry: any) => void }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex flex-col rounded-xl bg-[#18181a] px-4 py-3 cursor-pointer hover:bg-[#232225]" onClick={() => onSelect(entry)}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm">
              {entry.date} • {entry.time}
            </span>
            <span className={entry.type === "got" ? "text-green-400 text-base font-semibold" : "text-red-500 text-base font-semibold"}>₹ {entry.amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs bg-[#2c2b2e] text-gray-300 rounded px-2 py-0.5">Bal. ₹ 0</span>
          </div>
        </div>
      ))}
    </div>
  )
}
