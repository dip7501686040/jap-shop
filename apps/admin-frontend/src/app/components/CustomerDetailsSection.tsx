import React from "react"
import EntryDetailsModal from "./EntryDetailsModal"
import EntryList from "./EntryList"
import CalculatorDialog from "./CalculatorDialog"
import { ArrowLeft, File, IndianRupee, MessageCircle, PhoneCall, Edit3 } from "lucide-react"
import { Customer } from "./CustomerListSection"

interface Entry {
  id: string
  type: "GAVE" | "GOT"
  amount: number
  date: string
  time: string
}

interface CustomerDetailsSectionProps {
  selectedCustomer: Customer | null
  entries: Entry[]
  selectedEntry: Entry | null
  setSelectedEntry: (entry: Entry | null) => void
  showCalculator: "GAVE" | "GOT" | null
  setShowCalculator: (type: "GAVE" | "GOT" | null) => void
  calcValue: string
  setCalcValue: (value: string) => void
  onBack: () => void
  isMobile: boolean
  onEditCustomer?: (customer: Customer) => void
  onDeleteCustomer?: (id: string) => Promise<void>
  onSaveEntry?: (amount: number, type: "GAVE" | "GOT", entryId?: string) => Promise<void>
  onDeleteEntry?: (entryId: string) => Promise<void>
}

const CustomerDetailsSection: React.FC<CustomerDetailsSectionProps> = ({
  selectedCustomer,
  entries,
  selectedEntry,
  setSelectedEntry,
  showCalculator,
  setShowCalculator,
  calcValue,
  setCalcValue,
  onBack,
  isMobile,
  onEditCustomer,
  onDeleteCustomer: _onDeleteCustomer, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSaveEntry,
  onDeleteEntry
}) => {
  // Track if we're editing an existing entry
  const [editingEntryId, setEditingEntryId] = React.useState<string | undefined>()

  const handleCalculatorClose = () => {
    setShowCalculator(null)
    setEditingEntryId(undefined)
  }

  // Calculate running balance for selected entry
  const getRunningBalanceForEntry = (targetEntry: Entry) => {
    // Since entries are sorted newest first, we need to work with oldest first for calculation
    const entriesOldestFirst = [...entries].reverse()
    const entryIndex = entriesOldestFirst.findIndex((e) => e.id === targetEntry.id)
    if (entryIndex === -1) return 0

    const entriesUpToThis = entriesOldestFirst.slice(0, entryIndex + 1)
    return entriesUpToThis.reduce((acc, e) => {
      return e.type === "GOT" ? acc + e.amount : acc - e.amount
    }, 0)
  }
  if (!selectedCustomer) {
    return (
      <div className="hidden md:flex items-center w-full md:w-1/2 justify-center h-full text-gray-400" style={{ boxShadow: "-10px 0 15px -3px rgba(0, 0, 0, 0.1)" }}>
        <span className="text-xl">Select a customer to view details</span>
      </div>
    )
  }

  // Desktop: show as right section, Mobile: show as sliding panel
  const DetailsContent = (
    <div className="absolute inset-0 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black sticky top-0 z-10">
        {/* Left: Back button (mobile only) */}
        {isMobile ? (
          <button className="mr-2 text-white" onClick={onBack}>
            <ArrowLeft size={28} />
          </button>
        ) : (
          <div className="mr-2 w-7" />
        )}
        {/* Center: Avatar, Name, Settings */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mr-3">{selectedCustomer.name.charAt(0)}</div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-semibold truncate text-lg leading-5">{selectedCustomer.name}</span>
              <span className="text-gray-200 text-xs leading-4 truncate cursor-pointer">Click here to view settings</span>
            </div>
          </div>
        </div>
        {/* Right: Call and Edit icons */}
        <div className="flex items-center space-x-4 ml-2">
          <PhoneCall className="text-white" />
          <button onClick={() => onEditCustomer?.(selectedCustomer)} className="text-white hover:text-gray-300">
            <Edit3 size={20} />
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="px-4 pt-4 pb-2">
        {(() => {
          const totalBalance = entries.reduce((acc, entry) => {
            return entry.type === "GOT" ? acc + entry.amount : acc - entry.amount
          }, 0)

          if (totalBalance === 0) {
            return (
              <div className="bg-[#232225] rounded-2xl flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-xl">Settled Up</span>
                  <span className="text-green-400 text-xl">😊</span>
                </div>
                <span className="text-white text-xl font-semibold">₹ 0</span>
              </div>
            )
          } else if (totalBalance > 0) {
            return (
              <div className="bg-[#1e3a2e] rounded-2xl flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-xl">You have got</span>
                  <span className="text-green-400 text-xl">💰</span>
                </div>
                <span className="text-green-400 text-xl font-semibold">₹ {totalBalance}</span>
              </div>
            )
          } else {
            return (
              <div className="bg-[#3a1e1e] rounded-2xl flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-xl">You have given</span>
                  <span className="text-red-400 text-xl">💸</span>
                </div>
                <span className="text-red-400 text-xl font-semibold">₹ {Math.abs(totalBalance)}</span>
              </div>
            )
          }
        })()}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-black">
        <div className="flex flex-col items-center flex-1">
          <div className="bg-transparent rounded-lg p-2 mb-1 flex items-center justify-center">
            <File className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-xs">Report</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="bg-transparent rounded-lg p-2 mb-1 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-xs">Payments</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="bg-transparent rounded-lg p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="#25D366">
              <path d="M16.005 2.003c-7.74 0-14 6.26-14 14 0 2.473.64 4.885 1.85 7.016l-1.94 7.05 7.23-1.89A13.92 13.92 0 0 0 16.005 30c7.74 0 14-6.26 14-14s-6.26-13.997-14-13.997zm0 25.49a11.4 11.4 0 0 1-5.808-1.57l-.417-.248-4.292 1.12 1.144-4.192-.27-.43a11.42 11.42 0 0 1-1.763-6.09c0-6.295 5.12-11.415 11.415-11.415s11.415 5.12 11.415 11.415c0 6.295-5.12 11.415-11.415 11.415zm6.253-8.57c-.342-.17-2.024-.997-2.338-1.11-.313-.113-.542-.17-.77.17s-.882 1.11-1.082 1.338c-.2.228-.4.256-.742.085-.342-.17-1.444-.532-2.75-1.7-1.017-.907-1.703-2.03-1.902-2.372-.2-.342-.02-.527.15-.698.154-.153.342-.398.513-.598.17-.2.228-.342.342-.57.113-.228.057-.427-.028-.598-.086-.17-.77-1.857-1.055-2.548-.278-.668-.56-.577-.77-.587l-.656-.012c-.228 0-.598.085-.913.427s-1.2 1.172-1.2 2.86 1.228 3.313 1.4 3.542c.17.227 2.415 3.69 5.854 5.177.818.353 1.455.563 1.953.72.82.26 1.565.223 2.155.135.658-.098 2.024-.827 2.31-1.626.285-.8.285-1.487.2-1.627-.085-.14-.313-.227-.656-.398z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">Reminders</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="bg-transparent rounded-lg p-2 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-xs mt-1">SMS</span>
        </div>
      </div>

      {/* Entries Table */}
      <div className="px-2 pt-4 pb-24 bg-black min-h-[300px]">
        <div className="flex px-2 pb-2 text-xs text-gray-400">
          <span className="flex-1">ENTRIES</span>
          <span className="flex-1 text-center">YOU GAVE</span>
          <span className="flex-1 text-right">YOU GOT</span>
        </div>
        <div className="space-y-3">
          <EntryList entries={entries} onSelect={setSelectedEntry} />
        </div>
      </div>

      {/* Bottom Buttons: YOU GAVE / YOU GOT */}
      <div className={`${isMobile ? "fixed" : "absolute"} bottom-0 left-0 w-full flex gap-2 px-4 pb-4 pt-2 bg-black z-40`}>
        <button
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-md"
          onClick={() => {
            setShowCalculator("GAVE")
            setCalcValue("")
            setEditingEntryId(undefined)
          }}
        >
          YOU GAVE ₹
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-md"
          onClick={() => {
            setShowCalculator("GOT")
            setCalcValue("")
            setEditingEntryId(undefined)
          }}
        >
          YOU GOT ₹
        </button>
      </div>

      {/* Entry Details Modal */}
      {selectedEntry &&
        (isMobile ? (
          <EntryDetailsModal
            open={!!selectedEntry}
            onClose={() => setSelectedEntry(null)}
            entry={selectedEntry!}
            customerName={selectedCustomer.name}
            onEdit={() => {
              setShowCalculator(selectedEntry!.type)
              setCalcValue(selectedEntry!.amount.toString())
              setEditingEntryId(selectedEntry!.id)
              setSelectedEntry(null)
            }}
            onDelete={onDeleteEntry}
            runningBalance={getRunningBalanceForEntry(selectedEntry!)}
            // mobile: full screen, so containerMode not set
          />
        ) : (
          <div className="absolute inset-0 z-50 flex flex-col bg-black bg-opacity-60">
            <div className="w-full max-w-md mx-auto h-full flex items-center justify-center">
              <div className="w-full">
                <EntryDetailsModal
                  open={!!selectedEntry}
                  onClose={() => setSelectedEntry(null)}
                  entry={selectedEntry!}
                  customerName={selectedCustomer.name}
                  onEdit={() => {
                    setShowCalculator(selectedEntry!.type)
                    setCalcValue(selectedEntry!.amount.toString())
                    setEditingEntryId(selectedEntry!.id)
                    setSelectedEntry(null)
                  }}
                  onDelete={onDeleteEntry}
                  runningBalance={getRunningBalanceForEntry(selectedEntry!)}
                  containerMode={true}
                />
              </div>
            </div>
          </div>
        ))}

      {/* Calculator Dialog */}
      {showCalculator &&
        (isMobile ? (
          <CalculatorDialog
            open={!!showCalculator}
            onClose={handleCalculatorClose}
            type={showCalculator as "GAVE" | "GOT"}
            customerName={selectedCustomer.name}
            initialAmount={calcValue}
            onSave={onSaveEntry}
            entryId={editingEntryId}
            // mobile: full screen, so containerMode not set
          />
        ) : (
          <div className="absolute inset-0 z-50 flex flex-col bg-black bg-opacity-60">
            <div className="w-full max-w-md mx-auto h-full flex items-center justify-center">
              <div className="w-full">
                <CalculatorDialog
                  open={!!showCalculator}
                  onClose={handleCalculatorClose}
                  type={showCalculator as "GAVE" | "GOT"}
                  customerName={selectedCustomer.name}
                  initialAmount={calcValue}
                  onSave={onSaveEntry}
                  entryId={editingEntryId}
                  containerMode={true}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  )

  if (isMobile) {
    return (
      selectedCustomer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`bg-black w-full h-full overflow-y-auto fixed top-0 right-0 z-50 transition-transform transform duration-[900ms] translate-x-0`}
              style={{
                boxShadow: "0 0 24px 0 rgba(0,0,0,0.12)",
                transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              {DetailsContent}
            </div>
          </div>
        </div>
      )
    )
  }

  // Desktop
  return <div className="hidden md:block w-full md:w-1/2 p-0 bg-black h-full relative overflow-hidden">{DetailsContent}</div>
}

export default CustomerDetailsSection
