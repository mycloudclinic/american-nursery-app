import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

/**
 * User registration API endpoint
 * Handles both retail customer and wholesale application registration
 */

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.enum(['RETAILER', 'LANDSCAPER', 'CONTRACTOR', 'NURSERY', 'FARM', 'OTHER']).optional(),
  taxId: z.string().optional(),
  applyForWholesale: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Determine initial role and wholesale status
    let role: 'CUSTOMER' | 'WHOLESALE_CUSTOMER' = 'CUSTOMER';
    let wholesaleStatus: 'NOT_APPLIED' | 'APPLICATION_PENDING' = 'NOT_APPLIED';

    if (validatedData.applyForWholesale && validatedData.businessName) {
      wholesaleStatus = 'APPLICATION_PENDING';
      // Don't change role yet - they need approval first
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        name: validatedData.name,
        hashedPassword,
        role,
        phone: validatedData.phone,
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        taxId: validatedData.taxId,
        wholesaleStatus,
        loyaltyPoints: 0,
        totalSpent: 0,
        wholesaleAppliedAt: validatedData.applyForWholesale ? new Date() : null,
      },
    });

    // Remove sensitive data from response
    const { hashedPassword: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      message: validatedData.applyForWholesale 
        ? 'Account created successfully! Your wholesale application is under review.'
        : 'Account created successfully!',
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        wholesaleStatus: userResponse.wholesaleStatus,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
