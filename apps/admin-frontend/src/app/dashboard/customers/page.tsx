"use client"
import React, { useState } from "react"
import CustomerListSection from "../../components/CustomerListSection"
import CustomerDetailsSection from "../../components/CustomerDetailsSection"

// Customers
function Customers() {
  // Example values, replace with real data as needed
  const debits = 12000
  const credits = 8500
  // Example customer list
  const customers = [
    { id: 1, name: "John Doe", status: "Active", debits: 5000, credits: 2000, amount: 3000 },
    { id: 2, name: "Jane Smith", status: "VIP", debits: 7000, credits: 6500, amount: 500 },
    { id: 3, name: "Alice Brown", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 4, name: "Bob Johnson", status: "Active", debits: 3000, credits: 1500, amount: 1500 },
    { id: 5, name: "Charlie White", status: "VIP", debits: 6000, credits: 4000, amount: 2000 },
    { id: 6, name: "Diana Prince", status: "Active", debits: 8000, credits: 5000, amount: 3000 },
    { id: 7, name: "Ethan Hunt", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 8, name: "Fiona Gallagher", status: "VIP", debits: 9000, credits: 7000, amount: 2000 },
    { id: 9, name: "George Costanza", status: "Active", debits: 4000, credits: 3000, amount: 1000 },
    { id: 10, name: "Hannah Montana", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 11, name: "Ian Malcolm", status: "VIP", debits: 10000, credits: 8000, amount: 2000 },
    { id: 12, name: "Jack Sparrow", status: "Active", debits: 2000, credits: 1000, amount: 1000 },
    { id: 13, name: "Katherine Pierce", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 14, name: "Liam Neeson", status: "VIP", debits: 11000, credits: 9000, amount: 2000 },
    { id: 15, name: "Mia Wallace", status: "Active", debits: 6000, credits: 4000, amount: 2000 },
    { id: 16, name: "Nina Simone", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 17, name: "Oscar Isaac", status: "VIP", debits: 12000, credits: 10000, amount: 2000 },
    { id: 18, name: "Paul Atreides", status: "Active", debits: 3000, credits: 2000, amount: 1000 },
    { id: 19, name: "Quinn Fabray", status: "Inactive", debits: 0, credits: 0, amount: 0 },
    { id: 20, name: "Rachel Green", status: "VIP", debits: 8000, credits: 6000, amount: 2000 }
  ]
  const [selectedCustomer, setSelectedCustomer] = useState<null | (typeof customers)[0]>(null)
  const [showCalculator, setShowCalculator] = useState<null | "gave" | "got">(null)
  const [calcValue, setCalcValue] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<null | { id: number; type: "gave" | "got"; amount: number; date: string; time: string }>(null)

  // Example entries for demo (replace with real data)
  const entries: { id: number; type: "gave" | "got"; amount: number; date: string; time: string }[] = [
    { id: 1, type: "got", amount: 100, date: "28 May", time: "11:02 PM" },
    { id: 2, type: "gave", amount: 100, date: "28 May", time: "11:02 PM" }
  ]

  // Responsive check
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-full overflow-hidden">
      <CustomerListSection debits={debits} credits={credits} customers={customers} selectedCustomer={selectedCustomer} onSelectCustomer={setSelectedCustomer} />
      <CustomerDetailsSection
        selectedCustomer={selectedCustomer}
        entries={entries}
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        showCalculator={showCalculator}
        setShowCalculator={setShowCalculator}
        calcValue={calcValue}
        setCalcValue={setCalcValue}
        onBack={() => setSelectedCustomer(null)}
        isMobile={isMobile}
      />
    </div>
  )
}

export default Customers
