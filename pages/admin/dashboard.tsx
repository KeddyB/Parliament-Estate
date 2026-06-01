import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Sun, Moon, RefreshCw, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface Member {
  _id: string
  residentId?: string
  name: string
  landlord?: string
  roadNumber: string
  houseNumber: string
  email: string
  phoneNumber?: string
  isAdmin: boolean
  isVerified: boolean
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { isDark, setIsDark } = useTheme()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE)
  const paginatedMembers = members.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  
  const router = useRouter()

  useEffect(() => {
    // 1. Verify admin session
    const adminSession = sessionStorage.getItem('admin_user')
    if (!adminSession) {
      router.push('/admin/login')
      return
    }
    setAdmin(JSON.parse(adminSession))

    // 2. Fetch all members
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        setMessage({ type: 'error', text: 'Failed to retrieve members list.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Error connecting to the server.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
    setMessage(null)
    setActionLoading(id + '-verify')
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isVerified: !currentStatus }),
      })

      if (response.ok) {
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, isVerified: !currentStatus } : m))
        )
        setMessage({
          type: 'success',
          text: `User verification status updated successfully!`,
        })
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

  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    setMessage(null)
    setActionLoading(id + '-admin')
    try {
      const response = await fetch('/api/toggle-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isAdmin: !currentStatus }),
      })

      if (response.ok) {
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, isAdmin: !currentStatus } : m))
        )
        setMessage({
          type: 'success',
          text: `User administrative role updated successfully!`,
        })
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

  const handleDeleteMember = async (id: string, name: string) => {
    setDeleteTarget(null)

    setMessage(null)
    setActionLoading(id + '-delete')
    try {
      const response = await fetch('/api/delete-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== id))
        setMessage({
          type: 'success',
          text: `Member "${name}" was permanently removed.`,
        })
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

  const handleExportCSV = () => {
    const headers = ['Name', 'Role', 'Address', 'Email', 'Phone Number']
    const rows = members.map(m => {
      const role = m.landlord ? m.landlord.charAt(0).toUpperCase() + m.landlord.slice(1) : 'N/A'
      const address = `Road ${m.roadNumber}, House ${m.houseNumber}`
      return [
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${role.replace(/"/g, '""')}"`,
        `"${address.replace(/"/g, '""')}"`,
        `"${(m.email || '').replace(/"/g, '""')}"`,
        `"${(m.phoneNumber || '').replace(/"/g, '""')}"`
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `parliament_estate_members_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate statistics
  const totalCount = members.length
  const verifiedCount = members.filter((m) => m.isVerified).length
  const pendingCount = totalCount - verifiedCount
  const adminCount = members.filter((m) => m.isAdmin).length

  if (!admin) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-sans">
        Checking session...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <Head>
        <title>Admin Dashboard - Parliament Estate</title>
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
            <div className="hidden md:flex flex-col items-end text-xs mr-2">
              <span className="font-medium text-black dark:text-white">{admin.name}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{admin.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-200 px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-10 z-10">
        {/* Banner */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              System Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
              Verify pending registrations, allocate admin privileges, and manage all members.
            </p>
          </div>
        </div>

        {/* Status Alert Messages */}
        {message && (
          <div
            className={`mb-8 p-4 rounded text-sm flex items-start gap-3 ${
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {/* Total Members */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Total Members
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{loading ? '...' : totalCount}</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">registered</span>
            </div>
          </div>

          {/* Pending Verification */}
          <div 
            onClick={() => router.push('/admin/pending')}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 relative overflow-hidden cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition duration-150"
          >
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Pending Action
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{loading ? '...' : pendingCount}</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">unverified</span>
            </div>
            {pendingCount > 0 && !loading && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white"></span>
              </span>
            )}
          </div>

          {/* Verified Members */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Verified Users
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{loading ? '...' : verifiedCount}</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">approved</span>
            </div>
          </div>

          {/* Administrators */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Administrators
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{loading ? '...' : adminCount}</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">with access</span>
            </div>
          </div>
        </div>

        {/* Members Table Header */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition duration-150"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchMembers}
            className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Members Table Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="w-full">
              {/* Mobile Skeletons */}
              <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4 mt-1 shrink-0 animate-pulse"></div>
                    <div className="w-full space-y-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Skeletons */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950/50">
                      <th className="px-6 py-4">S/N</th>
                      <th className="px-6 py-4">Member Info</th>
                      <th className="px-6 py-4">Address Details</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status & Roles</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-6 animate-pulse"></div></td>
                        <td className="px-6 py-5 space-y-2">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-5 space-y-2">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-40 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-5 space-y-2">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36 animate-pulse"></div>
                          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-5 space-y-2">
                          <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                          <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-20 ml-auto animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="py-20 text-center text-zinc-600 dark:text-zinc-400 text-sm">
              No registered members found in the system.
            </div>
          ) : (
            <div className="w-full">
              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedMembers.map((member, index) => (
                  <div
                    key={member._id}
                    className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition duration-150 cursor-pointer active:bg-zinc-100 dark:active:bg-zinc-800"
                    onClick={() => router.push(`/admin/member/${member._id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-zinc-400 font-mono text-xs mt-1 shrink-0">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{member.name}</div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                            Road {member.roadNumber}, House {member.houseNumber}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 truncate">{member.email}</div>
                          <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 mt-1">ID: {member.residentId || member._id.substring(0, 8)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {member.isVerified ? (
                          <span className="inline-flex items-center justify-center w-16 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-16 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            Pending
                          </span>
                        )}
                        {member.isAdmin ? (
                          <span className="inline-flex items-center justify-center w-16 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-16 px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                            Standard
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950/50">
                      <th className="px-6 py-4">S/N</th>
                      <th className="px-6 py-4">Member Info</th>
                      <th className="px-6 py-4">Address Details</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status & Roles</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                    {paginatedMembers.map((member, index) => (
                      <tr 
                        key={member._id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition duration-150 cursor-pointer"
                        onClick={() => router.push(`/admin/member/${member._id}`)}
                      >
                        {/* S/N */}
                        <td className="px-6 py-5 text-zinc-500 font-mono text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        {/* Name & ID */}
                        <td className="px-6 py-5">
                          <div className="font-semibold text-base">{member.name}</div>
                          {member.landlord && (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                              Landlord: <span>{member.landlord}</span>
                            </div>
                          )}
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 block mt-1">ID: {member.residentId || member._id.substring(0, 8) + '...'}</span>
                        </td>

                        {/* Address */}
                        <td className="px-6 py-5">
                          <div className="font-medium">Road {member.roadNumber}, House {member.houseNumber}</div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <div>{member.email}</div>
                          {member.phoneNumber && (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{member.phoneNumber}</div>
                          )}
                        </td>

                        {/* Status Badges */}
                        <td className="px-6 py-5 space-y-2">
                          <div className="flex">
                            {member.isVerified ? (
                              <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex">
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
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right space-y-2 lg:space-y-0 lg:space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleVerify(member._id, member.isVerified)}
                            disabled={!!actionLoading}
                            className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition duration-150 border ${
                              member.isVerified
                                ? 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:opacity-90'
                            }`}
                          >
                            {actionLoading === member._id + '-verify' ? '...' : member.isVerified ? 'Unverify' : 'Verify'}
                          </button>

                          <button
                            onClick={() => handleToggleAdmin(member._id, member.isAdmin)}
                            disabled={!!actionLoading}
                            className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition duration-150 border ${
                              member.isAdmin
                                ? 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                : 'bg-transparent text-black dark:text-white border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {actionLoading === member._id + '-admin' ? '...' : member.isAdmin ? 'Demote' : 'Promote'}
                          </button>

                          <button
                            onClick={() => setDeleteTarget({ id: member._id, name: member.name })}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-transparent border border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold tracking-wide transition duration-150"
                          >
                            {actionLoading === member._id + '-delete' ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * ITEMS_PER_PAGE, members.length)}</span> of <span className="font-medium text-zinc-900 dark:text-zinc-100">{members.length}</span> results
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 min-w-[3rem] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-all" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 w-full max-w-[400px] mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold tracking-tight mb-2">Confirm Deletion</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMember(deleteTarget.id, deleteTarget.name)}
                disabled={!!actionLoading}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-red-600 text-white border border-red-600 hover:bg-red-700 transition duration-150 disabled:opacity-50"
              >
                {actionLoading === deleteTarget.id + '-delete' ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
