import { UserRole, PERMISSIONS, ROLE_HIERARCHY, PermissionType } from '@/types/auth';

/**
 * Role-Based Access Control (RBAC) utilities
 * Provides functions for checking permissions and role-based authorization
 */

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: PermissionType): boolean {
  // Admin has full access
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Check if the role has the specific permission
  const rolePermissions = PERMISSIONS[userRole] as readonly PermissionType[];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Check if user role has higher or equal level than required role
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is a wholesale customer
 */
export function isWholesaleCustomer(userRole: UserRole): boolean {
  return userRole === 'WHOLESALE_CUSTOMER';
}

/**
 * Check if user is staff (any staff role)
 */
export function isStaff(userRole: UserRole): boolean {
  return ['STAFF', 'INVENTORY_MANAGER', 'DELIVERY_DRIVER', 'MANAGER', 'ADMIN'].includes(userRole);
}

/**
 * Check if user is management level
 */
export function isManagement(userRole: UserRole): boolean {
  return ['MANAGER', 'ADMIN'].includes(userRole);
}

/**
 * Check if user can manage inventory
 */
export function canManageInventory(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_inventory');
}

/**
 * Check if user can view wholesale prices
 */
export function canViewWholesalePrices(userRole: UserRole): boolean {
  return hasPermission(userRole, 'view_wholesale_prices') || isStaff(userRole);
}

/**
 * Check if user can manage orders
 */
export function canManageOrders(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_orders') || hasPermission(userRole, 'update_order_status');
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(userRole: UserRole): boolean {
  return isStaff(userRole);
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole): readonly PermissionType[] {
  if (userRole === 'ADMIN') {
    // Return all possible permissions for admin
    return Object.values(PERMISSIONS).flat() as PermissionType[];
  }
  
  return PERMISSIONS[userRole];
}

/**
 * Check multiple permissions at once
 */
export function hasAnyPermission(userRole: UserRole, permissions: PermissionType[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: PermissionType[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(userRole: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    CUSTOMER: 'Customer',
    WHOLESALE_CUSTOMER: 'Wholesale Customer',
    STAFF: 'Staff',
    INVENTORY_MANAGER: 'Inventory Manager',
    DELIVERY_DRIVER: 'Delivery Driver',
    MANAGER: 'Manager',
    ADMIN: 'Administrator',
  };
  
  return roleNames[userRole];
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Public routes
  const publicRoutes = ['/', '/products', '/categories', '/about', '/contact'];
  if (publicRoutes.some(publicRoute => route.startsWith(publicRoute))) {
    return true;
  }
  
  // Customer routes
  const customerRoutes = ['/cart', '/checkout', '/account', '/orders', '/wishlist'];
  if (customerRoutes.some(customerRoute => route.startsWith(customerRoute))) {
    return hasRoleLevel(userRole, 'CUSTOMER');
  }
  
  // Wholesale routes
  const wholesaleRoutes = ['/wholesale'];
  if (wholesaleRoutes.some(wholesaleRoute => route.startsWith(wholesaleRoute))) {
    return isWholesaleCustomer(userRole) || isStaff(userRole);
  }
  
  // Staff routes
  const staffRoutes = ['/admin', '/dashboard'];
  if (staffRoutes.some(staffRoute => route.startsWith(staffRoute))) {
    return isStaff(userRole);
  }
  
  // Admin routes
  const adminRoutes = ['/admin/users', '/admin/settings', '/admin/analytics'];
  if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
    return userRole === 'ADMIN';
  }
  
  // Default deny
  return false;
}
