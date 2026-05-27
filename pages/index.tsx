import { useState, useEffect } from 'react' // Force rebuild 2
import Link from 'next/link'
import Head from 'next/head'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const ROAD_HOUSE_LIMITS: Record<string, number> = {
  '1': 20,
  '2': 50,
  '3': 20,
  '4': 20,
  '5': 20,
  '6': 20,
  '7': 20,
  '8': 20,
  '9': 20,
  '10': 20,
  '11': 20,
  '12': 50,
}

export default function Home() {
  const { isDark, setIsDark } = useTheme()

  const [formData, setFormData] = useState({
    name: '',
    landlord: '',
    roadNumber: '',
    close: '',
    houseNumber: '',
    email: '',
    phoneNumber: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error on change
    if (name === 'houseNumber' || name === 'roadNumber') {
      setValidationError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setValidationError(null)

    const { name, roadNumber, houseNumber, email, password } = formData

    if (!name || !roadNumber || !houseNumber || !email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    const houseNum = parseInt(houseNumber, 10)
    if (isNaN(houseNum) || houseNum <= 0) {
      setValidationError('House number must be a positive number.')
      return
    }

    const limit = ROAD_HOUSE_LIMITS[roadNumber]
    if (limit && houseNum > limit) {
      setValidationError(`House number cannot exceed ${limit} for Road ${roadNumber}.`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setFormData({
          name: '',
          landlord: '',
          roadNumber: '',
          close: '',
          houseNumber: '',
          email: '',
          phoneNumber: '',
          password: '',
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Head>
        <title>Register | Parliament Estate</title>
        <meta name="description" content="Register your details for Parliament Estate membership." />
      </Head>

      {/* Header */}
      <header className="docked full-width top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 sticky transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto w-full flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-3">
            <img alt="Parliament Estate" className="w-8 h-8 object-contain" src="/favicon.svg" />
            <h1 className="text-xl md:text-2xl font-medium tracking-tight text-black dark:text-white">Parliament Estate</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              type="button"
              className="flex items-center justify-center p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] duration-150 rounded"
              title="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
            <Link className="text-sm font-medium text-black dark:text-white hover:opacity-90 transition-all hidden sm:block" href="/admin/login">
              Admin Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-20">
        <div className="w-full max-w-[500px]">
          <header className="mb-12 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-medium">Registration</span>
            <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4 tracking-tight">Establish Residence</h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">Complete the form below to register within the Parliament Estate digital management system.</p>
          </header>

          {message && (
            <div
              className={`mb-6 p-4 rounded text-sm flex items-start gap-3 ${message.type === 'success'
                  ? 'bg-green-100/50 dark:bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-red-100/50 dark:bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'
                }`}
            >
              <span className="mt-0.5 text-base">
                {message.type === 'success' ? '✓' : '⚠️'}
              </span>
              <div>{message.text}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Section */}
            <div className="space-y-6">
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="full-name">Full Name *</label>
                <input
                  id="full-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder="Johnathan Doe"
                  type="text"
                />
              </div>
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="landlord-name">Landlord Name (Optional)</label>
                <input
                  id="landlord-name"
                  name="landlord"
                  value={formData.landlord}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder="Estate Management Ltd."
                  type="text"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="road-number">Road Number *</label>
                <select
                  id="road-number"
                  name="roadNumber"
                  required
                  value={formData.roadNumber}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100 [&>option]:text-black"
                >
                  <option disabled value="">Select Road</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Road {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="close-number">Close *</label>
                <input
                  id="close-number"
                  name="close"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formData.close}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder="1"
                />
              </div>

              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium flex justify-between" htmlFor="house-number">
                  <span>House Number *</span>
                  {formData.roadNumber && (
                    <span className="text-[10px] opacity-70">
                      Max {ROAD_HOUSE_LIMITS[formData.roadNumber] || 20}
                    </span>
                  )}
                </label>
                <input
                  id="house-number"
                  name="houseNumber"
                  required
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors ${validationError ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'
                    }`}
                  placeholder="24"
                  type="text"
                />
                {validationError && (
                  <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    ⚠️ {validationError}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder="resident@parliament.estate"
                  type="email"
                />
              </div>
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder="+234 802 123 4567"
                  type="tel"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="group">
              <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="password">Password (Optional)</label>
              <input
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
                placeholder="••••••••••••"
                type="password"
              />
              <p className="text-[10px] text-zinc-500 mt-2">Only required if you need admin access.</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !!validationError}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-5 text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 mt-8">
              By registering, you agree to our <Link className="underline hover:text-black dark:hover:text-white transition-colors" href="#">Digital Charter</Link> and <Link className="underline hover:text-black dark:hover:text-white transition-colors" href="#">Privacy Mandates</Link>.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="full-width bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto w-full py-10 px-6 flex justify-center items-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} Parliament Estate.</p>
        </div>
      </footer>
    </div>
  )
}
