"use client"
import React, { useState, useEffect } from "react"
import CustomerListSection from "../../components/CustomerListSection"
import CustomerDetailsSection from "../../components/CustomerDetailsSection"
import EditCustomerDrawer from "../../components/EditCustomerDrawer"
import { CustomerService, Customer, CreateCustomerRequest, UpdateCustomerRequest, EntryService, CreateEntryRequest } from "../../../lib/api-services"
import { Customer as ComponentCustomer } from "../../components/CustomerListSection"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"

// Component Entry interface
interface ComponentEntry {
  id: string
  type: "GAVE" | "GOT"
  amount: number
  date: string
  time: string
}

// Customers
function CustomersContent() {
  // State management
  const [customers, setCustomers] = useState<ComponentCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<ComponentCustomer | null>(null)
  const [showCalculator, setShowCalculator] = useState<null | "GAVE" | "GOT">(null)
  const [calcValue, setCalcValue] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<ComponentEntry | null>(null)
  const [showEditCustomer, setShowEditCustomer] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<ComponentCustomer | null>(null)

  // State for total debits and credits (from API summary)
  const [totalDebits, setTotalDebits] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  // Convert entries for selected customer to display format
  const entries: ComponentEntry[] =
    selectedCustomer?.entries
      ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by newest first
      ?.map((entry) => ({
        id: entry.id,
        type: entry.type,
        amount: entry.amount,
        date: new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        time: new Date(entry.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
      })) || []

  // Convert Customer to component format for compatibility
  const formatCustomersForComponent = (apiCustomers: Customer[]): ComponentCustomer[] => {
    return apiCustomers.map((customer) => {
      const gaveAmount = customer.entries?.reduce((sum, entry) => (entry.type === "GAVE" ? sum + entry.amount : sum), 0) || 0
      const gotAmount = customer.entries?.reduce((sum, entry) => (entry.type === "GOT" ? sum + entry.amount : sum), 0) || 0
      const netAmount = gaveAmount - gotAmount

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: netAmount > 0 ? "Active" : netAmount < 0 ? "VIP" : "Inactive",
        debits: gaveAmount,
        credits: gotAmount,
        amount: Math.abs(netAmount),
        entries: customer.entries,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }
    })
  }

  // API functions
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await CustomerService.getCustomers()
      if (response.success) {
        const formattedCustomers = formatCustomersForComponent(response.data)
        setCustomers(formattedCustomers)
        return formattedCustomers
      } else {
        setError(response.message || "Failed to fetch customers")
        return []
      }
    } catch (err) {
      setError("Error fetching customers")
      console.error("Error fetching customers:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customerData: CreateCustomerRequest, openingBalance?: { amount: number; type: "GAVE" | "GOT" }) => {
    try {
      const response = await CustomerService.createCustomer(customerData)
      if (response.success) {
        // If there's an opening balance, create an entry for it
        if (openingBalance && openingBalance.amount > 0) {
          const entryData: CreateEntryRequest = {
            type: openingBalance.type,
            amount: openingBalance.amount,
            customerId: response.data.id
          }
          await EntryService.createEntry(entryData)
        }
        await fetchSummary() // Refresh summary after creating customer
        await fetchCustomers() // Refresh the list
        return response.data
      } else {
        throw new Error(response.message || "Failed to create customer")
      }
    } catch (err) {
      console.error("Error creating customer:", err)
      throw err
    }
  }

  const updateCustomer = async (id: string, customerData: UpdateCustomerRequest) => {
    try {
      const response = await CustomerService.updateCustomer(id, customerData)
      if (response.success) {
        await fetchCustomers() // Refresh the list
        return response.data
      } else {
        throw new Error(response.message || "Failed to update customer")
      }
    } catch (err) {
      console.error("Error updating customer:", err)
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      const response = await CustomerService.deleteCustomer(id)
      if (response.success) {
        await fetchSummary() // Refresh summary after deleting customer
        await fetchCustomers() // Refresh the list
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null) // Clear selection if deleted customer was selected
        }
      } else {
        throw new Error(response.message || "Failed to delete customer")
      }
    } catch (err) {
      console.error("Error deleting customer:", err)
      throw err
    }
  }

  // Helper function to refresh data and update selected customer
  const refreshDataAndSelectedCustomer = async () => {
    await fetchSummary() // Refresh summary data to update header
    const updatedCustomers = await fetchCustomers()
    if (selectedCustomer && updatedCustomers.length > 0) {
      const updatedCustomer = updatedCustomers.find((c) => c.id === selectedCustomer.id)
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer)
      }
    }
  }

  // Entry management functions
  const createEntry = async (amount: number, type: "GAVE" | "GOT", entryId?: string) => {
    if (!selectedCustomer) return

    try {
      if (entryId) {
        // Update existing entry
        const response = await EntryService.updateEntry(entryId, { amount, type })
        if (response.success) {
          await refreshDataAndSelectedCustomer() // Refresh data and update selectedCustomer
        } else {
          throw new Error(response.message || "Failed to update entry")
        }
      } else {
        // Create new entry
        const entryData: CreateEntryRequest = {
          type,
          amount,
          customerId: selectedCustomer.id
        }
        const response = await EntryService.createEntry(entryData)
        if (response.success) {
          await refreshDataAndSelectedCustomer() // Refresh data and update selectedCustomer
        } else {
          throw new Error(response.message || "Failed to create entry")
        }
      }
    } catch (err) {
      console.error("Error managing entry:", err)
      throw err
    }
  }

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await EntryService.deleteEntry(entryId)
      if (response.success) {
        await refreshDataAndSelectedCustomer() // Refresh data and update selectedCustomer
      } else {
        throw new Error(response.message || "Failed to delete entry")
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
      throw err
    }
  }

  // Handle customer selection with proper type conversion
  const handleSelectCustomer = (customer: ComponentCustomer) => {
    setSelectedCustomer(customer)
  }

  // Handle edit customer
  const handleEditCustomer = (customer: ComponentCustomer) => {
    setCustomerToEdit(customer)
    setShowEditCustomer(true)
  }

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch summary from API
  const fetchSummary = async () => {
    try {
      const response = await CustomerService.getSummary()
      if (response.success) {
        setTotalDebits(response.data.totalDebits)
        setTotalCredits(response.data.totalCredits)
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  // Responsive check
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading customers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">Error: {error}</div>
        <button onClick={fetchCustomers} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-full overflow-hidden">
      <CustomerListSection
        debits={totalDebits}
        credits={totalCredits}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        onCreateCustomer={createCustomer}
        onUpdateCustomer={updateCustomer}
        onDeleteCustomer={deleteCustomer}
      />
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
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={deleteCustomer}
        onSaveEntry={createEntry}
        onDeleteEntry={deleteEntry}
      />
      <EditCustomerDrawer
        show={showEditCustomer}
        onClose={() => {
          setShowEditCustomer(false)
          setCustomerToEdit(null)
        }}
        customer={customerToEdit}
        onUpdateCustomer={updateCustomer}
        onDeleteCustomer={deleteCustomer}
      />
    </div>
  )
}

export default function Customers() {
  return (
    <ProtectedRoute requiredPermission="customers">
      <CustomersContent />
    </ProtectedRoute>
  )
}
