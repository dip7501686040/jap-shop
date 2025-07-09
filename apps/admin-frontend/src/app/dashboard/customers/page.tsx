"use client"
import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import CustomerListSection from "../../components/CustomerListSection"
import CustomerDetailsSection from "../../components/CustomerDetailsSection"
import EditCustomerDrawer from "../../components/EditCustomerDrawer"
import { CustomerService, Customer, CreateCustomerRequest, UpdateCustomerRequest, EntryService, CreateEntryRequest, LogbookService } from "../../../lib/api-services"
import { Customer as ComponentCustomer } from "../../components/CustomerListSection"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import { useLogbook } from "@/app/context/logbook-context"

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
  const { selectedLogbook, defaultLogbook, fetchLogbooks } = useLogbook()
  const searchParams = useSearchParams()
  const router = useRouter()
  const customerIdFromUrl = searchParams.get("customerId")
  const logbookIdFromUrl = searchParams.get("logbookId")

  // Get the logbook to use for queries (selected or default)
  const currentLogbook = selectedLogbook || defaultLogbook

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

      // If no logbook is selected and no default logbook, fetch logbooks first
      if (!currentLogbook) {
        console.warn("No logbook available for fetching customers")
        await fetchLogbooks()
        return []
      }

      const response = await LogbookService.getLogbookCustomers(currentLogbook.id, 1, 100)
      if (response.success) {
        // Transform LogbookCustomer[] to Customer[] for compatibility
        const customersData = response.data.map((lc) => lc.customer)
        const formattedCustomers = formatCustomersForComponent(customersData)
        setCustomers(formattedCustomers)
        return formattedCustomers
      } else {
        setError("Failed to fetch customers")
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
      if (!currentLogbook) {
        throw new Error("No logbook selected")
      }

      // First create the customer
      const response = await CustomerService.createCustomer(customerData)
      if (response.success) {
        // Add the customer to the current logbook
        await LogbookService.addCustomerToLogbook(currentLogbook.id, { customerId: response.data.id })

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
      if (!currentLogbook) {
        throw new Error("No logbook selected")
      }

      // Remove customer from the current logbook instead of deleting the customer entirely
      const response = await LogbookService.removeCustomerFromLogbook(currentLogbook.id, id)
      if (response.success) {
        await fetchSummary() // Refresh summary after removing customer from logbook
        await fetchCustomers() // Refresh the list
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null) // Clear selection if removed customer was selected
        }
      } else {
        throw new Error(response.message || "Failed to remove customer from logbook")
      }
    } catch (err) {
      console.error("Error removing customer from logbook:", err)
      throw err
    }
  }

  // Helper function to refresh data and update selected customer
  const refreshDataAndSelectedCustomer = async () => {
    if (!currentLogbook) {
      console.warn("No logbook available for refreshing data")
      return
    }

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

  // Fetch summary from API
  const fetchSummary = async () => {
    try {
      if (!currentLogbook) {
        console.warn("No logbook available for fetching summary")
        return
      }

      const response = await CustomerService.getSummaryByLogbook(currentLogbook.id)
      if (response.success) {
        setTotalDebits(response.data.totalDebits)
        setTotalCredits(response.data.totalCredits)
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  // Load customers on component mount and when currentLogbook changes
  useEffect(() => {
    if (currentLogbook) {
      fetchCustomers()
    }
  }, [currentLogbook]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentLogbook) {
      fetchSummary()
    }
  }, [currentLogbook]) // eslint-disable-line react-hooks/exhaustive-deps

  // Responsive check
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  // Select customer from URL parameter if available
  useEffect(() => {
    if (customerIdFromUrl && customers.length > 0) {
      const customer = customers.find((c) => c.id === customerIdFromUrl)
      if (customer) {
        setSelectedCustomer(customer)
      }
    }
  }, [customerIdFromUrl, customers])

  // Update URL to include logbook ID if not present
  useEffect(() => {
    if (currentLogbook && !logbookIdFromUrl) {
      // If we have a current logbook but no logbook ID in URL, update the URL
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("logbookId", currentLogbook.id)
      if (customerIdFromUrl) {
        newSearchParams.set("customerId", customerIdFromUrl)
      }
      router.replace(`/dashboard/customers?${newSearchParams.toString()}`)
    }
  }, [currentLogbook, logbookIdFromUrl, customerIdFromUrl, searchParams, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading customers...</div>
      </div>
    )
  }

  if (!currentLogbook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg mb-4">No logbook available</div>
        <div className="text-gray-600 text-center">Please select a logbook from the sidebar or contact your administrator to set up logbooks.</div>
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
    <div className="flex flex-col h-full">
      {/* Logbook Header */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Customers - {currentLogbook.name}</h1>
        {currentLogbook.description && <p className="text-sm text-gray-600 mt-1">{currentLogbook.description}</p>}
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
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
