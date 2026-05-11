import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)

  await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: passwordHash, name: 'System Admin' },
    create: {
      email: 'admin@gmail.com',
      name: 'System Admin',
      password: passwordHash,
    },
  })

  const farmersData = [
    { name: 'Ramesh Patil', mobile: '+919876543210', village: 'Khedgaon' },
    { name: 'Sunita Kulkarni', mobile: '+919123456789', village: 'Malkapur' },
    { name: 'Vikram Jadhav', mobile: '+919988776655', village: 'Shirur' },
  ]

  let seq = 1001
  for (const f of farmersData) {
    const farmerCode = `FR-${seq}`
    const qrCode = `FARMER-${seq}`
    const existing = await prisma.farmer.findFirst({ where: { farmerCode } })
    if (!existing) {
      await prisma.farmer.create({
        data: {
          farmerCode,
          qrCode,
          name: f.name,
          mobile: f.mobile,
          village: f.village,
          status: 'active',
        },
      })
    }
    seq += 1
  }

  console.log('Seed completed: admin@gmail.com / admin123 + sample farmers')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
