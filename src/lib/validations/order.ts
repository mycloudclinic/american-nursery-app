import { z } from 'zod';

// Order validation schemas
export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['RETAIL', 'WHOLESALE', 'STAFF']).default('RETAIL'),
  source: z.enum(['ONLINE', 'IN_STORE', 'PHONE', 'EMAIL']).default('ONLINE'),
  
  // Items
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be positive'),
  })).min(1, 'At least one item is required'),
  
  // Pricing
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  shippingAmount: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  total: z.number().min(0),
  
  // Addresses
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  
  // Shipping
  shippingMethod: z.string().optional(),
  
  // Notes
  customerNotes: z.string().optional(),
  giftMessage: z.string().optional(),
  isGift: z.boolean().default(false),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum([
    'PENDING', 'CONFIRMED', 'PROCESSING', 'PICKING', 'PACKED',
    'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'
  ]),
  notes: z.string().optional(),
});

export const orderSearchSchema = z.object({
  query: z.string().optional(), // Search by order number, customer name, email
  status: z.string().optional(),
  type: z.string().optional(),
  source: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  sortBy: z.enum(['created', 'total', 'status', 'orderNumber']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
  notes: z.string().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
  notes: z.string().max(500).optional(),
});

// Address validation schemas
export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).default('SHIPPING'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  street1: z.string().min(1, 'Street address is required').max(100),
  street2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(1, 'State is required').max(50),
  zipCode: z.string().min(1, 'ZIP code is required').regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Payment validation schemas
export const paymentMethodSchema = z.object({
  type: z.enum([
    'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY',
    'BANK_TRANSFER', 'CHECK', 'CASH', 'STORE_CREDIT'
  ]),
  reference: z.string().optional(), // Payment processor reference
});

// Delivery validation schemas
export const scheduleDeliverySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  driverId: z.string().optional(),
  deliveryInstructions: z.string().max(500).optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  signatureRequired: z.boolean().default(false),
});

export const updateDeliverySchema = z.object({
  deliveryId: z.string().min(1, 'Delivery ID is required'),
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']),
  estimatedArrival: z.string().optional(),
  actualArrival: z.string().optional(),
  deliveryNotes: z.string().max(500).optional(),
  signature: z.string().optional(), // Base64 encoded signature
});

// Review validation schemas
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

// Consultation validation schemas
export const requestConsultationSchema = z.object({
  type: z.enum([
    'PLANT_CARE', 'GARDEN_DESIGN', 'PEST_CONTROL', 'SOIL_ANALYSIS',
    'IRRIGATION', 'SEASONAL_CARE', 'PLANT_SELECTION'
  ]),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  preferredDate: z.string().optional(),
  location: z.string().max(200).optional(),
});

export const updateConsultationSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
  status: z.enum(['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  actualDate: z.string().optional(),
  duration: z.number().min(1).optional(),
  assignedStaffId: z.string().optional(),
  notes: z.string().max(1000).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
});

// Wishlist validation schemas
export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  notes: z.string().max(500).optional(),
});

// Export types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type RequestConsultationInput = z.infer<typeof requestConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
