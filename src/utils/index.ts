import { PrismaClient, User } from "@prisma/client"

const db = new PrismaClient()

export const checkEmailorUsername = async (identifier: string) => {
  if (/\S+@\S+\.\S+/.test(identifier)) {
    // Identifier is an email
    return await db.user.findUnique({
      where: {
        email: identifier,
      },
    })
  } else {
    // Identifier is a username
    return await db.user.findUnique({
      where: {
        username: identifier,
      },
    })
  }
}
