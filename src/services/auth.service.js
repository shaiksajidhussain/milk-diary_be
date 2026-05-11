import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma/client.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export async function loginAdmin({ email, password }) {
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const match = await bcrypt.compare(password, admin.password)
  if (!match) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = jwt.sign(
    { sub: admin.id, email: admin.email, name: admin.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  }
}
