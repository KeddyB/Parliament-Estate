import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery } from '../../../lib/sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Member ID is required.' })
  }

  try {
    const results = await sanityQuery(`*[_type == "member" && _id == "${id}"][0]`)

    if (!results) {
      return res.status(404).json({ message: 'Member not found.' })
    }

    // Strip password before sending
    const { password, ...member } = results
    return res.status(200).json(member)
  } catch (error: any) {
    console.error('Fetch Member Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
