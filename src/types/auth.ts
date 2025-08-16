import { DefaultSession } from 'next-auth';

/**
 * Type definitions for authentication system
 * Extends NextAuth.js default types with custom user roles and properties
 */

// User roles in the garden center system
export type UserRole = 
  // Customer roles
  | 'CUSTOMER'                    // Primary user - browse, purchase, order history, profile, gardening resources
  | 'WHOLESALE_CUSTOMER'          // Landscapers, contractors with special pricing
  | 'GUEST'                       // Browse products but cannot purchase without account
  
  // Staff roles
  | 'EMPLOYEE'                    // Sales Associate - view inventory, assist customers, process returns, manage pickup orders
  | 'ADMIN'                       // Full control over app content, user management, order fulfillment, inventory, promotions, settings
  | 'MANAGER'                     // Administrator/Manager role with full control
  | 'INVENTORY_MANAGER'           // Manage product stock, update quantities, add products, track shipments
  | 'CONTENT_CREATOR'             // Add/update gardening tips, plant care guides, blog posts, informational content
  | 'DELIVERY_DRIVER';            // Manage delivery routes, update order statuses, communicate with customers

// Business types for wholesale customers
export type BusinessType = 
  | 'RETAILER'
  | 'LANDSCAPER'
  | 'CONTRACTOR'
  | 'NURSERY'
  | 'FARM'
  | 'OTHER';

// Contact method preferences
export type ContactMethod = 'EMAIL' | 'PHONE' | 'SMS';

// Extended user interface
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  businessName?: string | null;
  businessType?: BusinessType | null;
  isActive: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  wholesaleStatus?: WholesaleStatus;
  wholesaleDiscount?: number | null;
  creditLimit?: number | null;
  paymentTerms?: number | null;
  accountManagerId?: string | null;
  department?: string | null;
  permissions?: any;
}

// NextAuth.js module augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      businessName?: string | null;
      businessType?: BusinessType | null;
      wholesaleStatus?: WholesaleStatus;
      loyaltyPoints?: number;
      totalSpent?: number;
      accountManagerId?: string | null;
      department?: string | null;
      permissions?: any;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    businessName?: string | null;
    businessType?: BusinessType | null;
    wholesaleStatus?: WholesaleStatus;
    loyaltyPoints?: number;
    totalSpent?: number;
    accountManagerId?: string | null;
    department?: string | null;
    permissions?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: UserRole;
    businessName?: string | null;
    businessType?: BusinessType | null;
    wholesaleStatus?: WholesaleStatus;
    loyaltyPoints?: number;
    totalSpent?: number;
    accountManagerId?: string | null;
    department?: string | null;
    permissions?: any;
  }
}

// Permission levels for role-based access control
export const PERMISSIONS = {
  // Guest permissions (browse only, no account)
  GUEST: [
    'view_products',
    'view_categories',
    'use_plant_scanner',
    'browse_content',
  ],

  // Customer permissions (primary user - browse, purchase, order history, profile, gardening resources)
  CUSTOMER: [
    'view_products',
    'view_categories',
    'use_plant_scanner',
    'browse_content',
    'add_to_cart',
    'place_order',
    'view_own_orders',
    'track_orders',
    'write_reviews',
    'request_consultation',
    'manage_wishlist',
    'manage_profile',
    'view_loyalty_points',
    'redeem_loyalty_points',
    'apply_wholesale',
    'access_gardening_resources',
  ],
  
  // Wholesale customer permissions (landscapers/contractors with special pricing)
  WHOLESALE_CUSTOMER: [
    'view_products',
    'view_categories',
    'use_plant_scanner',
    'browse_content',
    'add_to_cart',
    'place_order',
    'view_own_orders',
    'track_orders',
    'write_reviews',
    'request_consultation',
    'manage_wishlist',
    'manage_profile',
    'view_loyalty_points',
    'redeem_loyalty_points',
    'access_gardening_resources',
    'view_wholesale_prices',
    'place_wholesale_orders',
    'manage_projects',
    'bulk_order',
    'request_quotes',
    'manage_payment_terms',
    'view_volume_discounts',
    'schedule_deliveries',
  ],

  // Employee/Sales Associate permissions (view inventory, assist customers, process returns, manage pickup orders)
  EMPLOYEE: [
    'view_products',
    'view_categories',
    'view_orders',
    'update_order_status',
    'view_customers',
    'assist_customers',
    'view_inventory',
    'process_returns',
    'manage_pickup_orders',
    'handle_customer_service',
    'access_staff_tools',
    'process_transactions',
    'manage_local_orders',
  ],
  
  // Inventory Manager permissions (manage stock, update quantities, add products, track shipments)
  INVENTORY_MANAGER: [
    'view_products',
    'add_products',
    'edit_products',
    'view_orders',
    'update_order_status',
    'view_customers',
    'assist_customers',
    'view_inventory',
    'manage_inventory',
    'update_quantities',
    'track_shipments',
    'track_mortality',
    'manage_plant_lifecycle',
    'update_plant_health',
    'create_mortality_reports',
    'manage_suppliers',
    'reorder_products',
    'adjust_stock_levels',
    'manage_locations',
    'view_inventory_reports',
    'scan_barcodes',
    'receive_shipments',
    'track_incoming_shipments',
  ],

  // Delivery driver permissions (manage routes, update statuses, communicate with customers)
  DELIVERY_DRIVER: [
    'view_delivery_orders',
    'update_delivery_status',
    'capture_signatures',
    'view_delivery_routes',
    'navigate_to_customers',
    'contact_customers',
    'report_delivery_issues',
    'capture_photos',
    'scan_delivered_items',
    'manage_delivery_routes',
    'communicate_with_customers',
  ],

  // Content Creator/Gardening Expert permissions (gardening tips, plant care guides, blog posts, informational content)
  CONTENT_CREATOR: [
    'view_products',
    'create_plant_guides',
    'edit_plant_guides',
    'manage_care_instructions',
    'create_educational_content',
    'manage_plant_database',
    'upload_images',
    'create_videos',
    'schedule_content',
    'respond_to_plant_questions',
    'verify_plant_identifications',
    'create_gardening_tips',
    'update_plant_care_guides',
    'create_blog_posts',
    'manage_informational_content',
  ],
  
  // Manager permissions (Administrator/Manager with full control)
  MANAGER: [
    'view_products',
    'add_products',
    'edit_products',
    'delete_products',
    'view_orders',
    'manage_orders',
    'cancel_orders',
    'view_customers',
    'manage_customers',
    'view_inventory',
    'manage_inventory',
    'track_mortality',
    'manage_plant_lifecycle',
    'manage_suppliers',
    'view_reports',
    'manage_staff',
    'schedule_deliveries',
    'manage_consultations',
    'approve_returns',
    'set_pricing',
    'manage_promotions',
    'view_analytics',
    'manage_wholesale_accounts',
    'approve_large_orders',
    'full_order_fulfillment',
    'manage_app_content',
    'user_management',
    'manage_settings',
  ],
  
  // Admin permissions (full control over everything)
  ADMIN: [
    'full_access',
    'manage_users',
    'manage_roles',
    'assign_permissions',
    'system_settings',
    'view_analytics',
    'manage_categories',
    'manage_promotions',
    'manage_loyalty_program',
    'export_data',
    'backup_restore',
    'audit_logs',
    'security_settings',
    'database_management',
    'api_management',
    'integration_settings',
    'notification_settings',
    'payment_settings',
    'tax_settings',
    'manage_app_content',
    'user_management',
    'order_fulfillment',
    'inventory_control',
    'manage_all_settings',
  ],
} as const;

// Helper type to get permissions for a role
export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS][number];

// Wholesale application status
export type WholesaleStatus = 
  | 'NOT_APPLIED'             // Regular customer, hasn't applied for wholesale
  | 'APPLICATION_PENDING'     // Applied but waiting for approval
  | 'APPROVED'               // Approved wholesale customer
  | 'REJECTED'               // Application was rejected
  | 'SUSPENDED'              // Wholesale privileges temporarily suspended
  | 'CANCELLED';             // Wholesale account cancelled

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  GUEST: 0,
  CUSTOMER: 1,
  WHOLESALE_CUSTOMER: 2,
  DELIVERY_DRIVER: 3,
  CONTENT_CREATOR: 3,
  EMPLOYEE: 4,
  INVENTORY_MANAGER: 5,
  MANAGER: 6,
  ADMIN: 7,
};



// Authentication form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  businessName?: string;
  businessType?: BusinessType;
  taxId?: string;
  applyForWholesale?: boolean;
}

export interface WholesaleApplicationFormData {
  businessName: string;
  businessType: BusinessType;
  taxId?: string;
  businessLicense?: string;
  businessYearsOperation: number;
  expectedMonthlyVolume: number;
  businessDescription?: string;
  contactPerson: string;
  phone: string;
  businessAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  references?: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
  }[];
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Session state types
export interface AuthState {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: PermissionType) => boolean;
  isWholesale: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

// API response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: ExtendedUser;
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}
