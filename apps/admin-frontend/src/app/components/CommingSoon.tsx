import Link from "next/link"
import React from "react"

function ComingSoon() {
  return (
    <>
      <div className="text-2xl font-bold text-center mt-10">Coming soon</div>
      <div className="text-center text-gray-500 mt-4">This page is under construction</div>
      <div className="text-center text-gray-500 mt-4">Please check back later or contact support for more information.</div>
      <div className="text-center mt-6"></div>
      <div className="text-center mt-6">
        <Link href="/dashboard">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow text-lg font-medium transition-colors">Back to Dashboard</button>
        </Link>
      </div>
    </>
  )
}

export default ComingSoon
