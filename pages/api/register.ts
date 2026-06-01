import type { NextApiRequest, NextApiResponse } from 'next'
import { sanityQuery, sanityMutate } from '../../lib/sanity'
import { hashPassword } from '../../lib/crypto'

function getRoadCode(roadValue: string): string {
  switch (roadValue) {
    case 'Close 2 Avenue': return 'C2';
    case 'Road 1 Close 1': return 'R1';
    case 'Road 12A': return '1A';
    case 'Road 12B': return '1B';
    case 'Road 12C': return '1C';
    case 'Road 12D': return '1D';
    case 'Road 12E': return '1E';
    case 'Road 12F': return '1F';
    default:
      let num = roadValue || '';
      if (num.startsWith('Road ')) {
        num = num.replace('Road ', '');
      }
      return num.padStart(2, '0').slice(-2);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { name, landlord, roadNumber, close, houseNumber, email, phoneNumber, password } = req.body

  if (!name || !landlord || !roadNumber || !houseNumber || !email) {
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

    // 3. Generate residentId
    const membersInHouse = await sanityQuery(`count(*[_type == "member" && roadNumber == "${roadNumber}" && houseNumber == "${houseNumber}"])`)
    const count = typeof membersInHouse === 'number' ? membersInHouse : 0;
    
    const roadCode = getRoadCode(roadNumber);
    const houseNumStr = String(houseNumber).padStart(3, '0').slice(-3);
    const roleCode = landlord === 'landlord' ? 'L' : 'T';
    const serialNumStr = String(count + 1).padStart(2, '0').slice(-2);
    
    const residentId = `${roadCode}${houseNumStr}${roleCode}${serialNumStr}`;

    // 4. Create the document mutation
    const mutations = [
      {
        create: {
          _type: 'member',
          residentId,
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
