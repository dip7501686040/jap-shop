import React from "react"
import { UserPlus } from "lucide-react"

interface AddCustomerButtonProps {
  onClick: () => void
}

const AddCustomerButton: React.FC<AddCustomerButtonProps> = ({ onClick }) => (
  <button
    className="absolute bottom-8 right-8 md:right-[46%] z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[#b01257] text-white text-lg font-semibold shadow-xl hover:bg-[#a0004a] transition-colors"
    style={{ boxShadow: "0 4px 32px 0 rgba(0,0,0,0.25)" }}
    aria-label="Add Customer"
    onClick={onClick}
  >
    <UserPlus />
    Add Customer
  </button>
)

export default AddCustomerButton
