import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Lazy singleton — create on first use to avoid blocking server startup
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: 'libsql://clipo-nustech.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIxMzk2NTMsImlkIjoiMDE5ZWVmY2MtZGUwMS03MzhiLTk4YTAtMmQ1MmZhZGU5MzFkIiwicmlkIjoiNWEyYTUyZTktYzNkYS00YTZjLTg5ZDctN2IwNDBmZGNhNzU2In0.6fCSQP6u3Oad1M76WNQkTGYAJY9epTUQa78_0PJnIyfKA7FmQpPI2YKI5754VUUOl5JvWmwESSo1B9z9BDKQBg',
  })

  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())