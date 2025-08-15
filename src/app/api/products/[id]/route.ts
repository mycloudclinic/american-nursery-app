import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Update schema (same as create but all fields optional except those that should be required)
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  
  // Pricing
  price: z.number().positive().optional(),
  salePrice: z.number().positive().optional().nullable(),
  wholesalePrice: z.number().positive().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  
  // Physical attributes
  weight: z.number().positive().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  
  // Plant-specific attributes
  plantType: z.enum(['ANNUAL', 'PERENNIAL', 'SHRUB', 'TREE', 'HOUSEPLANT', 'SUCCULENT', 'HERB', 'VEGETABLE', 'BULB', 'GRASS', 'FERN', 'VINE']).optional().nullable(),
  sunRequirement: z.enum(['FULL_SUN', 'PARTIAL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE']).optional().nullable(),
  waterRequirement: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional().nullable(),
  soilType: z.enum(['CLAY', 'SANDY', 'LOAMY', 'WELL_DRAINING', 'MOIST', 'DRY']).optional().nullable(),
  hardinessZone: z.string().optional().nullable(),
  bloomTime: z.string().optional().nullable(),
  matureSize: z.string().optional().nullable(),
  plantSpacing: z.string().optional().nullable(),
  plantDepth: z.string().optional().nullable(),
  
  // Care instructions
  careInstructions: z.string().optional().nullable(),
  plantingTips: z.string().optional().nullable(),
  
  // Product status
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK']).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  
  // SEO
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  
  // Relations
  categoryId: z.string().min(1).optional(),
});

/**
 * GET /api/products/[id]
 * Retrieve a single product with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Get product with all related data
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          include: {
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                location: true,
                condition: true,
              },
            },
            attributes: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        inventory: {
          include: {
            lifecycle: {
              select: {
                daysInYard: true,
                healthStatus: true,
                isAlive: true,
                needsAttention: true,
                markedForSale: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        relatedProducts: {
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                wholesalePrice: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
          take: 5,
        },
        speciesMappings: {
          select: {
            scientificName: true,
            commonNames: true,
            confidence: true,
          },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user can view this product
    if (!product.isActive && (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role))) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate inventory totals
    const totalQuantity = product.inventory.reduce(
      (total, inv) => total + inv.quantity,
      0
    );
    const availableQuantity = product.inventory.reduce(
      (total, inv) => total + inv.quantity - inv.reservedQuantity,
      0
    );

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

    // Get lifecycle information
    const lifecycleInfo = product.inventory
      .map(inv => inv.lifecycle)
      .filter(Boolean)[0]; // Get first lifecycle info

    // Determine appropriate pricing based on user role
    const isWholesale = session?.user?.role === 'WHOLESALE_CUSTOMER';
    const pricing = isWholesale && product.wholesalePrice
      ? {
          price: product.wholesalePrice,
          originalPrice: product.price,
          salePrice: null,
          isWholesalePrice: true,
        }
      : {
          price: product.salePrice || product.price,
          originalPrice: product.salePrice ? product.price : null,
          salePrice: product.salePrice,
          isWholesalePrice: false,
        };

    // Transform the response
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      barcode: product.barcode,
      
      // Pricing based on user role
      ...pricing,
      cost: session?.user && ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role) 
        ? product.cost 
        : undefined, // Only show cost to authorized users
      
      // Physical attributes
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
      plantSpacing: product.plantSpacing,
      plantDepth: product.plantDepth,
      
      // Care information
      careInstructions: product.careInstructions,
      plantingTips: product.plantingTips,
      
      // Status
      status: product.status,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isDigital: product.isDigital,
      requiresShipping: product.requiresShipping,
      
      // SEO
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      metaKeywords: product.metaKeywords,
      
      // Inventory information
      inventory: {
        totalQuantity,
        availableQuantity,
        isInStock: availableQuantity > 0,
        locations: product.inventory.map(inv => ({
          location: inv.location,
          quantity: inv.quantity,
          available: inv.quantity - inv.reservedQuantity,
          condition: inv.condition,
        })),
        lifecycle: lifecycleInfo,
      },
      
      // Relations
      category: product.category,
      images: product.images,
      variants: product.variants.map(variant => ({
        ...variant,
        availableQuantity: variant.inventory.reduce(
          (total, inv) => total + inv.quantity - inv.reservedQuantity,
          0
        ),
      })),
      tags: product.tags.map(t => t.tag),
      
      // Reviews and ratings
      averageRating: avgRating,
      reviewCount: product.reviews.length,
      reviews: product.reviews,
      
      // Related products
      relatedProducts: product.relatedProducts.map(rel => ({
        ...rel.relatedProduct,
        price: isWholesale && rel.relatedProduct.wholesalePrice 
          ? rel.relatedProduct.wholesalePrice 
          : rel.relatedProduct.price,
        primaryImage: rel.relatedProduct.images[0] || null,
      })),
      
      // AI plant identification
      plantIdentification: product.speciesMappings[0] || null,
      
      // Timestamps
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
    };

    return NextResponse.json({ product: transformedProduct });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (Admin/Manager only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const updateData = updateProductSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU is being updated and if it conflicts
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: updateData.sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if slug is being updated and if it conflicts
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: updateData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Verify category exists if being updated
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    // Handle publishedAt timestamp
    const publishedAt = updateData.status === 'PUBLISHED' && !existingProduct.publishedAt
      ? new Date()
      : updateData.status !== 'PUBLISHED'
      ? null
      : existingProduct.publishedAt;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        publishedAt,
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
      message: 'Product updated successfully',
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization (only admins can delete)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
        inventory: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has orders (don't allow deletion if it has order history)
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with order history. Consider archiving instead.' },
        { status: 400 }
      );
    }

    // Remove from carts first, then delete product
    await prisma.$transaction([
      // Remove from all carts
      prisma.cartItem.deleteMany({
        where: { productId: id },
      }),
      // Delete related records (cascade will handle most, but let's be explicit)
      prisma.productTag.deleteMany({
        where: { productId: id },
      }),
      prisma.productImage.deleteMany({
        where: { productId: id },
      }),
      // Delete the product (this will cascade to variants, etc.)
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
