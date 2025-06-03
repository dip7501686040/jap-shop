import React from "react"
import { Power } from "lucide-react"

function Header() {
  return (
    <header className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4 justify-end flex-1">
          <div className="text-black">
            <Power className="absolute top-1 right-1 inline-block h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
