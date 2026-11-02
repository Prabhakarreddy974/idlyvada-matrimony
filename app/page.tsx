import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-2xl space-y-6">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-full border border-rose-100">
          Trusted Matrimony Platform
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Find Your Perfect Life Partner with <span className="text-rose-600">Idlyvada Matrimony</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          A secure, modern, and dedicated space designed to help you connect with verified profiles and begin your journey together.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-lg shadow-rose-600/20 transition-all"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    </main>
  )
}