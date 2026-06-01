import { useState, useEffect } from 'react' // Force rebuild 2
import Link from 'next/link'
import Head from 'next/head'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'



export default function Home() {
  const { isDark, setIsDark } = useTheme()

  const [formData, setFormData] = useState({
    name: '',
    landlord: '',
    roadNumber: '',
    houseNumber: '',
    email: '',
    phoneNumber: '',
    password: '',
    wantsAdmin: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    const name = target.name
    
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear missing field when user types
    if (missingFields.includes(name)) {
      setMissingFields((prev) => prev.filter((f) => f !== name))
    }

    // Clear validation error on change
    if (name === 'houseNumber' || name === 'roadNumber') {
      setValidationError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setValidationError(null)
    setMissingFields([])

    const newMissingFields: string[] = []
    if (!formData.name) newMissingFields.push('name')
    if (!formData.landlord) newMissingFields.push('landlord')
    if (!formData.roadNumber) newMissingFields.push('roadNumber')
    if (!formData.houseNumber) newMissingFields.push('houseNumber')
    if (!formData.email) newMissingFields.push('email')
    if (formData.wantsAdmin && !formData.password) newMissingFields.push('password')

    if (newMissingFields.length > 0) {
      setMissingFields(newMissingFields)
      setMessage({ type: 'error', text: 'Please fill in all highlighted required fields.' })
      return
    }

    const houseNum = parseInt(formData.houseNumber, 10)
    if (isNaN(houseNum) || houseNum <= 0) {
      setValidationError('House number must be a positive number.')
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
          houseNumber: '',
          email: '',
          phoneNumber: '',
          password: '',
          wantsAdmin: false,
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
            <Link className="text-sm font-medium text-black dark:text-white hover:opacity-90 transition-all" href="/admin/login">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-20">
        <div className="w-full max-w-[500px]">
          <header className="mb-12 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-medium">Registration</span>
            <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4 tracking-tight">Parliament Estate Residence</h2>
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
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors ${missingFields.includes('name') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
                  placeholder="Johnathan Doe"
                  type="text"
                />
              </div>
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="landlord-name">Landlord or Tenant</label>
                <select
                  id="landlord-name"
                  name="landlord"
                  value={formData.landlord}
                  onChange={handleChange}
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100 [&>option]:text-black ${missingFields.includes('landlord') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
                >
                  <option disabled value="">Select</option>
                  <option value="landlord">Landlord</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="road-number">Road Number *</label>
                <select
                  id="road-number"
                  name="roadNumber"
                  required
                  value={formData.roadNumber}
                  onChange={handleChange}
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100 [&>option]:text-black ${missingFields.includes('roadNumber') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
                >
                  <option disabled value="">Select Road</option>
                  <option value="1">Road 1</option>
                  <option value="Road 1 Close 1">Road 1 Close 1</option>
                  <option value="2">Road 2</option>
                  <option value="Close 2 Avenue">Close 2 Avenue</option>
                  <option value="3">Road 3</option>
                  <option value="4">Road 4</option>
                  <option value="5">Road 5</option>
                  <option value="6">Road 6</option>
                  <option value="7">Road 7</option>
                  <option value="8">Road 8</option>
                  <option value="9">Road 9</option>
                  <option value="10">Road 10</option>
                  <option value="11">Road 11</option>
                  <option value="12">Road 12</option>
                  <option value="Road 12A">Road 12A</option>
                  <option value="Road 12B">Road 12B</option>
                  <option value="Road 12C">Road 12C</option>
                  <option value="Road 12D">Road 12D</option>
                  <option value="Road 12E">Road 12E</option>
                  <option value="Road 12F">Road 12F</option>
                </select>
              </div>


              <div className="group">
                <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium flex justify-between" htmlFor="house-number">
                  <span>House Number *</span>
                </label>
                <input
                  id="house-number"
                  name="houseNumber"
                  required
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors ${validationError || missingFields.includes('houseNumber') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
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
                  className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors ${missingFields.includes('email') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wants-admin"
                  name="wantsAdmin"
                  checked={formData.wantsAdmin}
                  onChange={handleChange}
                  className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
                />
                <label htmlFor="wants-admin" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                  Request admin access
                </label>
              </div>

              {formData.wantsAdmin && (
                <div className="group animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    required={formData.wantsAdmin}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-transparent border rounded-none px-4 py-3 text-base outline-none transition-colors ${missingFields.includes('password') ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white'}`}
                    placeholder="••••••••••••"
                    type="password"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2">Required for admin access.</p>
                </div>
              )}
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
