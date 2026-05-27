import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery } from '../../lib/sanity'
import { verifyPassword } from '../../lib/crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const normalizedEmail = email.toLowerCase().trim()
    
    // Query Sanity for an admin user with this email
    const adminUser = await sanityQuery(`*[_type == "member" && lower(email) == "${normalizedEmail}" && isAdmin == true][0]`)
    
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials or admin access denied' })
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, adminUser.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials or admin access denied' })
    }

    // Return successfully
    return res.status(200).json({
      success: true,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: true,
      }
    })
  } catch (error: any) {
    console.error('Admin Login Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
