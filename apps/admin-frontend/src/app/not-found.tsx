import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link href="/dashboard">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow text-lg font-medium transition-colors">Back to Dashboard</button>
      </Link>
    </div>
  )
}
