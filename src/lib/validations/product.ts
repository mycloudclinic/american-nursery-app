import { z } from 'zod';

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().min(1, 'SKU is required').max(50),
  barcode: z.string().optional(),
  
  // Pricing
  price: z.number().min(0, 'Price must be positive'),
  salePrice: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  
  // Physical attributes
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  
  // Plant-specific attributes
  plantType: z.enum([
    'ANNUAL', 'PERENNIAL', 'SHRUB', 'TREE', 'HOUSEPLANT', 'SUCCULENT',
    'HERB', 'VEGETABLE', 'BULB', 'GRASS', 'FERN', 'VINE'
  ]).optional(),
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
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  
  // Category
  categoryId: z.string().min(1, 'Category is required'),
  
  // Tags
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(100),
  sku: z.string().min(1, 'SKU is required').max(50),
  price: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  attributes: z.array(z.object({
    name: z.string().min(1, 'Attribute name is required'),
    value: z.string().min(1, 'Attribute value is required'),
  })).optional(),
});

export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

export const productSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  plantType: z.string().optional(),
  sunRequirement: z.string().optional(),
  waterRequirement: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'created', 'popularity']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Inventory validation schemas
export const inventoryItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.number().min(0).default(10),
  reorderQuantity: z.number().min(0).default(50),
  location: z.string().optional(),
  zone: z.string().optional(),
  supplierId: z.string().optional(),
  supplierSku: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED', 'EXPIRED']).default('EXCELLENT'),
  expirationDate: z.string().optional(),
  lotNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const inventoryMovementSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGED', 'EXPIRED']),
  quantity: z.number().min(1, 'Quantity must be positive'),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
});

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type InventoryMovementInput = z.infer<typeof inventoryMovementSchema>;
