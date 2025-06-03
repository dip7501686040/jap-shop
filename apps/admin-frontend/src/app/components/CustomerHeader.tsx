import React from "react"
import { MoreVertical, PhoneCall } from "lucide-react"

export default function CustomerHeader({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black">
      {/* Left: Back button */}
      <button className="mr-2 text-white" onClick={onBack}>
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* Center: Avatar, Name, Settings */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mr-3">{name.charAt(0)}</div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-semibold truncate text-lg leading-5">{name}</span>
            <span className="text-gray-200 text-xs leading-4 truncate cursor-pointer">Click here to view settings</span>
          </div>
        </div>
      </div>
      {/* Right: Call and More icons */}
      <div className="flex items-center space-x-4 ml-2">
        <PhoneCall className="text-white" />
        <MoreVertical className="text-white" />
      </div>
    </div>
  )
}
