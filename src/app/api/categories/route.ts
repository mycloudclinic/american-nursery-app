import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating categories
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

// Query parameters schema
const querySchema = z.object({
  includeInactive: z.string().transform(val => val === 'true').default('false'),
  includeProductCount: z.string().transform(val => val === 'true').default('false'),
  parentId: z.string().optional(),
  level: z.enum(['top', 'all']).default('all'),
});

/**
 * GET /api/categories
 * Retrieve categories with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { includeInactive, includeProductCount, parentId, level } = querySchema.parse(queryParams);

    // Build where clause
    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    if (level === 'top') {
      where.parentId = null;
    } else if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // Base category query
    const categoryQuery = {
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: includeInactive ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' as const },
        },
        ...(includeProductCount && {
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                  status: 'PUBLISHED' as const,
                },
              },
            },
          },
        }),
      },
      orderBy: { sortOrder: 'asc' as const },
    };

    const categories = await prisma.category.findMany(categoryQuery);

    // Transform the response
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      parent: category.parent,
      children: category.children,
      ...(includeProductCount && {
        productCount: (category as any)._count?.products || 0,
      }),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json({
      categories: transformedCategories,
      meta: {
        total: transformedCategories.length,
        level,
        includeInactive,
        includeProductCount,
      },
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (Admin/Manager only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const categoryData = createCategorySchema.parse(body);

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Verify parent category exists if provided
    if (categoryData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: categoryData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: categoryData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid category data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
