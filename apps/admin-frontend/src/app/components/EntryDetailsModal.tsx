import { ArrowLeft } from "lucide-react"
import React, { useState } from "react"

export default function EntryDetailsModal({
  open,
  onClose,
  entry,
  customerName,
  onEdit,
  onDelete,
  containerMode = false, // if true, use absolute (desktop right section), else fixed (mobile)
  runningBalance = 0
}: {
  open: boolean
  onClose: () => void
  entry: { id: string; type: "GAVE" | "GOT"; amount: number; date: string; time: string }
  customerName: string
  onEdit: () => void
  onDelete?: (entryId: string) => Promise<void>
  containerMode?: boolean
  runningBalance?: number
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = window.confirm("Are you sure you want to delete this entry?")
    if (!confirmed) return

    try {
      setLoading(true)
      await onDelete(entry.id)
      onClose()
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete entry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className={`${containerMode ? "absolute" : "fixed"} inset-0 z-[110] flex flex-col bg-black/95`}>
      {/* Header */}
      <div className="flex items-center px-4 py-5 bg-black">
        <button className="mr-2 text-white" onClick={onClose}>
          <ArrowLeft size={28} />
        </button>
        <span className="flex-1 text-center font-bold text-xl text-white">Entry Details</span>
      </div>
      {/* Card */}
      <div className="px-4 pt-4">
        <div className="bg-[#232225] rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">{customerName.charAt(0)}</div>
              <div>
                <div className="text-white font-semibold text-lg leading-5">{customerName}</div>
                <div className="text-gray-300 text-xs">
                  On {entry.date} • {entry.time}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={entry.type === "GOT" ? "text-green-400 text-lg font-bold" : "text-red-500 text-lg font-bold"}>₹ {entry.amount}</span>
              <span className="text-gray-300 text-xs">{entry.type === "GOT" ? "You got" : "You gave"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-sm">Running Balance</span>
            <span className={`text-sm font-semibold ${runningBalance > 0 ? "text-green-400" : runningBalance < 0 ? "text-red-400" : "text-white"}`}>
              ₹ {Math.abs(runningBalance)} {runningBalance > 0 ? "(You will get)" : runningBalance < 0 ? "(You will give)" : ""}
            </span>
          </div>
          <button className="mt-4 flex items-center gap-2 justify-center py-2 rounded-lg border border-gray-500 text-white text-base font-semibold hover:bg-[#18181a]" onClick={onEdit}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z" />
            </svg>
            Edit Entry
          </button>
        </div>
      </div>
      {/* SMS Card */}
      <div className="px-4 pt-4">
        <div className="bg-[#232225] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 3h-1a2 2 0 0 0-2 2v2" />
            </svg>
            <span className="text-gray-300 font-semibold">Sms Disabled</span>
          </div>
          <div className="text-gray-300 text-sm mt-2">
            You {entry.type === "GAVE" ? "GAVE" : "GOT"} ₹ {entry.amount} to My Business(700173750). You will receive ₹ 0 in total
            <br />
            <span className="block mt-2">
              See txn history: <span className="underline">https://khata.pe/t/RIF5k2CWE</span>
            </span>
          </div>
        </div>
      </div>
      {/* Backed Up Card */}
      <div className="px-4 pt-4">
        <div className="bg-[#232225] rounded-2xl p-4 flex items-center gap-2">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z" />
          </svg>
          <span className="text-gray-300 font-semibold">Backed Up</span>
        </div>
      </div>
      {/* Safe and Secure */}
      <div className="flex flex-col items-center justify-center pt-6">
        <span className="text-green-500 font-semibold flex items-center gap-2">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2l4-4" />
          </svg>
          100% Safe and Secure
        </span>
      </div>
      {/* Bottom Buttons */}
      <div className={`${containerMode ? "absolute" : "fixed"} bottom-0 left-0 w-full flex gap-2 px-4 pb-4 pt-2 bg-black z-[120]`}>
        <button className="flex-1 border border-white text-white py-3 rounded-xl font-bold text-lg bg-transparent hover:bg-gray-800 disabled:opacity-50" onClick={handleDelete} disabled={loading || !onDelete}>
          <svg className="inline-block mr-2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </svg>
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-bold text-lg" onClick={onClose}>
          <svg className="inline-block mr-2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}
