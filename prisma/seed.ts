import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skyzone.com' },
    update: {},
    create: {
      email: 'admin@skyzone.com',
      name: 'Sky Zone Admin',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 98765 43210'
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create card designs
  const cardDesigns = [
    {
      name: 'Student ID Card',
      description: 'Professional student identification card with photo and details',
      price: 149,
      imageUrl: '/cards/student-id.jpg',
      isActive: true,
      category: 'Student'
    },
    {
      name: 'Corporate ID Card',
      description: 'Premium corporate identity card for employees',
      price: 249,
      imageUrl: '/cards/corporate-id.jpg',
      isActive: true,
      category: 'Corporate'
    },
    {
      name: 'Event Pass Card',
      description: 'Durable event pass with custom design',
      price: 199,
      imageUrl: '/cards/event-pass.jpg',
      isActive: true,
      category: 'Event'
    },
    {
      name: 'Visitor ID Card',
      description: 'Temporary visitor identification with photo',
      price: 99,
      imageUrl: '/cards/visitor-id.jpg',
      isActive: true,
      category: 'Event'
    },
    {
      name: 'Staff ID Card',
      description: 'Professional staff badge with QR code',
      price: 179,
      imageUrl: '/cards/staff-id.jpg',
      isActive: true,
      category: 'Corporate'
    },
    {
      name: 'Conference Badge',
      description: 'Premium conference attendee badge',
      price: 299,
      imageUrl: '/cards/conference-badge.jpg',
      isActive: true,
      category: 'Event'
    }
  ]

  for (const design of cardDesigns) {
    const existing = await prisma.cardDesign.findFirst({
      where: { name: design.name }
    })

    if (!existing) {
      await prisma.cardDesign.create({
        data: design
      })
      console.log(`  Created: ${design.name}`)
    } else {
      console.log(`  Skipped (exists): ${design.name}`)
    }
  }

  console.log(`✅ Card designs ready`)

  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Admin Credentials:')
  console.log('  Email: admin@skyzone.com')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
