import { DefaultSession } from 'next-auth';

/**
 * Type definitions for authentication system
 * Extends NextAuth.js default types with custom user roles and properties
 */

// User roles in the garden center system
export type UserRole = 
  | 'CUSTOMER'
  | 'WHOLESALE_CUSTOMER'
  | 'STAFF'
  | 'INVENTORY_MANAGER'
  | 'DELIVERY_DRIVER'
  | 'MANAGER'
  | 'ADMIN';

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
  wholesaleDiscount?: number | null;
  creditLimit?: number | null;
  paymentTerms?: number | null;
}

// NextAuth.js module augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      businessName?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    businessName?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: UserRole;
    businessName?: string | null;
  }
}

// Permission levels for role-based access control
export const PERMISSIONS = {
  // Customer permissions
  CUSTOMER: [
    'view_products',
    'add_to_cart',
    'place_order',
    'view_own_orders',
    'write_reviews',
    'request_consultation',
    'manage_wishlist',
  ],
  
  // Wholesale customer permissions (includes all customer permissions)
  WHOLESALE_CUSTOMER: [
    'view_products',
    'add_to_cart',
    'place_order',
    'view_own_orders',
    'write_reviews',
    'request_consultation',
    'manage_wishlist',
    'view_wholesale_prices',
    'place_wholesale_orders',
  ],
  
  // Staff permissions
  STAFF: [
    'view_products',
    'view_orders',
    'update_order_status',
    'view_customers',
    'assist_customers',
    'view_inventory',
  ],
  
  // Inventory manager permissions (includes staff permissions)
  INVENTORY_MANAGER: [
    'view_products',
    'view_orders',
    'update_order_status',
    'view_customers',
    'assist_customers',
    'view_inventory',
    'manage_inventory',
    'add_products',
    'edit_products',
    'manage_suppliers',
    'view_reports',
  ],
  
  // Delivery driver permissions
  DELIVERY_DRIVER: [
    'view_delivery_orders',
    'update_delivery_status',
    'capture_signatures',
    'view_delivery_routes',
  ],
  
  // Manager permissions (includes most permissions)
  MANAGER: [
    'view_products',
    'add_products',
    'edit_products',
    'delete_products',
    'view_orders',
    'manage_orders',
    'view_customers',
    'manage_customers',
    'view_inventory',
    'manage_inventory',
    'manage_suppliers',
    'view_reports',
    'manage_staff',
    'schedule_deliveries',
    'manage_consultations',
  ],
  
  // Admin permissions (full access)
  ADMIN: [
    'full_access',
    'manage_users',
    'manage_roles',
    'system_settings',
    'view_analytics',
    'manage_categories',
    'manage_promotions',
    'manage_loyalty_program',
    'export_data',
    'backup_restore',
  ],
} as const;

// Helper type to get permissions for a role
export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS][number];

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 1,
  WHOLESALE_CUSTOMER: 2,
  DELIVERY_DRIVER: 3,
  STAFF: 4,
  INVENTORY_MANAGER: 5,
  MANAGER: 6,
  ADMIN: 7,
};

// Helper function to check if user has permission
export function hasPermission(userRole: UserRole, permission: PermissionType): boolean {
  // Admin has full access
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Check if the role has the specific permission
  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions.includes(permission as any);
}

// Helper function to check if user role has higher or equal level than required role
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

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
