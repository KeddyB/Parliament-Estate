import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert, Check } from 'lucide-react'
import { SwipeableMemberCard } from '../../components/SwipeableMemberCard'

interface Member {
  _id: string
  name: string
  landlord?: string
  roadNumber: string
  close?: number | string
  houseNumber: string
  email: string
  phoneNumber?: string
  isAdmin: boolean
  isVerified: boolean
}

export default function PendingMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/members')
      if (res.ok) {
        const data = await res.json()
        // Filter for ONLY pending members
        setMembers(data.filter((m: Member) => !m.isVerified))
      }
    } catch (err) {
      console.error('Error fetching members:', err)
      setMessage({ type: 'error', text: 'Failed to load pending members.' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      setActionLoading(`${id}-verify`)
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isVerified: true }) // It's currently false, we want it true
      })
      
      if (!res.ok) throw new Error('Verification failed')
      
      // Remove verified member from the list
      setMembers(prev => prev.filter(m => m._id !== id))
      setMessage({ type: 'success', text: 'Member verified successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to verify member.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(`${id}-delete`)
      const res = await fetch('/api/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (!res.ok) throw new Error('Deletion failed')
      
      // Remove deleted member from the list
      setMembers(prev => prev.filter(m => m._id !== id))
      setMessage({ type: 'success', text: 'Member deleted permanently.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete member.' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Head>
        <title>Pending Actions | Parliament Estate Admin</title>
      </Head>

      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard"
              className="p-2 -ml-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-medium tracking-tight">Pending Actions</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded text-sm flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-100/50 dark:bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-red-100/50 dark:bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'
            }`}
          >
            <span className="mt-0.5 text-base">
              {message.type === 'success' ? '✓' : '⚠️'}
            </span>
            <div className="flex-1">{message.text}</div>
            <button 
              onClick={() => setMessage(null)} 
              className="opacity-70 hover:opacity-100 text-xs px-1.5"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex justify-between items-start gap-4">
                  <div className="min-w-0 w-full space-y-3">
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse"></div>
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/5 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2 items-end">
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                    <div className="hidden sm:flex flex-col gap-2">
                      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">All caught up!</h3>
              <p className="text-sm text-zinc-500">There are no pending member verifications right now.</p>
              <Link 
                href="/admin/dashboard"
                className="mt-6 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {members.map((member) => (
                <SwipeableMemberCard
                  key={member._id}
                  member={member}
                  onVerify={handleVerify}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
