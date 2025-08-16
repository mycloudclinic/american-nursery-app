import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Wholesale application API endpoint
 * Handles wholesale applications for existing customers
 */

const wholesaleApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.enum(['RETAILER', 'LANDSCAPER', 'CONTRACTOR', 'NURSERY', 'FARM', 'OTHER']),
  taxId: z.string().optional(),
  businessLicense: z.string().optional(),
  businessYearsOperation: z.number().min(0, 'Years in operation must be 0 or greater'),
  expectedMonthlyVolume: z.number().min(0, 'Expected monthly volume must be positive'),
  businessDescription: z.string().optional(),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  businessAddress: z.object({
    street1: z.string().min(5, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'Valid ZIP code is required'),
  }),
  references: z.array(z.object({
    companyName: z.string(),
    contactName: z.string(),
    phone: z.string(),
    email: z.string().email(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = wholesaleApplicationSchema.parse(body);

    // Check current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an application pending or is already wholesale
    if (user.wholesaleStatus === 'APPLICATION_PENDING') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You already have a wholesale application pending review' 
        },
        { status: 409 }
      );
    }

    if (user.wholesaleStatus === 'APPROVED') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You already have an approved wholesale account' 
        },
        { status: 409 }
      );
    }

    // Update user with wholesale application data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        taxId: validatedData.taxId,
        businessLicense: validatedData.businessLicense,
        businessYearsOperation: validatedData.businessYearsOperation,
        expectedMonthlyVolume: validatedData.expectedMonthlyVolume,
        wholesaleStatus: 'APPLICATION_PENDING',
        wholesaleAppliedAt: new Date(),
        phone: validatedData.phone, // Update phone if provided
      },
    });

    // Create business address
    await prisma.address.create({
      data: {
        userId: session.user.id,
        type: 'BILLING',
        firstName: validatedData.contactPerson.split(' ')[0] || validatedData.contactPerson,
        lastName: validatedData.contactPerson.split(' ').slice(1).join(' ') || '',
        company: validatedData.businessName,
        street1: validatedData.businessAddress.street1,
        street2: validatedData.businessAddress.street2,
        city: validatedData.businessAddress.city,
        state: validatedData.businessAddress.state,
        zipCode: validatedData.businessAddress.zipCode,
        phone: validatedData.phone,
      },
    });

    // TODO: Send notification to wholesale account managers
    // TODO: Create audit log entry
    // TODO: Send confirmation email to customer

    return NextResponse.json({
      success: true,
      message: 'Wholesale application submitted successfully! We will review your application and contact you within 2-3 business days.',
      applicationStatus: 'APPLICATION_PENDING',
    });

  } catch (error) {
    console.error('Wholesale application error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid application data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Application submission failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's current wholesale application status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        wholesaleStatus: true,
        wholesaleAppliedAt: true,
        wholesaleApprovedAt: true,
        wholesaleNotes: true,
        businessName: true,
        businessType: true,
        expectedMonthlyVolume: true,
        businessYearsOperation: true,
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        status: user.wholesaleStatus,
        appliedAt: user.wholesaleAppliedAt,
        approvedAt: user.wholesaleApprovedAt,
        notes: user.wholesaleNotes,
        businessName: user.businessName,
        businessType: user.businessType,
        expectedMonthlyVolume: user.expectedMonthlyVolume,
        businessYearsOperation: user.businessYearsOperation,
        accountManager: user.accountManager,
      },
    });

  } catch (error) {
    console.error('Get wholesale application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get application status' },
      { status: 500 }
    );
  }
}
