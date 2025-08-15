import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * Implements singleton pattern to prevent multiple instances in development
 * Uses connection pooling and optimized configuration for production
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Utility function to handle database connection errors
 */
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * Utility function to gracefully disconnect from database
 */
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}
