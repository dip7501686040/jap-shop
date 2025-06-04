import React from "react"
import { Customer } from "./CustomerListSection"

interface CustomerListHeaderProps {
  debits: number
  credits: number
  selectedCustomer: Customer | null
}

const CustomerListHeader: React.FC<CustomerListHeaderProps> = ({ debits, credits, selectedCustomer }) => (
  <div className={`sticky z-10 flex items-center justify-center px-4 md:px-6 pt-3 gap-2 ml-6 ${selectedCustomer ? "hidden" : ""} md:flex`} style={{ top: "0px" }}>
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 font-small">Debits</span>
      <span className="text-md font-bold text-red-600">Rs.{debits}</span>
      {/* Up arrow for debits */}
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l7 7m-7-7l-7 7" />
      </svg>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 font-small">Credits</span>
      <span className="text-md font-bold text-green-600">Rs.{credits}</span>
      {/* Down arrow for credits */}
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-7-7m7 7l7-7" />
      </svg>
    </div>
  </div>
)

export default CustomerListHeader
