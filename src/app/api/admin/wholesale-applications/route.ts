import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import type { UserRole, WholesaleStatus } from '@/types/auth';

/**
 * Wholesale applications management API endpoint
 * For staff to view and manage wholesale applications
 */

const wholesaleActionSchema = z.object({
  userId: z.string(),
  action: z.enum(['approve', 'reject', 'suspend', 'reactivate']),
  notes: z.string().optional(),
  wholesaleDiscount: z.number().min(0).max(100).optional(), // Percentage
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(365).optional(), // Days
  accountManagerId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = session.user.role as UserRole;
    if (!hasPermission(userRole, 'manage_wholesale_customers')) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as WholesaleStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.wholesaleStatus = status;
    } else {
      // By default, show applications that need attention
      where.wholesaleStatus = {
        in: ['APPLICATION_PENDING', 'APPROVED', 'SUSPENDED'],
      };
    }

    // Get wholesale applications
    const applications = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessName: true,
        businessType: true,
        taxId: true,
        businessLicense: true,
        businessYearsOperation: true,
        expectedMonthlyVolume: true,
        wholesaleStatus: true,
        wholesaleAppliedAt: true,
        wholesaleApprovedAt: true,
        wholesaleNotes: true,
        wholesaleDiscount: true,
        creditLimit: true,
        paymentTerms: true,
        totalSpent: true,
        createdAt: true,
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        addresses: {
          where: {
            type: 'BILLING',
          },
          select: {
            street1: true,
            street2: true,
            city: true,
            state: true,
            zipCode: true,
            company: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Last 5 orders
        },
      },
      orderBy: {
        wholesaleAppliedAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get total count
    const totalCount = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      applications: applications.map(app => ({
        ...app,
        totalSpent: Number(app.totalSpent),
        expectedMonthlyVolume: Number(app.expectedMonthlyVolume),
        wholesaleDiscount: app.wholesaleDiscount ? Number(app.wholesaleDiscount) : null,
        creditLimit: app.creditLimit ? Number(app.creditLimit) : null,
        orders: app.orders.map(order => ({
          ...order,
          total: Number(order.total),
        })),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Get wholesale applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get wholesale applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = session.user.role as UserRole;
    if (!hasPermission(userRole, 'approve_wholesale_applications')) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to approve applications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = wholesaleActionSchema.parse(body);

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        wholesaleStatus: true,
        businessName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Determine new status and role based on action
    let newStatus: WholesaleStatus;
    let newRole: UserRole = 'CUSTOMER'; // Default
    let updateData: any = {
      wholesaleNotes: validatedData.notes,
      wholesaleApprovedBy: session.user.id,
    };

    switch (validatedData.action) {
      case 'approve':
        if (targetUser.wholesaleStatus !== 'APPLICATION_PENDING' && targetUser.wholesaleStatus !== 'REJECTED') {
          return NextResponse.json(
            { success: false, message: 'Can only approve pending or rejected applications' },
            { status: 400 }
          );
        }
        newStatus = 'APPROVED';
        newRole = 'WHOLESALE_CUSTOMER';
        updateData.role = newRole;
        updateData.wholesaleApprovedAt = new Date();
        updateData.wholesaleDiscount = validatedData.wholesaleDiscount;
        updateData.creditLimit = validatedData.creditLimit;
        updateData.paymentTerms = validatedData.paymentTerms;
        updateData.accountManagerId = validatedData.accountManagerId;
        break;

      case 'reject':
        if (targetUser.wholesaleStatus !== 'APPLICATION_PENDING') {
          return NextResponse.json(
            { success: false, message: 'Can only reject pending applications' },
            { status: 400 }
          );
        }
        newStatus = 'REJECTED';
        break;

      case 'suspend':
        if (targetUser.wholesaleStatus !== 'APPROVED') {
          return NextResponse.json(
            { success: false, message: 'Can only suspend approved accounts' },
            { status: 400 }
          );
        }
        newStatus = 'SUSPENDED';
        updateData.role = 'CUSTOMER'; // Downgrade role
        break;

      case 'reactivate':
        if (targetUser.wholesaleStatus !== 'SUSPENDED') {
          return NextResponse.json(
            { success: false, message: 'Can only reactivate suspended accounts' },
            { status: 400 }
          );
        }
        newStatus = 'APPROVED';
        newRole = 'WHOLESALE_CUSTOMER';
        updateData.role = newRole;
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    updateData.wholesaleStatus = newStatus;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        wholesaleStatus: true,
        businessName: true,
      },
    });

    // TODO: Send notification email to customer
    // TODO: Create audit log entry
    // TODO: Send internal notification to account managers

    const actionMessages = {
      approve: 'Wholesale application approved successfully',
      reject: 'Wholesale application rejected',
      suspend: 'Wholesale account suspended',
      reactivate: 'Wholesale account reactivated',
    };

    return NextResponse.json({
      success: true,
      message: actionMessages[validatedData.action],
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        wholesaleStatus: updatedUser.wholesaleStatus,
        businessName: updatedUser.businessName,
      },
    });

  } catch (error) {
    console.error('Wholesale application action error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to process wholesale application' },
      { status: 500 }
    );
  }
}
