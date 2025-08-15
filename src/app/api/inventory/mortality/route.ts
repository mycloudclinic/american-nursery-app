import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for logging mortality
const mortalityLogSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  reason: z.enum([
    'NATURAL_AGING',
    'OVERWATERING',
    'UNDERWATERING', 
    'DISEASE',
    'PEST_DAMAGE',
    'FROST_DAMAGE',
    'HEAT_STRESS',
    'TRANSPLANT_SHOCK',
    'NUTRIENT_DEFICIENCY',
    'ROOT_ROT',
    'FUNGAL_INFECTION',
    'BACTERIAL_INFECTION',
    'VIRAL_INFECTION',
    'PHYSICAL_DAMAGE',
    'POOR_SOIL_CONDITIONS',
    'IMPROPER_LIGHTING',
    'CHEMICAL_BURN',
    'CUSTOMER_DAMAGE',
    'THEFT',
    'OTHER'
  ]),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
  weatherConditions: z.string().optional(),
  season: z.enum(['Spring', 'Summer', 'Fall', 'Winter']).optional(),
});

// Query schema for mortality reports
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  reason: z.string().optional(),
  productId: z.string().optional(),
  supplierId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  season: z.string().optional(),
  minLoss: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxLoss: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  sortBy: z.enum(['deathDate', 'totalLoss', 'quantity', 'daysInInventory']).default('deathDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/inventory/mortality
 * Retrieve mortality logs with analysis
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role)) {
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
      reason,
      productId,
      supplierId,
      dateFrom,
      dateTo,
      season,
      minLoss,
      maxLoss,
      sortBy,
      sortOrder,
    } = querySchema.parse(queryParams);

    // Build where clause
    const where: any = {};

    if (reason) where.reason = reason;
    if (productId) where.productId = productId;
    if (season) where.season = season;

    // Date range filter
    if (dateFrom || dateTo) {
      where.deathDate = {};
      if (dateFrom) where.deathDate.gte = new Date(dateFrom);
      if (dateTo) where.deathDate.lte = new Date(dateTo);
    }

    // Financial loss filter
    if (minLoss !== undefined || maxLoss !== undefined) {
      where.totalLoss = {};
      if (minLoss !== undefined) where.totalLoss.gte = minLoss;
      if (maxLoss !== undefined) where.totalLoss.lte = maxLoss;
    }

    // Supplier filter (through inventory item)
    if (supplierId) {
      where.inventoryItem = {
        supplierId: supplierId,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get mortality logs with relations
    const [mortalityLogs, totalCount] = await Promise.all([
      prisma.mortalityLog.findMany({
        where,
        include: {
          inventoryItem: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              plantType: true,
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
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.mortalityLog.count({ where }),
    ]);

    // Calculate summary statistics
    const summaryStats = await prisma.mortalityLog.aggregate({
      where,
      _sum: {
        quantity: true,
        totalLoss: true,
      },
      _avg: {
        daysInInventory: true,
        totalLoss: true,
      },
    });

    // Get mortality by reason breakdown
    const mortalityByReason = await prisma.mortalityLog.groupBy({
      by: ['reason'],
      where,
      _sum: {
        quantity: true,
        totalLoss: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalLoss: 'desc',
        },
      },
    });

    // Get mortality by plant type
    const mortalityByPlantType = await prisma.mortalityLog.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
        totalLoss: true,
      },
      take: 10,
      orderBy: {
        _sum: {
          totalLoss: 'desc',
        },
      },
    });

    // Get mortality by season if available
    const mortalityBySeason = await prisma.mortalityLog.groupBy({
      by: ['season'],
      where: {
        ...where,
        season: { not: null },
      },
      _sum: {
        quantity: true,
        totalLoss: true,
      },
      _count: {
        id: true,
      },
    });

    // Transform the response
    const transformedLogs = mortalityLogs.map(log => ({
      id: log.id,
      deathDate: log.deathDate,
      reason: log.reason,
      quantity: log.quantity,
      unitCost: log.unitCost,
      totalLoss: log.totalLoss,
      daysInInventory: log.daysInInventory,
      season: log.season,
      weatherConditions: log.weatherConditions,
      notes: log.notes,
      reportedBy: log.reportedBy,
      location: log.location,
      
      // Relations
      product: log.product,
      variant: log.variant,
      inventoryItem: {
        id: log.inventoryItem.id,
        location: log.inventoryItem.location,
        supplier: log.inventoryItem.supplier,
      },
      
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      mortalityLogs: transformedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
      summary: {
        totalDeaths: summaryStats._sum.quantity || 0,
        totalFinancialLoss: summaryStats._sum.totalLoss || 0,
        averageDaysInInventory: summaryStats._avg.daysInInventory || 0,
        averageLossPerIncident: summaryStats._avg.totalLoss || 0,
      },
      analytics: {
        byReason: mortalityByReason.map(item => ({
          reason: item.reason,
          incidents: item._count.id,
          totalQuantity: item._sum.quantity,
          totalLoss: item._sum.totalLoss,
        })),
        bySeason: mortalityBySeason.map(item => ({
          season: item.season,
          incidents: item._count.id,
          totalQuantity: item._sum.quantity,
          totalLoss: item._sum.totalLoss,
        })),
        topLossProducts: mortalityByPlantType.slice(0, 5),
      },
    });

  } catch (error) {
    console.error('Error fetching mortality logs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch mortality logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/mortality
 * Log plant mortality (Staff/Manager only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const mortalityData = mortalityLogSchema.parse(body);

    // Get inventory item with product details
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: mortalityData.inventoryItemId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            plantType: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
          },
        },
        lifecycle: true,
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if quantity to remove is available
    if (mortalityData.quantity > inventoryItem.quantity) {
      return NextResponse.json(
        { error: 'Cannot log mortality for more items than available in inventory' },
        { status: 400 }
      );
    }

    // Calculate financial impact
    const unitCost = inventoryItem.unitCost ? Number(inventoryItem.unitCost) : 0;
    const totalLoss = unitCost * mortalityData.quantity;

    // Calculate days in inventory
    const daysInInventory = inventoryItem.lifecycle?.daysInYard ||
      Math.floor((new Date().getTime() - inventoryItem.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Determine season if not provided
    const currentMonth = new Date().getMonth();
    let season = mortalityData.season;
    if (!season) {
      if (currentMonth >= 2 && currentMonth <= 4) season = 'Spring';
      else if (currentMonth >= 5 && currentMonth <= 7) season = 'Summer';
      else if (currentMonth >= 8 && currentMonth <= 10) season = 'Fall';
      else season = 'Winter';
    }

    // Create mortality log and update inventory in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create mortality log
      const mortalityLog = await tx.mortalityLog.create({
        data: {
          ...mortalityData,
          productId: inventoryItem.productId,
          variantId: inventoryItem.variantId,
          unitCost,
          totalLoss,
          daysInInventory,
          season,
          location: inventoryItem.location,
          reportedBy: session.user.id,
        },
      });

      // Update inventory quantity
      await tx.inventoryItem.update({
        where: { id: mortalityData.inventoryItemId },
        data: {
          quantity: {
            decrement: mortalityData.quantity,
          },
          totalValue: inventoryItem.unitCost 
            ? (inventoryItem.quantity - mortalityData.quantity) * Number(inventoryItem.unitCost)
            : inventoryItem.totalValue,
        },
      });

      // Update plant lifecycle if it exists
      if (inventoryItem.lifecycle) {
        await tx.plantLifecycle.update({
          where: { inventoryItemId: mortalityData.inventoryItemId },
          data: {
            isAlive: inventoryItem.quantity - mortalityData.quantity > 0,
            deathDate: inventoryItem.quantity - mortalityData.quantity === 0 ? new Date() : null,
            deathReason: inventoryItem.quantity - mortalityData.quantity === 0 ? mortalityData.reason : null,
            mortalityNotes: mortalityData.notes,
          },
        });
      }

      // Create inventory movement record
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: mortalityData.inventoryItemId,
          type: 'OUT',
          quantity: mortalityData.quantity,
          reason: `Mortality: ${mortalityData.reason}`,
          notes: mortalityData.notes,
          createdById: session.user.id,
        },
      });

      return mortalityLog;
    });

    return NextResponse.json({
      message: 'Mortality logged successfully',
      mortalityLog: {
        ...result,
        product: inventoryItem.product,
        variant: inventoryItem.variant,
      },
      impact: {
        quantityRemoved: mortalityData.quantity,
        financialLoss: totalLoss,
        remainingQuantity: inventoryItem.quantity - mortalityData.quantity,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error logging mortality:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid mortality data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to log mortality' },
      { status: 500 }
    );
  }
}
