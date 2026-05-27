import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isDark, setIsDark } = useTheme()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        sessionStorage.setItem('admin_user', JSON.stringify(data.user))
        router.push('/admin/dashboard')
      } else {
        setError(data.message || 'Authentication failed.')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Head>
        <title>Admin Login - Parliament Estate</title>
      </Head>

      {/* Header */}
      <header className="docked full-width top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 sticky transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto w-full flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-3">
            <img alt="Parliament Estate" className="w-8 h-8 object-contain" src="/favicon.svg" />
            <span className="text-xl md:text-2xl font-medium tracking-tight text-black dark:text-white">Parliament Estate</span>
          </Link>
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
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 hidden sm:block"
            >
              &larr; Back to Signup
            </Link>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-20">
        <div className="w-full max-w-[500px]">
          <header className="mb-12 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-medium">System Management</span>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2 mb-4 tracking-tight">Admin Portal</h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Log in to manage estate members and verify accounts.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded text-sm flex items-start gap-3">
              <span className="mt-0.5 text-base">⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@parliamentestate.com"
                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
              />
            </div>

            <div className="group">
              <label className="text-xs block mb-2 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-none px-4 py-3 text-base focus:border-black dark:focus:border-white outline-none transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-5 text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
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
