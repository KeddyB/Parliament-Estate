import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery, sanityMutate } from '../../lib/sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id, isAdmin } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Member ID is required' })
  }

  try {
    // If promoting to admin, check that the member has a password set
    if (isAdmin) {
      const member = await sanityQuery(`*[_type == "member" && _id == "${id}"][0]{ password }`)
      if (!member || !member.password) {
        return res.status(400).json({ message: 'Cannot promote to admin: this member has no password set.' })
      }
    }

    const mutations = [
      {
        patch: {
          id,
          set: { isAdmin: Boolean(isAdmin) },
        },
      },
    ]

    await sanityMutate(mutations)
    return res.status(200).json({ success: true, message: 'Member admin role status updated' })
  } catch (error: any) {
    console.error('Toggle Admin Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
