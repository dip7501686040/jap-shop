"use client"
import React, { useState } from "react"
import Sidebar from "../components/Sidebar"

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen max-h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar toggle button */}
      <button className="fixed top-1 left-1 z-50 md:hidden bg-gray-900 text-white p-1 rounded focus:outline-none" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle sidebar">
        {sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        )}
      </button>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-300 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Main content area with header and children */}
      <div className="flex-1 flex flex-col min-h-screen max-h-screen transition-all duration-300 overflow-hidden">
        {/* <div className="sticky top-0 z-20">
          <Header />
        </div> */}
        <main className="flex-1 bg-gray-100 text-black h-full overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

export default Layout
