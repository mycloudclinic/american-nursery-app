import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating inventory items
const createInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.number().int().min(0).default(10),
  reorderQuantity: z.number().int().min(1).default(50),
  location: z.string().optional(),
  zone: z.string().optional(),
  supplierId: z.string().optional(),
  supplierSku: z.string().optional(),
  unitCost: z.number().positive().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED', 'EXPIRED']).default('EXCELLENT'),
  expirationDate: z.string().datetime().optional(),
  lotNumber: z.string().optional(),
  notes: z.string().optional(),
  
  // Plant lifecycle data
  lifecycle: z.object({
    healthStatus: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL', 'NEEDS_ATTENTION']).default('EXCELLENT'),
    alertThreshold: z.number().int().min(1).default(90),
    careNotes: z.string().optional(),
  }).optional(),
});

// Update schema
const updateInventorySchema = createInventorySchema.partial();

// Query parameters schema
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  location: z.string().optional(),
  zone: z.string().optional(),
  condition: z.string().optional(),
  supplierId: z.string().optional(),
  lowStock: z.string().transform(val => val === 'true').optional(),
  needsAttention: z.string().transform(val => val === 'true').optional(),
  plantType: z.string().optional(),
  daysInYardMin: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  daysInYardMax: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  healthStatus: z.string().optional(),
  sortBy: z.enum(['createdAt', 'quantity', 'daysInYard', 'healthStatus', 'location']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/inventory
 * Retrieve inventory items with filtering and plant lifecycle information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization - inventory access requires staff role
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const {
      page,
      limit,
      location,
      zone,
      condition,
      supplierId,
      lowStock,
      needsAttention,
      plantType,
      daysInYardMin,
      daysInYardMax,
      healthStatus,
      sortBy,
      sortOrder,
    } = querySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (zone) where.zone = zone;
    if (condition) where.condition = condition;
    if (supplierId) where.supplierId = supplierId;

    // Low stock filter
    if (lowStock) {
      where.OR = [
        {
          quantity: {
            lte: prisma.inventoryItem.fields.reorderLevel,
          },
        },
      ];
    }

    // Plant-specific filters
    if (plantType) {
      where.product = {
        plantType: plantType,
      };
    }

    if (needsAttention) {
      where.lifecycle = {
        needsAttention: true,
      };
    }

    if (healthStatus) {
      where.lifecycle = {
        ...where.lifecycle,
        healthStatus: healthStatus,
      };
    }

    // Days in yard filter
    if (daysInYardMin !== undefined || daysInYardMax !== undefined) {
      where.lifecycle = {
        ...where.lifecycle,
        daysInYard: {},
      };
      if (daysInYardMin !== undefined) where.lifecycle.daysInYard.gte = daysInYardMin;
      if (daysInYardMax !== undefined) where.lifecycle.daysInYard.lte = daysInYardMax;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Determine sort field
    let orderBy: any = {};
    if (sortBy === 'daysInYard' || sortBy === 'healthStatus') {
      orderBy = {
        lifecycle: {
          [sortBy]: sortOrder,
        },
      };
    } else {
      orderBy = {
        [sortBy]: sortOrder,
      };
    }

    // Get inventory items with relations
    const [inventoryItems, totalCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              plantType: true,
              price: true,
              wholesalePrice: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          lifecycle: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
          movements: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              quantity: true,
              reason: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    // Transform the response
    const transformedItems = inventoryItems.map(item => {
      const availableQuantity = item.quantity - item.reservedQuantity;
      const isLowStock = item.quantity <= item.reorderLevel;
      
      // Calculate days in yard from lifecycle or creation date
      const daysInYard = item.lifecycle?.daysInYard || 
        Math.floor((new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: item.id,
        quantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        availableQuantity,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        isLowStock,
        location: item.location,
        zone: item.zone,
        condition: item.condition,
        unitCost: item.unitCost,
        totalValue: item.totalValue,
        expirationDate: item.expirationDate,
        lotNumber: item.lotNumber,
        notes: item.notes,
        
        // Plant lifecycle information
        lifecycle: item.lifecycle ? {
          daysInYard: item.lifecycle.daysInYard,
          healthStatus: item.lifecycle.healthStatus,
          isAlive: item.lifecycle.isAlive,
          needsAttention: item.lifecycle.needsAttention,
          markedForSale: item.lifecycle.markedForSale,
          lastInspection: item.lifecycle.lastInspection,
          nextInspection: item.lifecycle.nextInspection,
          lastWatered: item.lifecycle.lastWatered,
          lastFertilized: item.lifecycle.lastFertilized,
          careNotes: item.lifecycle.careNotes,
          alertThreshold: item.lifecycle.alertThreshold,
        } : {
          daysInYard,
          healthStatus: 'EXCELLENT',
          isAlive: true,
          needsAttention: false,
          markedForSale: false,
        },
        
        // Relations
        product: item.product,
        variant: item.variant,
        supplier: item.supplier,
        manager: item.manager,
        recentMovements: item.movements,
        
        // Timestamps
        lastRestockedAt: item.lastRestockedAt,
        nextRestockDate: item.nextRestockDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    // Calculate summary statistics
    const totalValue = inventoryItems.reduce(
      (sum, item) => sum + (item.totalValue ? Number(item.totalValue) : 0),
      0
    );

    const lowStockCount = transformedItems.filter(item => item.isLowStock).length;
    const needsAttentionCount = transformedItems.filter(
      item => item.lifecycle.needsAttention
    ).length;

    return NextResponse.json({
      inventoryItems: transformedItems,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
      summary: {
        totalItems: totalCount,
        totalValue,
        lowStockCount,
        needsAttentionCount,
      },
      filters: {
        location,
        zone,
        condition,
        supplierId,
        lowStock,
        needsAttention,
        plantType,
        daysInYardRange: { min: daysInYardMin, max: daysInYardMax },
        healthStatus,
      },
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory
 * Create a new inventory item (Inventory Manager/Admin only)
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
    const inventoryData = createInventorySchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: inventoryData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 400 }
      );
    }

    // Verify variant exists if provided
    if (inventoryData.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: inventoryData.variantId },
      });

      if (!variant || variant.productId !== inventoryData.productId) {
        return NextResponse.json(
          { error: 'Product variant not found or does not belong to this product' },
          { status: 400 }
        );
      }
    }

    // Verify supplier exists if provided
    if (inventoryData.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: inventoryData.supplierId },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 400 }
        );
      }
    }

    // Check if inventory item already exists for this product/variant combination
    const existingInventory = await prisma.inventoryItem.findFirst({
      where: {
        productId: inventoryData.productId,
        variantId: inventoryData.variantId ?? null,
      },
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: 'Inventory item already exists for this product/variant combination' },
        { status: 400 }
      );
    }

    // Calculate total value
    const totalValue = inventoryData.unitCost 
      ? inventoryData.unitCost * inventoryData.quantity 
      : null;

    // Create inventory item and lifecycle in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create inventory item
      const inventoryItem = await tx.inventoryItem.create({
        data: {
          ...inventoryData,
          lifecycle: undefined, // Remove lifecycle from main data
          totalValue,
          managerId: session.user.id,
          lastRestockedAt: new Date(),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              plantType: true,
            },
          },
        },
      });

      // Create plant lifecycle if it's a plant
      if (product.plantType && inventoryData.lifecycle) {
        await tx.plantLifecycle.create({
          data: {
            inventoryItemId: inventoryItem.id,
            ...inventoryData.lifecycle,
            daysInYard: 0, // Starts at 0
            receivedDate: new Date(),
          },
        });
      }

      // Create inventory movement record
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type: 'IN',
          quantity: inventoryData.quantity,
          reason: 'Initial stock',
          createdById: session.user.id,
        },
      });

      return inventoryItem;
    });

    return NextResponse.json({
      message: 'Inventory item created successfully',
      inventoryItem: result,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid inventory data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
