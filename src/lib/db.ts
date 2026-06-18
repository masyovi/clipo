import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Lazy singleton — create on first use to avoid blocking server startup
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: 'libsql://short-vercel-icfg-hhavkgzx9ptxjevhtapmjv5p.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODE3NzIzNzksImlkIjoiMDE5ZWQ5ZTgtZTAwMS03NGI4LTk0NmItMmE3NWI5ZTVmNGIzIiwicmlkIjoiYmExMzY2NjctNzgwYS00ZDA5LWFlNDEtZDc4YWEyMjM4OWUzIn0.DOD_MJfZBhSzYc_OMZ1kJwQ0XBQH_ZSPLdAJ4wDa_Ltl9mWuufCcdyauhe7dH7qPuTSvh1pCid2PblA0g3hmCw',
  })

  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())