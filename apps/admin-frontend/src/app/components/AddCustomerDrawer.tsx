import { Contact } from "lucide-react"
import React from "react"

interface AddCustomerDrawerProps {
  show: boolean
  onClose: () => void
}

const AddCustomerDrawer: React.FC<AddCustomerDrawerProps> = ({ show, onClose }) => {
  if (!show) return null
  return (
    <div className="block">
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slidein">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="text-lg font-semibold">Add New Customer</span>
          <button className="text-2xl text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            {/* Party Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name <span className="text-red-500">*</span>
              </label>
              <div className="flex relative">
                <input id="partyNameInput" required type="text" placeholder="Enter Party Name" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]" />
                {/* Show contact picker button on mobile only */}
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden flex items-center px-2 py-1 bg-gray-100 border-none rounded text-xs text-[#b01257] hover:bg-gray-200 focus:outline-none"
                  style={{ height: "28px" }}
                  onClick={async () => {
                    if ("contacts" in navigator && "ContactsManager" in window) {
                      try {
                        interface Contact {
                          name?: string[]
                          tel?: string[]
                        }
                        interface ContactsManager {
                          select(properties: ("name" | "tel")[], options: { multiple: boolean }): Promise<Contact[]>
                        }
                        const contactsManager = navigator.contacts as unknown as ContactsManager
                        const contacts = await contactsManager.select(["name", "tel"], { multiple: false })
                        if (contacts && contacts.length > 0) {
                          const name = contacts[0].name && contacts[0].name.length > 0 ? contacts[0].name[0] : ""
                          let tel = contacts[0].tel && contacts[0].tel.length > 0 ? contacts[0].tel[0] : ""
                          tel = tel.replace(/\D/g, "")
                          if (tel.length > 10) tel = tel.slice(-10)
                          const partyNameInput = document.getElementById("partyNameInput") as HTMLInputElement
                          const phoneInput = document.getElementById("phoneInput") as HTMLInputElement
                          if (partyNameInput && name) partyNameInput.value = name
                          if (phoneInput && tel) phoneInput.value = tel
                        }
                      } catch {
                        alert("Could not access contacts.")
                      }
                    } else {
                      alert("Contact picker is not supported on this device/browser.")
                    }
                  }}
                  aria-label="Pick from contacts"
                >
                  <Contact className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-xs text-gray-400">(optional)</span> <span className="text-red-500">*</span>
              </label>
              <div className="flex relative">
                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                <input id="phoneInput" required type="tel" placeholder="Enter Phone Number" className="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]" />
                {/* Removed contact picker button from phone number field */}
              </div>
            </div>
            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Balance <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input type="number" placeholder="Enter amount" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]" />
                <select className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b01257]">
                  <option value="gave">You Gave</option>
                  <option value="got">You Got</option>
                </select>
              </div>
            </div>
            {/* Customer/Supplier Radio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Who are they?</label>
              <div className="flex items-center gap-6 mt-1">
                <label className="inline-flex items-center">
                  <input type="radio" name="partyType" value="customer" defaultChecked className="form-radio text-[#b01257]" />
                  <span className="ml-2 text-gray-700">Customer</span>
                </label>
                {/* <label className="inline-flex items-center">
                  <input type="radio" name="partyType" value="supplier" className="form-radio text-[#b01257]" />
                  <span className="ml-2 text-gray-700">Supplier</span>
                </label> */}
              </div>
            </div>
            {/* GSTIN & Address (Expandable) */}
            <div className="border-t pt-4">
              <details className="group">
                <summary className="flex items-center cursor-pointer select-none text-[#2563eb] font-medium text-sm group-open:text-[#b01257]">
                  Add GSTIN & Address (Optional)
                  <svg className="ml-2 w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <input type="text" placeholder="Enter GSTIN" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea placeholder="Enter Address" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01257] resize-none" rows={2} />
                  </div>
                </div>
              </details>
            </div>
          </form>
          {/* Add Customer Button - sticky at bottom */}
          <div className="fixed bottom-0 left-0 w-full max-w-md bg-white pt-4 pb-2 flex justify-end z-50 border-t border-gray-200">
            <button
              type="submit"
              form="add-customer-form"
              className="w-full md:w-auto px-8 py-3 rounded-full bg-[#b01257] text-white text-lg font-semibold shadow-xl hover:bg-[#a0004a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerDrawer
