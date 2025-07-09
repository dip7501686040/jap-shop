import React, { useState } from "react"
import CustomerList from "./CustomerList"
import AddCustomerDrawer from "./AddCustomerDrawer"
import AddCustomerButton from "./AddCustomerButton"
import CustomerListHeader from "./CustomerListHeader"
import CustomerListFilterBar from "./CustomerListFilterBar"
import { CreateCustomerRequest, UpdateCustomerRequest, Customer as ApiCustomer, Entry } from "../../lib/api-services"

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  status: string
  debits: number
  credits: number
  amount: number
  entries?: Entry[]
  createdAt?: string
  updatedAt?: string
}

interface CustomerListSectionProps {
  debits: number
  credits: number
  customers: Customer[]
  selectedCustomer: Customer | null
  currentLogbook: { id: string; name: string; description?: string }
  onSelectCustomer: (customer: Customer) => void
  onCreateCustomer?: (customerData: CreateCustomerRequest, openingBalance?: { amount: number; type: "GAVE" | "GOT" }) => Promise<ApiCustomer>
  onUpdateCustomer?: (id: string, customerData: UpdateCustomerRequest) => Promise<ApiCustomer>
  onDeleteCustomer?: (id: string) => Promise<void>
}

const CustomerListSection: React.FC<CustomerListSectionProps> = ({
  debits,
  credits,
  customers,
  selectedCustomer,
  currentLogbook,
  onSelectCustomer,
  onCreateCustomer,
  onUpdateCustomer: _onUpdateCustomer, // eslint-disable-line @typescript-eslint/no-unused-vars
  onDeleteCustomer: _onDeleteCustomer // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [showAddDrawer, setShowAddDrawer] = useState(false)

  return (
    <div className="w-full md:w-1/2 p-0 flex flex-col">
      {/* Logbook Header */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Customers - {currentLogbook.name}</h1>
        {currentLogbook.description && <p className="text-sm text-gray-600 mt-1">{currentLogbook.description}</p>}
      </div>
      <CustomerListHeader debits={debits} credits={credits} selectedCustomer={selectedCustomer} />
      <CustomerListFilterBar selectedCustomer={selectedCustomer} />
      <div className="flex-1 min-h-0 p-4 md:p-6 h-full overflow-hidden">
        <h2 className="text-2xl font-semibold mb-4">Customer List</h2>
        <div className="h-full max-h-[calc(100vh-260px)] md:max-h-none overflow-y-auto">
          <CustomerList customers={customers} onSelect={onSelectCustomer} />
        </div>
      </div>
      <AddCustomerButton onClick={() => setShowAddDrawer(true)} />
      <AddCustomerDrawer show={showAddDrawer} onClose={() => setShowAddDrawer(false)} onCreateCustomer={onCreateCustomer} />
    </div>
  )
}

export default CustomerListSection
