import { defineField, defineType } from 'sanity'

// Define the maximum allowed house number for each road
// Currently: 20 for all roads, with customizable limits for Road 2 and Road 12
const ROAD_HOUSE_LIMITS: Record<string, number> = {
  '1': 20,
  '2': 50,  // Define custom limit for Road 2 here (e.g. 50)
  '3': 20,
  '4': 20,
  '5': 20,
  '6': 20,
  '7': 20,
  '8': 20,
  '9': 20,
  '10': 20,
  '11': 20,
  '12': 50, // Define custom limit for Road 12 here (e.g. 50)
}

export const memberType = defineType({
  name: 'member',
  title: 'Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'landlord',
      title: 'Landlord',
      type: 'string',
      description: 'The name of the landlord (if applicable)',
    }),
    defineField({
      name: 'roadNumber',
      title: 'Road Number',
      type: 'string',
      options: {
        list: Array.from({ length: 12 }, (_, i) => {
          const num = String(i + 1)
          return { title: `Road ${num}`, value: num }
        }),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'close',
      title: 'Close',
      type: 'number',
      description: 'The Close',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'houseNumber',
      title: 'House Number',
      type: 'string',
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const road = context.document?.roadNumber as string | undefined
          if (!road) {
            return 'Please select a Road Number first'
          }

          const houseNum = parseInt(value || '', 10)
          if (isNaN(houseNum) || houseNum <= 0) {
            return 'House number must be a positive integer'
          }

          const limit = ROAD_HOUSE_LIMITS[road]
          if (limit && houseNum > limit) {
            return `House number cannot be greater than ${limit} for Road ${road}`
          }

          return true
        }),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'password',
      title: 'Password (Hashed)',
      type: 'string',
      description: 'The hashed credential password (only required for admin access)',
    }),
    defineField({
      name: 'isAdmin',
      title: 'Is Admin',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isVerified',
      title: 'Is Verified',
      type: 'boolean',
      initialValue: false,
      description: 'Whether the member has been verified by an admin',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
    },
  },
})
