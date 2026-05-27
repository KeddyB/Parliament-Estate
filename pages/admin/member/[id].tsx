import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import { useTheme } from '../../../hooks/useTheme'

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
  _createdAt?: string
  _updatedAt?: string
}

export default function MemberDetail() {
  const router = useRouter()
  const { id } = router.query

  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { isDark, setIsDark } = useTheme()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_user')
    if (!adminSession) {
      router.push('/admin/login')
      return
    }

    if (id && typeof id === 'string') {
      fetchMember(id)
    }
  }, [id])

  const fetchMember = async (memberId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/members/${memberId}`)
      if (response.ok) {
        const data = await response.json()
        setMember(data)
      } else if (response.status === 404) {
        setError('Member not found.')
      } else {
        setError('Failed to load member details.')
      }
    } catch (err) {
      console.error(err)
      setError('Error connecting to the server.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerify = async () => {
    if (!member) return
    setMessage(null)
    setActionLoading('verify')
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id, isVerified: !member.isVerified }),
      })
      if (response.ok) {
        setMember({ ...member, isVerified: !member.isVerified })
        setMessage({ type: 'success', text: `Verification status updated.` })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || 'Operation failed.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAdmin = async () => {
    if (!member) return
    setMessage(null)
    setActionLoading('admin')
    try {
      const response = await fetch('/api/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id, isAdmin: !member.isAdmin }),
      })
      if (response.ok) {
        setMember({ ...member, isAdmin: !member.isAdmin })
        setMessage({ type: 'success', text: `Admin role updated.` })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || 'Operation failed.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!member) return
    setShowDeleteModal(false)

    setMessage(null)
    setActionLoading('delete')
    try {
      const response = await fetch('/api/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id }),
      })
      if (response.ok) {
        setMessage({ type: 'success', text: `Member "${member.name}" has been deleted.` })
        setTimeout(() => router.push('/admin/dashboard'), 1500)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || 'Deletion failed.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <Head>
        <title>{member ? `${member.name} — Admin` : 'Member Details'} | Parliament Estate</title>
      </Head>

      {/* Header */}
      <header className="docked full-width top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50 sticky transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto w-full flex justify-between items-center px-6 h-16">
          <Link href="/" className="flex items-center gap-3">
            <img alt="Parliament Estate" className="w-8 h-8 object-contain" src="/favicon.svg" />
            <span className="text-xl md:text-2xl font-medium tracking-tight text-black dark:text-white">Admin</span>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {loading && (
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 h-64 rounded-sm"></div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 h-48 rounded-sm"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 h-48 rounded-sm"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="py-24 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">{error}</p>
            <Link href="/admin/dashboard" className="text-sm underline hover:text-black dark:hover:text-white transition-colors">
              Return to Dashboard
            </Link>
          </div>
        )}

        {member && !loading && (
          <>
            {/* Status Messages */}
            {message && (
              <div
                className={`mb-8 p-4 rounded text-sm flex items-start gap-3 ${message.type === 'success'
                    ? 'bg-green-100/50 dark:bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-red-100/50 dark:bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'
                  }`}
              >
                <span className="mt-0.5 text-base">
                  {message.type === 'success' ? '✓' : '⚠️'}
                </span>
                <div className="flex-1">{message.text}</div>
                <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100 text-xs px-1.5">✕</button>
              </div>
            )}

            {/* Member Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{member.name}</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mt-1">ID: {member._id}</p>
              </div>
              <div className="flex items-center gap-2">
                {member.isVerified ? (
                  <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Pending
                  </span>
                )}
                {member.isAdmin ? (
                  <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                    Standard
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Personal Information */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">Personal Information</h2>
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Full Name</span>
                    <span className="text-base font-medium">{member.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Email Address</span>
                    <span className="text-base">{member.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Phone Number</span>
                    <span className="text-base">{member.phoneNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Landlord</span>
                    <span className="text-base">{member.landlord || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">Address Details</h2>
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Road Number</span>
                    <span className="text-base font-medium">Road {member.roadNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Close</span>
                    <span className="text-base font-medium">{member.close}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">House Number</span>
                    <span className="text-base font-medium">{member.houseNumber}</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">System Information</h2>
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Document ID</span>
                    <span className="text-sm font-mono">{member._id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Created At</span>
                    <span className="text-base">{formatDate(member._createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Last Updated</span>
                    <span className="text-base">{formatDate(member._updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Roles & Status */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">Roles & Status</h2>
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Verification Status</span>
                    <span className="text-base font-medium">{member.isVerified ? 'Verified' : 'Pending Verification'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">Role</span>
                    <span className="text-base font-medium">{member.isAdmin ? 'Administrator' : 'Standard Member'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleToggleVerify}
                  disabled={!!actionLoading}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition duration-150 border disabled:opacity-50 disabled:cursor-not-allowed ${member.isVerified
                      ? 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:opacity-90'
                    }`}
                >
                  {actionLoading === 'verify' ? '...' : member.isVerified ? 'Unverify Member' : 'Verify Member'}
                </button>

                <button
                  onClick={handleToggleAdmin}
                  disabled={!!actionLoading}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition duration-150 border disabled:opacity-50 disabled:cursor-not-allowed ${member.isAdmin
                      ? 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : 'bg-transparent text-black dark:text-white border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                >
                  {actionLoading === 'admin' ? '...' : member.isAdmin ? 'Demote to Standard' : 'Promote to Admin'}
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={!!actionLoading}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition duration-150 border border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'delete' ? '...' : 'Delete Member'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && member && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 w-full max-w-[400px] mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold tracking-tight mb-2">Confirm Deletion</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{member.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white border border-red-600 hover:bg-red-700 transition duration-150 disabled:opacity-50"
              >
                {actionLoading === 'delete' ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
