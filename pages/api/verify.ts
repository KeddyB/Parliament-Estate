import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityMutate } from '../../lib/sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id, isVerified } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Member ID is required' })
  }

  try {
    const mutations = [
      {
        patch: {
          id,
          set: { isVerified: Boolean(isVerified) },
        },
      },
    ]

    await sanityMutate(mutations)
    return res.status(200).json({ success: true, message: 'Member verification status updated' })
  } catch (error: any) {
    console.error('Verify Member Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
