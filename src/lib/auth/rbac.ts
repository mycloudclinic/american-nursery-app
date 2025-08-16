import { UserRole, PERMISSIONS, PermissionType, ROLE_HIERARCHY, WholesaleStatus } from '@/types/auth';

/**
 * Role-Based Access Control (RBAC) utilities
 * Handles permission checking and role management for the garden center system
 */

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: PermissionType): boolean {
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  // Admin has full access to everything
  if (userRole === 'ADMIN') return true;
  
  // Check if permission exists in role's permission array
  return (rolePermissions as readonly string[]).includes(permission);
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: PermissionType[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: PermissionType[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check if a role is higher than another role in the hierarchy
 */
export function isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
}

/**
 * Check if a role is equal or higher than another role
 */
export function isRoleEqualOrHigher(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Get all permissions for a given role
 */
export function getRolePermissions(role: UserRole): readonly string[] {
  return PERMISSIONS[role] || [];
}

/**
 * Check if a user role is a customer role
 */
export function isCustomerRole(role: UserRole): boolean {
  return ['GUEST', 'CUSTOMER', 'WHOLESALE_CUSTOMER'].includes(role);
}

/**
 * Check if a user role is a staff role
 */
export function isStaffRole(role: UserRole): boolean {
  return ['EMPLOYEE', 'INVENTORY_MANAGER', 'DELIVERY_DRIVER', 'CONTENT_CREATOR', 'MANAGER', 'ADMIN'].includes(role);
}

/**
 * Check if a user role can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'manage_users');
}

/**
 * Check if a user role can access administrative functions
 */
export function isAdminRole(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER'].includes(role);
}

/**
 * Check if a user role can view wholesale prices
 */
export function canViewWholesalePrices(role: UserRole): boolean {
  return hasPermission(role, 'view_wholesale_prices');
}

/**
 * Check if a user role can manage inventory
 */
export function canManageInventory(role: UserRole): boolean {
  return hasPermission(role, 'manage_inventory');
}

/**
 * Check if a user role can track plant mortality
 */
export function canTrackMortality(role: UserRole): boolean {
  return hasPermission(role, 'track_mortality');
}

/**
 * Check if a user role can manage plant lifecycle
 */
export function canManagePlantLifecycle(role: UserRole): boolean {
  return hasPermission(role, 'manage_plant_lifecycle');
}

/**
 * Check if a user role can manage wholesale accounts
 */
export function canManageWholesaleAccounts(role: UserRole): boolean {
  return hasPermission(role, 'manage_wholesale_accounts');
}

/**
 * Check if a user role can manage suppliers (for inventory managers)
 */
export function canManageSuppliers(role: UserRole): boolean {
  return hasPermission(role, 'manage_suppliers');
}

/**
 * Check if a user role can handle customer service
 */
export function canHandleCustomerService(role: UserRole): boolean {
  return hasPermission(role, 'handle_customer_service');
}

/**
 * Check if a user role can manage pickup orders
 */
export function canManagePickupOrders(role: UserRole): boolean {
  return hasPermission(role, 'manage_pickup_orders');
}

/**
 * Check if a user role can handle deliveries
 */
export function canHandleDeliveries(role: UserRole): boolean {
  return hasPermission(role, 'view_delivery_orders');
}

/**
 * Check if a user role can create content
 */
export function canCreateContent(role: UserRole): boolean {
  return hasPermission(role, 'create_plant_guides');
}

/**
 * Check if a user role can handle customer service
 */
export function canHandleCustomerService(role: UserRole): boolean {
  return hasPermission(role, 'handle_customer_service');
}

/**
 * Get role-specific dashboard permissions
 */
export function getDashboardPermissions(role: UserRole) {
  return {
    canViewProducts: hasPermission(role, 'view_products'),
    canViewOrders: hasPermission(role, 'view_orders'),
    canViewCustomers: hasPermission(role, 'view_customers'),
    canViewInventory: hasPermission(role, 'view_inventory'),
    canViewReports: hasPermission(role, 'view_reports') || hasPermission(role, 'view_analytics'),
    canManageUsers: hasPermission(role, 'manage_users'),
    canViewWholesale: hasPermission(role, 'view_wholesale_prices'),
    canTrackPlants: hasPermission(role, 'track_mortality'),
    canManageSuppliers: hasPermission(role, 'manage_suppliers'),
    canHandleDeliveries: hasPermission(role, 'view_delivery_orders'),
    canCreateContent: hasPermission(role, 'create_plant_guides'),
  };
}

/**
 * Check wholesale application status permissions
 */
export function canViewWholesaleStatus(role: UserRole, status: WholesaleStatus): boolean {
  // Customers can view their own wholesale status
  if (isCustomerRole(role)) {
    return true;
  }
  
  // Staff can view wholesale applications (Manager/Admin level)
  if (isStaffRole(role)) {
    return hasPermission(role, 'manage_wholesale_accounts') || hasPermission(role, 'user_management');
  }
  
  return false;
}

/**
 * Check if user can transition wholesale status
 */
export function canTransitionWholesaleStatus(
  userRole: UserRole, 
  fromStatus: WholesaleStatus, 
  toStatus: WholesaleStatus
): boolean {
  // Only Manager and Admin can change wholesale status
  if (!hasPermission(userRole, 'manage_wholesale_accounts') && !hasPermission(userRole, 'user_management')) {
    return false;
  }

  // Define valid transitions
  const validTransitions: Record<WholesaleStatus, WholesaleStatus[]> = {
    'NOT_APPLIED': ['APPLICATION_PENDING'],
    'APPLICATION_PENDING': ['APPROVED', 'REJECTED'],
    'APPROVED': ['SUSPENDED', 'CANCELLED'],
    'REJECTED': ['APPLICATION_PENDING'], // Can re-apply
    'SUSPENDED': ['APPROVED', 'CANCELLED'],
    'CANCELLED': [],
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
}

/**
 * Get role display information
 */
export function getRoleDisplayInfo(role: UserRole) {
  const roleInfo = {
    GUEST: { label: 'Guest User', description: 'Browse products but cannot purchase without account', color: 'gray' },
    CUSTOMER: { label: 'Customer', description: 'Primary user - browse, purchase, order history, profile, gardening resources', color: 'blue' },
    WHOLESALE_CUSTOMER: { label: 'Wholesale Customer', description: 'Landscapers, contractors with special pricing', color: 'purple' },
    EMPLOYEE: { label: 'Employee/Sales Associate', description: 'View inventory, assist customers, process returns, manage pickup orders', color: 'green' },
    INVENTORY_MANAGER: { label: 'Inventory Manager', description: 'Manage stock, update quantities, add products, track shipments', color: 'emerald' },
    DELIVERY_DRIVER: { label: 'Delivery Driver', description: 'Manage delivery routes, update order statuses, communicate with customers', color: 'yellow' },
    CONTENT_CREATOR: { label: 'Content Creator/Gardening Expert', description: 'Add/update gardening tips, plant care guides, blog posts, informational content', color: 'pink' },
    MANAGER: { label: 'Administrator/Manager', description: 'Full control over app content, user management, order fulfillment, inventory, promotions, settings', color: 'red' },
    ADMIN: { label: 'Administrator', description: 'Full control over everything', color: 'slate' },
  };

  return roleInfo[role] || { label: role, description: 'Unknown role', color: 'gray' };
}

/**
 * Get next available roles for promotion
 */
export function getPromotableRoles(currentRole: UserRole): UserRole[] {
  const currentLevel = ROLE_HIERARCHY[currentRole];
  
  return Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => level > currentLevel && role !== 'ADMIN')
    .map(([role]) => role as UserRole)
    .sort((a, b) => ROLE_HIERARCHY[a] - ROLE_HIERARCHY[b]);
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Public routes
  const publicRoutes = ['/', '/products', '/categories', '/about', '/contact', '/search'];
  if (publicRoutes.some(publicRoute => route.startsWith(publicRoute))) {
    return true;
  }
  
  // Customer routes
  const customerRoutes = ['/cart', '/checkout', '/account', '/orders', '/wishlist', '/favorites', '/profile'];
  if (customerRoutes.some(customerRoute => route.startsWith(customerRoute))) {
    return isRoleEqualOrHigher(userRole, 'CUSTOMER');
  }
  
  // Wholesale routes
  const wholesaleRoutes = ['/wholesale'];
  if (wholesaleRoutes.some(wholesaleRoute => route.startsWith(wholesaleRoute))) {
    return userRole === 'WHOLESALE_CUSTOMER' || isStaffRole(userRole);
  }
  
  // Staff routes
  const staffRoutes = ['/admin', '/dashboard', '/staff'];
  if (staffRoutes.some(staffRoute => route.startsWith(staffRoute))) {
    return isStaffRole(userRole);
  }
  
  // Inventory management routes
  const inventoryRoutes = ['/admin/inventory', '/admin/mortality', '/admin/plants'];
  if (inventoryRoutes.some(inventoryRoute => route.startsWith(inventoryRoute))) {
    return hasPermission(userRole, 'manage_inventory') || hasPermission(userRole, 'view_inventory');
  }
  
  // Supplier management routes (for inventory managers)
  const supplierRoutes = ['/admin/suppliers'];
  if (supplierRoutes.some(supplierRoute => route.startsWith(supplierRoute))) {
    return hasPermission(userRole, 'manage_suppliers');
  }
  
  // Wholesale management routes
  const wholesaleManagementRoutes = ['/admin/wholesale'];
  if (wholesaleManagementRoutes.some(wholesaleRoute => route.startsWith(wholesaleRoute))) {
    return hasPermission(userRole, 'manage_wholesale_accounts');
  }
  
  // Delivery routes
  const deliveryRoutes = ['/admin/deliveries', '/driver'];
  if (deliveryRoutes.some(deliveryRoute => route.startsWith(deliveryRoute))) {
    return hasPermission(userRole, 'view_delivery_orders');
  }
  
  // Content management routes
  const contentRoutes = ['/admin/content', '/admin/guides'];
  if (contentRoutes.some(contentRoute => route.startsWith(contentRoute))) {
    return hasPermission(userRole, 'create_plant_guides');
  }
  
  // Admin routes
  const adminRoutes = ['/admin/users', '/admin/settings', '/admin/analytics'];
  if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
    return userRole === 'ADMIN';
  }
  
  // Default deny
  return false;
}

/**
 * Get user role from hierarchy level
 */
export function getRoleFromLevel(level: number): UserRole | null {
  const roleEntry = Object.entries(ROLE_HIERARCHY).find(([, roleLevel]) => roleLevel === level);
  return roleEntry ? (roleEntry[0] as UserRole) : null;
}

/**
 * Check if user can view another user's data
 */
export function canViewUserData(viewerRole: UserRole, targetRole: UserRole): boolean {
  // Admin can view all
  if (viewerRole === 'ADMIN') return true;
  
  // Manager can view staff and customers
  if (viewerRole === 'MANAGER') {
    return isRoleEqualOrHigher(viewerRole, targetRole);
  }
  
  // Users can view their own role level and below
  return isRoleEqualOrHigher(viewerRole, targetRole);
}

// Specific role checking functions
export function isEmployee(userRole: UserRole): boolean {
  return userRole === 'EMPLOYEE';
}

export function isInventoryManager(userRole: UserRole): boolean {
  return userRole === 'INVENTORY_MANAGER';
}

export function isDeliveryDriver(userRole: UserRole): boolean {
  return userRole === 'DELIVERY_DRIVER';
}

export function isContentCreator(userRole: UserRole): boolean {
  return userRole === 'CONTENT_CREATOR';
}

// Legacy compatibility functions
export function isStaff(userRole: UserRole): boolean {
  return isStaffRole(userRole);
}

export function isWholesaleCustomer(userRole: UserRole): boolean {
  return userRole === 'WHOLESALE_CUSTOMER';
}

export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return isRoleEqualOrHigher(userRole, requiredRole);
}

export function isManagement(userRole: UserRole): boolean {
  return isAdminRole(userRole);
}

export function canManageOrders(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_orders') || hasPermission(userRole, 'update_order_status');
}

export function canAccessAdminPanel(userRole: UserRole): boolean {
  return isStaffRole(userRole);
}

export function getRoleDisplayName(userRole: UserRole): string {
  return getRoleDisplayInfo(userRole).label;
}