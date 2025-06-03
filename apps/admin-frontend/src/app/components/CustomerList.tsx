import React from "react"

export default function CustomerList({ customers, onSelect }: { customers: { id: number; name: string; status: string; amount: number }[]; onSelect: (customer: any) => void }) {
  return (
    <ul className="divide-y divide-gray-200">
      {customers.map((customer) => (
        <li key={customer.id} className="py-3 px-2 cursor-pointer hover:bg-gray-200 rounded transition md:rounded-none" onClick={() => onSelect(customer)}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{customer.name}</span>
            <span className="text-xs px-2 py-1 rounded bg-gray-300 text-gray-700">{customer.amount.toFixed(2)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
