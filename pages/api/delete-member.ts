import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityMutate } from '../../lib/sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Member ID is required' })
  }

  try {
    const mutations = [
      {
        delete: {
          id,
        },
      },
    ]

    await sanityMutate(mutations)
    return res.status(200).json({ success: true, message: 'Member record deleted successfully' })
  } catch (error: any) {
    console.error('Delete Member Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
