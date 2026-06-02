import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery } from '../../lib/sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    // Fetch all members from Sanity, sorted by name
    const members = await sanityQuery(`*[_type == "member"] | order(name asc)`)
    
    // Security: Strip passwords before sending to the client
    const sanitizedMembers = members.map((member: any) => {
      const { password, ...rest } = member
      return { ...rest, hasPassword: !!password }
    })

    return res.status(200).json(sanitizedMembers)
  } catch (error: any) {
    console.error('Fetch Members Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
