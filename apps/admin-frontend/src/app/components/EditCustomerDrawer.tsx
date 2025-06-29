import React, { useState, useEffect } from "react"
import { UpdateCustomerRequest, Customer as ApiCustomer, Entry } from "../../lib/api-services"

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  status: string
  debits: number
  credits: number
  amount?: number
  entries?: Entry[]
  createdAt?: string
  updatedAt?: string
}

interface EditCustomerDrawerProps {
  show: boolean
  onClose: () => void
  customer: Customer | null
  onUpdateCustomer?: (id: string, customerData: UpdateCustomerRequest) => Promise<ApiCustomer>
  onDeleteCustomer?: (id: string) => Promise<void>
}

const EditCustomerDrawer: React.FC<EditCustomerDrawerProps> = ({ show, onClose, customer, onUpdateCustomer, onDeleteCustomer }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || ""
      })
    }
  }, [customer])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !customer) {
      setError("Party name is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined
      }

      if (onUpdateCustomer) {
        await onUpdateCustomer(customer.id, customerData)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return

    setIsDeleting(true)
    setError(null)

    try {
      if (onDeleteCustomer) {
        await onDeleteCustomer(customer.id)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!show || !customer) return null

  return (
    <div className="block">
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slidein">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="text-lg font-semibold">Edit Customer</span>
          <button className="text-2xl text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          <form id="edit-customer-form" className="space-y-6" onSubmit={handleSubmit}>
            {/* Party Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Enter Party Name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                placeholder="Enter Address"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257] resize-none"
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            {/* Delete Section */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Danger Zone</div>
              {!showDeleteConfirm ? (
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors">
                  Delete Customer
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">Are you sure you want to delete this customer? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                      {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Update Button - sticky at bottom */}
          <div className="absolute bottom-0 left-0 w-full max-w-md bg-white pb-2 px-4 flex justify-end z-50">
            <button
              type="submit"
              form="edit-customer-form"
              disabled={isSubmitting}
              className="w-full px-8 py-2 rounded-full bg-[#b01257] text-white text-lg font-semibold shadow-xl hover:bg-[#a0004a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCustomerDrawer
