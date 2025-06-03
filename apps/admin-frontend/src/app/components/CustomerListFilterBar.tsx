import React from "react"

interface CustomerListFilterBarProps {
  selectedCustomer: any
}

const CustomerListFilterBar: React.FC<CustomerListFilterBarProps> = ({ selectedCustomer }) => (
  <div
    className={`sticky z-10 px-4 md:px-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 border-b border-gray-200 ${selectedCustomer ? "hidden" : ""} md:flex`}
    style={{ top: "45px" }}
  >
    <input type="text" placeholder="Search customers..." className="border border-gray-300 rounded px-3 py-1 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
    <select className="border border-gray-300 rounded px-3 py-1 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
      <option value="">Filter by</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="vip">VIP</option>
    </select>
    <select className="border border-gray-300 rounded px-3 py-1 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
      <option value="">Sort by</option>
      <option value="name">Name</option>
      <option value="recent">Most Recent</option>
      <option value="debits">Debits</option>
      <option value="credits">Credits</option>
    </select>
  </div>
)

export default CustomerListFilterBar
