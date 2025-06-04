import React, { useState } from "react"
import CustomerList from "./CustomerList"
import AddCustomerDrawer from "./AddCustomerDrawer"
import AddCustomerButton from "./AddCustomerButton"
import CustomerListHeader from "./CustomerListHeader"
import CustomerListFilterBar from "./CustomerListFilterBar"

export interface Customer {
  id: number
  name: string
  status: string
  debits: number
  credits: number
  amount: number
}

interface CustomerListSectionProps {
  debits: number
  credits: number
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void
}

const CustomerListSection: React.FC<CustomerListSectionProps> = ({ debits, credits, customers, selectedCustomer, onSelectCustomer }) => {
  const [showAddDrawer, setShowAddDrawer] = useState(false)

  return (
    <div className="w-full md:w-1/2 p-0 flex flex-col">
      <CustomerListHeader debits={debits} credits={credits} selectedCustomer={selectedCustomer} />
      <CustomerListFilterBar selectedCustomer={selectedCustomer} />
      <div className="flex-1 min-h-0 p-4 md:p-6 h-full overflow-hidden">
        <h2 className="text-2xl font-semibold mb-4">Customer List</h2>
        <div className="h-full max-h-[calc(100vh-260px)] md:max-h-none overflow-y-auto">
          <CustomerList customers={customers} onSelect={onSelectCustomer} />
        </div>
      </div>
      <AddCustomerButton onClick={() => setShowAddDrawer(true)} />
      <AddCustomerDrawer show={showAddDrawer} onClose={() => setShowAddDrawer(false)} />
    </div>
  )
}

export default CustomerListSection
