import React, { useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { Check, Trash2, ShieldAlert } from 'lucide-react'

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

interface SwipeableMemberCardProps {
  member: Member
  onVerify: (id: string) => void
  onDelete: (id: string) => void
  actionLoading: string | null
}

export function SwipeableMemberCard({ member, onVerify, onDelete, actionLoading }: SwipeableMemberCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmVerify, setShowConfirmVerify] = useState(false)
  const controls = useAnimation()
  
  // SWIPE THRESHOLDS
  const VERIFY_THRESHOLD = 100
  const DELETE_THRESHOLD = -100

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], cancel }) => {
      // Ignore drags if a network action is happening for this card
      if (actionLoading && actionLoading.startsWith(member._id)) return

      // If we are currently showing confirm delete, prevent drag unless they drag right to close it
      if (showConfirmDelete) {
        if (active && mx > 20) {
           setShowConfirmDelete(false)
           controls.start({ x: 0 })
        }
        return
      }

      // If we are currently showing confirm verify, prevent drag unless they drag left to close it
      if (showConfirmVerify) {
        if (active && mx < -20) {
           setShowConfirmVerify(false)
           controls.start({ x: 0 })
        }
        return
      }

      if (active) {
        controls.start({ x: mx, transition: { type: 'spring', stiffness: 400, damping: 40 } })
      } else {
        // Drag ended
        if (mx > VERIFY_THRESHOLD) {
          // Swipe Right -> Show Verify Confirm
          setShowConfirmVerify(true)
          controls.start({ x: 120 }) // Keep it open at 120px to show confirm button
        } else if (mx < DELETE_THRESHOLD) {
          // Swipe Left -> Show Delete Confirm
          setShowConfirmDelete(true)
          controls.start({ x: -120 }) // Keep it open at -120px to show confirm button
        } else {
          // Snap back
          controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
        }
      }
    },
    { axis: 'x', filterTaps: true }
  )

  const isDeleting = actionLoading === member._id + '-delete'
  const isVerifying = actionLoading === member._id + '-verify'

  return (
    <div className="relative w-full overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
      {/* Background Actions (Revealed on Swipe) */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-0">
        <div className="flex items-center text-green-600 dark:text-green-500 font-semibold text-sm">
          <Check className="w-5 h-5 mr-2" />
          Verify Member
        </div>
        <div className="flex items-center text-red-600 dark:text-red-500 font-semibold text-sm">
          Delete
          <Trash2 className="w-5 h-5 ml-2" />
        </div>
      </div>

      {/* Verify Confirmation Button (Only visible when swiped right) */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-[120px] bg-green-600 text-white flex items-center justify-center z-10 transition-opacity duration-200 ${showConfirmVerify ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={() => {
            setShowConfirmVerify(false)
            onVerify(member._id)
          }}
          disabled={isVerifying}
          className="w-full h-full font-semibold text-xs uppercase tracking-wider hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {isVerifying ? '...' : <><Check className="w-4 h-4"/> Confirm</>}
        </button>
      </div>

      {/* Delete Confirmation Button (Only visible when swiped left) */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-[120px] bg-red-600 text-white flex items-center justify-center z-10 transition-opacity duration-200 ${showConfirmDelete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={() => onDelete(member._id)}
          disabled={isDeleting}
          className="w-full h-full font-semibold text-xs uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {isDeleting ? '...' : <><Trash2 className="w-4 h-4"/> Confirm</>}
        </button>
      </div>

      {/* Foreground Draggable Card */}
      <motion.div
        {...(bind() as any)}
        animate={controls}
        style={{ touchAction: 'pan-y' }}
        className={`relative z-20 bg-white dark:bg-zinc-900 p-6 touch-pan-y shadow-[0_0_15px_rgba(0,0,0,0.03)] dark:shadow-none cursor-grab active:cursor-grabbing ${isVerifying ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
              {member.name}
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 font-medium">
              Road {member.roadNumber}, Close {member.close}, House {member.houseNumber}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
              <p className="text-xs text-zinc-500 truncate">{member.email}</p>
              {member.phoneNumber && (
                <p className="text-xs text-zinc-500">{member.phoneNumber}</p>
              )}
            </div>
            {member.landlord && (
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-3">
                Landlord: <span className="text-zinc-600 dark:text-zinc-300">{member.landlord}</span>
              </p>
            )}
          </div>
          
          {/* Desktop Fallback Actions (visible when not swiping) */}
          <div className="shrink-0 flex flex-col gap-2 items-end">
             <span className="inline-flex items-center justify-center px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 mb-2">
               Pending
             </span>
             
             {/* Fallback buttons for non-touch devices */}
             <div className="hidden sm:flex flex-col gap-2 pointer-events-auto">
               <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (showConfirmDelete) {
                      setShowConfirmDelete(false)
                      controls.start({ x: 0 })
                    }
                    setShowConfirmVerify(!showConfirmVerify)
                    if (!showConfirmVerify) {
                      controls.start({ x: 120 })
                    } else {
                      controls.start({ x: 0 })
                    }
                  }}
                  disabled={!!actionLoading}
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white hover:opacity-90 transition duration-150 disabled:opacity-50"
               >
                 {isVerifying ? 'Verifying...' : 'Verify'}
               </button>
               <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (showConfirmVerify) {
                      setShowConfirmVerify(false)
                      controls.start({ x: 0 })
                    }
                    setShowConfirmDelete(!showConfirmDelete)
                    if (!showConfirmDelete) {
                      controls.start({ x: -120 })
                    } else {
                      controls.start({ x: 0 })
                    }
                  }}
                  disabled={!!actionLoading}
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider bg-transparent border border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition duration-150 disabled:opacity-50"
               >
                 Delete
               </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
