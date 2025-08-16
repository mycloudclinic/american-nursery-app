import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

/**
 * NextAuth.js configuration with role-based access control
 * Supports both credential-based auth and OAuth providers
 * Implements custom role management for garden center users
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Credentials provider for email/password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        try {
          // Find user by email with all necessary fields
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              accountManager: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });

          if (!user || !user.hashedPassword) {
            throw new Error('Invalid credentials');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account has been deactivated');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            businessName: user.businessName,
            businessType: user.businessType,
            wholesaleStatus: user.wholesaleStatus,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: Number(user.totalSpent),
            accountManagerId: user.accountManagerId,
            department: user.department,
            permissions: user.permissions,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.businessName = user.businessName;
        token.businessType = user.businessType;
        token.wholesaleStatus = user.wholesaleStatus;
        token.loyaltyPoints = user.loyaltyPoints;
        token.totalSpent = user.totalSpent;
        token.accountManagerId = user.accountManagerId;
        token.department = user.department;
        token.permissions = user.permissions;
        token.userId = user.id;
      }

      // For OAuth providers, get user data from database
      if (account && account.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: {
            accountManager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.businessName = dbUser.businessName;
          token.businessType = dbUser.businessType;
          token.wholesaleStatus = dbUser.wholesaleStatus;
          token.loyaltyPoints = dbUser.loyaltyPoints;
          token.totalSpent = Number(dbUser.totalSpent);
          token.accountManagerId = dbUser.accountManagerId;
          token.department = dbUser.department;
          token.permissions = dbUser.permissions;
          token.userId = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as any;
        session.user.businessName = token.businessName as string;
        session.user.businessType = token.businessType as any;
        session.user.wholesaleStatus = token.wholesaleStatus as any;
        session.user.loyaltyPoints = token.loyaltyPoints as number;
        session.user.totalSpent = token.totalSpent as number;
        session.user.accountManagerId = token.accountManagerId as string;
        session.user.department = token.department as string;
        session.user.permissions = token.permissions as any;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Allow credentials provider sign in
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle OAuth providers
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create them with default customer role
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'CUSTOMER',
                emailVerified: new Date(),
                wholesaleStatus: 'NOT_APPLIED',
                loyaltyPoints: 0,
                totalSpent: 0,
              },
            });
          }

          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign ins
      console.log(`User ${user.email} signed in via ${account?.provider}`);
      
      if (isNewUser) {
        console.log(`New user created: ${user.email}`);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
