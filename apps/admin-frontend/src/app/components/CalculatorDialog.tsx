import { ArrowLeft } from "lucide-react"
import React, { useState } from "react"

export default function CalculatorDialog({
  open,
  onClose,
  type, // "GAVE" | "GOT"
  customerName,
  initialAmount = "",
  containerMode = false, // if true, use absolute (desktop right section), else fixed (mobile)
  onSave,
  entryId // for editing existing entries
}: {
  open: boolean
  onClose: () => void
  type: "GAVE" | "GOT"
  customerName: string
  initialAmount?: string
  containerMode?: boolean
  onSave?: (amount: number, type: "GAVE" | "GOT", entryId?: string) => Promise<void>
  entryId?: string
}) {
  const [amount, setAmount] = useState(initialAmount)
  const [loading, setLoading] = useState(false)
  const headerText = type === "GAVE" ? `You Gave ${customerName} \u20B9 ${amount || 0}` : `${customerName} Gave You \u20B9 ${amount || 0}`
  const borderColor = type === "GAVE" ? "border-red-500" : "border-green-500"
  const saveBgBtn = type === "GAVE" ? "bg-red-700" : "bg-green-700"
  const saveBgBtnHover = type === "GAVE" ? "hover:bg-red-800" : "hover:bg-green-800"
  const headerTextColor = type === "GAVE" ? "text-red-500" : "text-green-500"
  const iconColor = type === "GAVE" ? "text-red-500" : "text-green-500"

  function handleKey(key: string) {
    if (key === "C") setAmount("")
    else if (key === "\u232B") setAmount((a) => a.slice(0, -1))
    else if (key === "=") {
      /* Optionally evaluate */
    } else if (["M+", "M-", "%", "\u00F7", "\u00D7", "+", "-"].includes(key)) {
      /* Optionally handle */
    } else setAmount((a) => a + key)
  }

  const handleSave = async () => {
    if (!amount || !onSave) return

    try {
      setLoading(true)
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount")
        return
      }

      await onSave(numericAmount, type, entryId)
      onClose()
    } catch (error) {
      console.error("Error saving entry:", error)
      alert("Failed to save entry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className={`${containerMode ? "absolute" : "fixed"} inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 transition-all`}>
      <div className="w-full max-w-md mx-auto bg-[#18181a] rounded-t-2xl md:rounded-2xl shadow-lg overflow-hidden animate-slideup relative flex flex-col h-[100dvh] md:h-[80dvh]">
        {/* Header */}
        <div className="flex items-center px-4 pt-6 pb-4 bg-black sticky top-0 z-10">
          <button className={`mr-2 ${iconColor}`} onClick={onClose}>
            <ArrowLeft size={28} />
          </button>
          <span className={`flex-1 text-center font-bold text-xl ${headerTextColor}`}>{headerText}</span>
        </div>
        {/* Input */}
        <div className="px-4 pb-6">
          <div className={`flex items-center border-2 rounded-lg px-4 py-3 text-2xl font-semibold ${borderColor}`} style={{ background: "#18181a" }}>
            <span className={`${headerTextColor} mr-2 text-2xl`}>₹</span>
            <input
              className="bg-transparent outline-none flex-1 text-gray-200 placeholder-gray-500 text-2xl font-semibold"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              autoFocus
              style={{ minWidth: 0 }}
            />
          </div>
        </div>
        {/* Save Button and Keypad at the bottom */}
        <div className="flex flex-col justify-end flex-1 w-full">
          <div className="w-full px-4 pb-4">
            <button className={`w-full py-3 rounded-xl font-bold text-lg ${saveBgBtn} ${saveBgBtnHover} transition`} style={{ opacity: amount && !loading ? 1 : 0.5 }} disabled={!amount || loading} onClick={handleSave}>
              {loading ? (entryId ? "Updating..." : "Saving...") : "Save"}
            </button>
          </div>
          {/* Calculator Keypad */}
          <div className="w-full px-2 pb-4">
            <div className="grid grid-cols-4 gap-2">
              {["C", "M+", "M-", "\u232B", "7", "8", "9", "%", "4", "5", "6", "\u00D7", "1", "2", "3", "-", "0", ".", "=", "+"].map((key, i) => (
                <button
                  key={i}
                  className={`py-4 rounded-lg text-lg font-semibold ${["+", "-", "=", "C"].includes(key) ? "bg-blue-700 text-white" : key === "\u232B" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => handleKey(key)}
                >
                  {key === "\u232B" ? (
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : key === "\u00D7" ? (
                    "×"
                  ) : key === "\u00F7" ? (
                    "÷"
                  ) : (
                    key
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
