import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for plant identification
const identifyPlantSchema = z.object({
  imageUrl: z.string().url('Valid image URL is required'),
  location: z.string().optional(), // Where in garden center
});

// Mock Plant.id API response type (replace with actual API integration)
interface PlantIdResponse {
  suggestions: Array<{
    species: {
      scientificNameWithoutAuthor: string;
      commonNames: string[];
    };
    probability: number;
  }>;
}

/**
 * Mock Plant.id API call (replace with actual integration)
 */
async function identifyPlantWithAI(imageUrl: string): Promise<PlantIdResponse> {
  // This is a mock implementation - replace with actual Plant.id API call
  // Example using Plant.id API:
  /*
  const response = await fetch('https://api.plant.id/v3/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': process.env.PLANT_ID_API_KEY!,
    },
    body: JSON.stringify({
      images: [imageUrl],
      modifiers: ["crops_fast", "similar_images", "health_only", "disease_only"],
      plant_language: "en",
      plant_details: ["common_names", "url", "description", "taxonomy", "rank", "gbif_id"],
    }),
  });

  if (!response.ok) {
    throw new Error('Plant identification failed');
  }

  return response.json();
  */

  // Mock response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        suggestions: [
          {
            species: {
              scientificNameWithoutAuthor: "Ficus lyrata",
              commonNames: ["Fiddle Leaf Fig", "Banjo Fig"]
            },
            probability: 0.95
          },
          {
            species: {
              scientificNameWithoutAuthor: "Ficus benjamina",
              commonNames: ["Weeping Fig", "Benjamin Fig"]
            },
            probability: 0.78
          }
        ]
      });
    }, 1500); // Simulate API delay
  });
}

/**
 * POST /api/plant-recognition
 * Identify a plant from an image and map to inventory
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { imageUrl, location } = identifyPlantSchema.parse(body);

    // Call plant identification AI service
    const aiResult = await identifyPlantWithAI(imageUrl);

    if (!aiResult.suggestions || aiResult.suggestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No plant species identified',
        suggestions: [],
      });
    }

    // Get the best suggestion
    const topSuggestion = aiResult.suggestions[0];
    const scientificName = topSuggestion.species.scientificNameWithoutAuthor;
    const commonNames = topSuggestion.species.commonNames;
    const confidence = topSuggestion.probability;

    // Find existing mapping or create new identification record
    let mappedProducts: any[] = [];
    
    // Check if we have existing species mapping
    const existingMapping = await prisma.plantSpeciesMapping.findFirst({
      where: {
        scientificName: scientificName,
        isActive: true,
      },
      include: {
        product: {
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
            },
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                location: true,
              },
            },
          },
        },
        variant: {
          include: {
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (existingMapping) {
      // Calculate availability
      const availableQuantity = existingMapping.product.inventory.reduce(
        (total, inv) => total + inv.quantity - inv.reservedQuantity,
        0
      );

      // Determine pricing based on user role
      const isWholesale = session?.user?.role === 'WHOLESALE_CUSTOMER';
      const price = isWholesale && existingMapping.product.wholesalePrice
        ? existingMapping.product.wholesalePrice
        : existingMapping.product.salePrice || existingMapping.product.price;

      mappedProducts = [{
        id: existingMapping.product.id,
        name: existingMapping.product.name,
        slug: existingMapping.product.slug,
        price,
        isWholesalePrice: isWholesale && !!existingMapping.product.wholesalePrice,
        category: existingMapping.product.category,
        primaryImage: existingMapping.product.images[0] || null,
        availableQuantity,
        isInStock: availableQuantity > 0,
        plantType: existingMapping.product.plantType,
        mappingConfidence: existingMapping.confidence,
        variant: existingMapping.variant ? {
          id: existingMapping.variant.id,
          name: existingMapping.variant.name,
          availableQuantity: existingMapping.variant.inventory.reduce(
            (total, inv) => total + inv.quantity - inv.reservedQuantity,
            0
          ),
        } : null,
      }];

      // Update mapping usage statistics
      await prisma.plantSpeciesMapping.update({
        where: { id: existingMapping.id },
        data: {
          identificationCount: {
            increment: 1,
          },
        },
      });
    } else {
      // Try to find similar products by searching common names or scientific name
      const searchTerms = [scientificName, ...commonNames];
      
      for (const term of searchTerms) {
        const similarProducts = await prisma.product.findMany({
          where: {
            AND: [
              { isActive: true },
              { status: 'PUBLISHED' },
              {
                OR: [
                  { name: { contains: term, mode: 'insensitive' } },
                  { description: { contains: term, mode: 'insensitive' } },
                ],
              },
            ],
          },
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
            },
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
                location: true,
              },
            },
          },
          take: 3,
        });

        if (similarProducts.length > 0) {
          const isWholesale = session?.user?.role === 'WHOLESALE_CUSTOMER';
          
          mappedProducts = similarProducts.map(product => {
            const availableQuantity = product.inventory.reduce(
              (total, inv) => total + inv.quantity - inv.reservedQuantity,
              0
            );

            const price = isWholesale && product.wholesalePrice
              ? product.wholesalePrice
              : product.salePrice || product.price;

            return {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price,
              isWholesalePrice: isWholesale && !!product.wholesalePrice,
              category: product.category,
              primaryImage: product.images[0] || null,
              availableQuantity,
              isInStock: availableQuantity > 0,
              plantType: product.plantType,
              mappingConfidence: 0.6, // Lower confidence for text-based matching
              variant: null,
            };
          });
          break;
        }
      }
    }

    // Store the identification record
    const identificationRecord = await prisma.plantIdentification.create({
      data: {
        imageUrl,
        identifiedSpecies: scientificName,
        commonName: commonNames[0] || null,
        confidence,
        alternativeResults: {
          suggestions: aiResult.suggestions.slice(1), // Store alternative results
        },
        identifiedBy: session?.user?.id || null,
        location,
        mappedProductId: mappedProducts[0]?.id || null,
        mappedVariantId: mappedProducts[0]?.variant?.id || null,
        mappingConfidence: mappedProducts[0]?.mappingConfidence || null,
      },
    });

    // Prepare response with plant information
    const plantInfo = {
      identification: {
        scientificName,
        commonNames,
        confidence,
        id: identificationRecord.id,
      },
      alternativeResults: aiResult.suggestions.slice(1).map(suggestion => ({
        scientificName: suggestion.species.scientificNameWithoutAuthor,
        commonNames: suggestion.species.commonNames,
        confidence: suggestion.probability,
      })),
      mappedProducts,
      recommendations: {
        hasExactMatch: !!existingMapping,
        hasStockAvailable: mappedProducts.some(p => p.isInStock),
        canPurchase: mappedProducts.length > 0 && session?.user,
        suggestedActions: [] as string[],
      },
    };

    // Add suggested actions
    if (mappedProducts.length === 0) {
      plantInfo.recommendations.suggestedActions.push(
        'REQUEST_PLANT',
        'CONTACT_EXPERT'
      );
    } else if (mappedProducts.some(p => p.isInStock)) {
      plantInfo.recommendations.suggestedActions.push(
        'ADD_TO_CART',
        'VIEW_DETAILS'
      );
    } else {
      plantInfo.recommendations.suggestedActions.push(
        'NOTIFY_WHEN_AVAILABLE',
        'FIND_SIMILAR'
      );
    }

    return NextResponse.json({
      success: true,
      plantInfo,
      message: confidence > 0.8 
        ? 'Plant identified with high confidence'
        : confidence > 0.6
        ? 'Plant identified with moderate confidence'
        : 'Plant identification has low confidence',
    });

  } catch (error) {
    console.error('Error identifying plant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: false,
      error: 'Plant identification failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * GET /api/plant-recognition
 * Get recent plant identifications (for analytics)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authorization for staff
    if (!session?.user || !['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [identifications, totalCount] = await Promise.all([
      prisma.plantIdentification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          mappedProduct: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.plantIdentification.count({ where }),
    ]);

    // Get analytics
    const analytics = await Promise.all([
      // Most identified species
      prisma.plantIdentification.groupBy({
        by: ['identifiedSpecies'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
      // Conversion rate (identifications that led to cart additions)
      prisma.plantIdentification.aggregate({
        where: {
          ...where,
          addedToCart: true,
        },
        _count: {
          id: true,
        },
      }),
      // Success rate by confidence level
      prisma.plantIdentification.groupBy({
        by: ['mappedProductId'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    const conversionRate = totalCount > 0 
      ? (analytics[1]._count.id / totalCount) * 100 
      : 0;

    const successfulMappings = analytics[2].filter(g => g.mappedProductId !== null).length;
    const mappingSuccessRate = totalCount > 0 
      ? (successfulMappings / totalCount) * 100 
      : 0;

    return NextResponse.json({
      identifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      analytics: {
        totalIdentifications: totalCount,
        conversionRate: conversionRate.toFixed(2),
        mappingSuccessRate: mappingSuccessRate.toFixed(2),
        topSpecies: analytics[0].map(item => ({
          species: item.identifiedSpecies,
          count: item._count.id,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching plant identifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch identifications' },
      { status: 500 }
    );
  }
}
