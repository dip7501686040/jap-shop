"use client"
import React, { useState } from "react"

function Customers() {
  // Example values, replace with real data as needed
  const debits = 12000
  const credits = 8500
  // Example customer list
  const customers = [
    { id: 1, name: "John Doe", status: "Active", debits: 5000, credits: 2000 },
    { id: 2, name: "Jane Smith", status: "VIP", debits: 7000, credits: 6500 },
    { id: 3, name: "Alice Brown", status: "Inactive", debits: 0, credits: 0 },
    { id: 4, name: "Bob Johnson", status: "Active", debits: 3000, credits: 1500 },
    { id: 5, name: "Charlie White", status: "VIP", debits: 6000, credits: 4000 },
    { id: 6, name: "Diana Prince", status: "Active", debits: 8000, credits: 5000 },
    { id: 7, name: "Ethan Hunt", status: "Inactive", debits: 0, credits: 0 },
    { id: 8, name: "Fiona Gallagher", status: "VIP", debits: 9000, credits: 7000 },
    { id: 9, name: "George Costanza", status: "Active", debits: 4000, credits: 3000 },
    { id: 10, name: "Hannah Montana", status: "Inactive", debits: 0, credits: 0 },
    { id: 11, name: "Ian Malcolm", status: "VIP", debits: 10000, credits: 8000 },
    { id: 12, name: "Jack Sparrow", status: "Active", debits: 2000, credits: 1000 },
    { id: 13, name: "Katherine Pierce", status: "Inactive", debits: 0, credits: 0 },
    { id: 14, name: "Liam Neeson", status: "VIP", debits: 11000, credits: 9000 },
    { id: 15, name: "Mia Wallace", status: "Active", debits: 6000, credits: 4000 },
    { id: 16, name: "Nina Simone", status: "Inactive", debits: 0, credits: 0 },
    { id: 17, name: "Oscar Isaac", status: "VIP", debits: 12000, credits: 10000 },
    { id: 18, name: "Paul Atreides", status: "Active", debits: 3000, credits: 2000 },
    { id: 19, name: "Quinn Fabray", status: "Inactive", debits: 0, credits: 0 },
    { id: 20, name: "Rachel Green", status: "VIP", debits: 8000, credits: 6000 }
  ]
  const [selectedCustomer, setSelectedCustomer] = useState<null | (typeof customers)[0]>(null)

  // Mobile: show only list, open details in dialog
  // Desktop: show both sections
  return (
    <div className="flex flex-col md:flex-row min-h-screen h-full overflow-hidden bg-gray-100">
      {/* Left Section (Customer List) */}
      <div className="w-full md:w-1/2 p-0 bg-gray-100 shadow-lg shadow-gray-400 flex flex-col">
        {/* Header with border and summary (hidden on mobile if dialog open) */}
        <div className={`sticky z-10 flex items-center justify-between border-b border-gray-300 px-4 md:px-6 py-4 bg-white gap-2 ${selectedCustomer ? "hidden" : ""} md:flex`} style={{ top: "0px" }}>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Your Debits</span>
            <span className="text-lg font-bold text-red-600">Rs.{debits}</span>
            {/* Up arrow for debits */}
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l7 7m-7-7l-7 7" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Your Credits</span>
            <span className="text-lg font-bold text-green-600">Rs.{credits}</span>
            {/* Down arrow for credits */}
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-7-7m7 7l7-7" />
            </svg>
          </div>
        </div>
        {/* Search/filter/sort row (hidden on mobile if dialog open) */}
        <div
          className={`sticky z-10 px-4 md:px-6 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 bg-gray-50 border-b border-gray-200 ${selectedCustomer ? "hidden" : ""} md:flex`}
          style={{ top: "60px" }}
        >
          <input type="text" placeholder="Search customers..." className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Filter by</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="recent">Most Recent</option>
            <option value="debits">Debits</option>
            <option value="credits">Credits</option>
          </select>
        </div>
        {/* Customer List */}
        <div className="flex-1 min-h-0 p-4 md:p-6 h-full overflow-hidden">
          <h2 className="text-2xl font-semibold mb-4">Customer List</h2>
          <div className="h-full max-h-[calc(100vh-260px)] md:max-h-none overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <li key={customer.id} className="py-3 px-2 cursor-pointer hover:bg-gray-200 rounded transition md:rounded-none" onClick={() => setSelectedCustomer(customer)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-300 text-gray-700">{customer.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Right Section (Customer Details) - always visible on desktop, dialog on mobile */}
      {/* Desktop: show details on right. Mobile: show dialog if selectedCustomer */}
      <div className="hidden md:block w-full md:w-1/2 p-4 md:p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-4">Customer Orders</h2>
        <p>Put order history, recent activity, etc.</p>
      </div>
      {/* Mobile sliding dialog for details */}
      {selectedCustomer !== null && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Right side sliding panel below header */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`bg-white w-full h-full pt-[64px] overflow-y-auto fixed top-0 right-0 z-50 transition-transform transform ${selectedCustomer ? "duration-[900ms]" : "duration-[400ms]"} ${selectedCustomer ? "translate-x-0" : "translate-x-full"}`}
              style={{
                boxShadow: "0 0 24px 0 rgba(0,0,0,0.12)",
                transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <button className="absolute top-4 left-4 text-gray-700 bg-gray-200 rounded-full p-2 z-10" onClick={() => setSelectedCustomer(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="p-6 pt-10">
                <h2 className="text-xl font-semibold mb-2">{selectedCustomer.name}</h2>
                <div className="mb-2 text-sm text-gray-600">Status: {selectedCustomer.status}</div>
                <div className="mb-2 text-sm text-gray-600">Debits: Rs.{selectedCustomer.debits}</div>
                <div className="mb-2 text-sm text-gray-600">Credits: Rs.{selectedCustomer.credits}</div>
                <div className="mt-4 text-gray-500 text-xs">More details here...</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
