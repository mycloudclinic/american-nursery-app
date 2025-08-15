import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating products
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  
  // Pricing
  price: z.number().positive('Price must be positive'),
  salePrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  
  // Physical attributes
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  
  // Plant-specific attributes
  plantType: z.enum(['ANNUAL', 'PERENNIAL', 'SHRUB', 'TREE', 'HOUSEPLANT', 'SUCCULENT', 'HERB', 'VEGETABLE', 'BULB', 'GRASS', 'FERN', 'VINE']).optional(),
  sunRequirement: z.enum(['FULL_SUN', 'PARTIAL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE']).optional(),
  waterRequirement: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional(),
  soilType: z.enum(['CLAY', 'SANDY', 'LOAMY', 'WELL_DRAINING', 'MOIST', 'DRY']).optional(),
  hardinessZone: z.string().optional(),
  bloomTime: z.string().optional(),
  matureSize: z.string().optional(),
  plantSpacing: z.string().optional(),
  plantDepth: z.string().optional(),
  
  // Care instructions
  careInstructions: z.string().optional(),
  plantingTips: z.string().optional(),
  
  // Product status
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK']).default('DRAFT'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  
  // Relations
  categoryId: z.string().min(1, 'Category is required'),
});

// Query parameters schema for filtering products
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  category: z.string().optional(),
  plantType: z.string().optional(),
  sunRequirement: z.string().optional(),
  waterRequirement: z.string().optional(),
  soilType: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  priceMin: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  priceMax: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/products
 * Retrieve products with filtering, pagination, and role-based pricing
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries());
    const {
      page,
      limit,
      category,
      plantType,
      sunRequirement,
      waterRequirement,
      soilType,
      search,
      status,
      featured,
      priceMin,
      priceMax,
      sortBy,
      sortOrder,
    } = querySchema.parse(queryParams);

    // Build where clause for filtering
    const where: any = {
      isActive: true,
    };

    // Add filters
    if (category) where.categoryId = category;
    if (plantType) where.plantType = plantType;
    if (sunRequirement) where.sunRequirement = sunRequirement;
    if (waterRequirement) where.waterRequirement = waterRequirement;
    if (soilType) where.soilType = soilType;
    if (status) where.status = status;
    if (featured !== undefined) where.isFeatured = featured;
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price filtering (use appropriate price based on user role)
    const isWholesale = session?.user?.role === 'WHOLESALE_CUSTOMER';
    const priceField = isWholesale ? 'wholesalePrice' : 'price';
    
    if (priceMin !== undefined || priceMax !== undefined) {
      where[priceField] = {};
      if (priceMin !== undefined) where[priceField].gte = priceMin;
      if (priceMax !== undefined) where[priceField].lte = priceMax;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with relations
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            where: { isActive: true },
            include: {
              inventory: {
                select: {
                  quantity: true,
                  reservedQuantity: true,
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
          inventory: {
            select: {
              quantity: true,
              reservedQuantity: true,
              location: true,
            },
          },
          tags: {
            select: {
              tag: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform products for response (handle pricing based on user role)
    const transformedProducts = products.map(product => {
      const availableQuantity = product.inventory.reduce(
        (total, inv) => total + inv.quantity - inv.reservedQuantity,
        0
      );

      // Calculate average rating
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : null;

      // Return appropriate pricing based on user role
      const pricing = isWholesale && product.wholesalePrice
        ? {
            price: product.wholesalePrice,
            originalPrice: product.price,
            isWholesalePrice: true,
          }
        : {
            price: product.salePrice || product.price,
            originalPrice: product.salePrice ? product.price : null,
            isWholesalePrice: false,
          };

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        sku: product.sku,
        ...pricing,
        weight: product.weight,
        dimensions: product.dimensions,
        
        // Plant attributes
        plantType: product.plantType,
        sunRequirement: product.sunRequirement,
        waterRequirement: product.waterRequirement,
        soilType: product.soilType,
        hardinessZone: product.hardinessZone,
        bloomTime: product.bloomTime,
        matureSize: product.matureSize,
        
        // Status
        status: product.status,
        isFeatured: product.isFeatured,
        requiresShipping: product.requiresShipping,
        
        // Relations
        category: product.category,
        primaryImage: product.images[0] || null,
        variantCount: product.variants.length,
        availableQuantity,
        tags: product.tags.map(t => t.tag),
        averageRating: avgRating,
        reviewCount: product.reviews.length,
        
        // Timestamps
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        publishedAt: product.publishedAt,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        category,
        plantType,
        sunRequirement,
        waterRequirement,
        soilType,
        search,
        status,
        featured,
        priceRange: { min: priceMin, max: priceMax },
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product (Admin/Manager only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productData = createProductSchema.parse(body);

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        publishedAt: productData.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
