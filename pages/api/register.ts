import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery, sanityMutate } from '../../lib/sanity'
import { hashPassword } from '../../lib/crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { name, landlord, roadNumber, close, houseNumber, email, phoneNumber, password } = req.body

  if (!name || !roadNumber || !houseNumber || !email) {
    return res.status(400).json({ message: 'Required fields are missing' })
  }

  try {
    // 1. Check if email is already taken (case-insensitive checks aren't strictly native in basic GROQ without lower(), so we query lower case)
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await sanityQuery(`*[_type == "member" && lower(email) == "${normalizedEmail}"][0]`)
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    // 2. Hash the password if provided
    const hashedPassword = password ? hashPassword(password) : undefined

    // 3. Create the document mutation
    const mutations = [
      {
        create: {
          _type: 'member',
          name,
          landlord: landlord || '',
          roadNumber,
          close: close ? parseInt(close, 10) : undefined,
          houseNumber,
          email: normalizedEmail,
          phoneNumber: phoneNumber || '',
          ...(hashedPassword ? { password: hashedPassword } : {}),
          isAdmin: false,
          isVerified: false,
        },
      },
    ]

    // 4. Save to Sanity
    await sanityMutate(mutations)

    return res.status(201).json({ message: 'Registration successful! An administrator will verify your account shortly.' })
  } catch (error: any) {
    console.error('Registration Error:', error)
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}
