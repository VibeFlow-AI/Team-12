// Role-Based Access Control (RBAC) System

export enum Role {
  STUDENT = 'student',
  MENTOR = 'mentor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  // User management
  VIEW_PROFILE = 'view_profile',
  EDIT_PROFILE = 'edit_profile',
  DELETE_PROFILE = 'delete_profile',
  VIEW_ALL_USERS = 'view_all_users',
  MANAGE_USERS = 'manage_users',

  // Session management
  BOOK_SESSION = 'book_session',
  VIEW_OWN_SESSIONS = 'view_own_sessions',
  VIEW_ALL_SESSIONS = 'view_all_sessions',
  MANAGE_SESSIONS = 'manage_sessions',
  CANCEL_SESSION = 'cancel_session',
  RESCHEDULE_SESSION = 'reschedule_session',

  // Mentor-specific
  SET_AVAILABILITY = 'set_availability',
  VIEW_MENTOR_ANALYTICS = 'view_mentor_analytics',
  RESPOND_TO_REVIEWS = 'respond_to_reviews',
  MANAGE_STUDENT_SESSIONS = 'manage_student_sessions',

  // Student-specific
  WRITE_REVIEWS = 'write_reviews',
  EDIT_OWN_REVIEWS = 'edit_own_reviews',
  DELETE_OWN_REVIEWS = 'delete_own_reviews',
  VIEW_MENTOR_PROFILES = 'view_mentor_profiles',

  // Payment
  MAKE_PAYMENTS = 'make_payments',
  VIEW_OWN_PAYMENTS = 'view_own_payments',
  VIEW_ALL_PAYMENTS = 'view_all_payments',
  MANAGE_PAYMENTS = 'manage_payments',

  // Reviews
  VIEW_REVIEWS = 'view_reviews',
  MODERATE_REVIEWS = 'moderate_reviews',
  DELETE_ANY_REVIEW = 'delete_any_review',

  // Admin
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_PLATFORM = 'manage_platform',
  MODERATE_CONTENT = 'moderate_content',
  MANAGE_DISPUTES = 'manage_disputes',

  // Super Admin
  MANAGE_ADMINS = 'manage_admins',
  SYSTEM_SETTINGS = 'system_settings',
  DATABASE_ACCESS = 'database_access',
}

export enum Resource {
  USER = 'user',
  SESSION = 'session',
  REVIEW = 'review',
  PAYMENT = 'payment',
  ANALYTICS = 'analytics',
  PLATFORM = 'platform',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.STUDENT]: [
    // Profile management
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,

    // Session management
    Permission.BOOK_SESSION,
    Permission.VIEW_OWN_SESSIONS,
    Permission.CANCEL_SESSION,
    Permission.RESCHEDULE_SESSION,

    // Reviews
    Permission.WRITE_REVIEWS,
    Permission.EDIT_OWN_REVIEWS,
    Permission.DELETE_OWN_REVIEWS,
    Permission.VIEW_REVIEWS,

    // Mentor discovery
    Permission.VIEW_MENTOR_PROFILES,

    // Payments
    Permission.MAKE_PAYMENTS,
    Permission.VIEW_OWN_PAYMENTS,
  ],

  [Role.MENTOR]: [
    // Profile management
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,

    // Session management
    Permission.VIEW_OWN_SESSIONS,
    Permission.MANAGE_STUDENT_SESSIONS,
    Permission.SET_AVAILABILITY,
    Permission.CANCEL_SESSION,
    Permission.RESCHEDULE_SESSION,

    // Reviews
    Permission.RESPOND_TO_REVIEWS,
    Permission.VIEW_REVIEWS,

    // Analytics
    Permission.VIEW_MENTOR_ANALYTICS,

    // Payments
    Permission.VIEW_OWN_PAYMENTS,
  ],

  [Role.ADMIN]: [
    // User management
    Permission.VIEW_ALL_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,

    // Session management
    Permission.VIEW_ALL_SESSIONS,
    Permission.MANAGE_SESSIONS,

    // Reviews
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.DELETE_ANY_REVIEW,

    // Payments
    Permission.VIEW_ALL_PAYMENTS,
    Permission.MANAGE_PAYMENTS,

    // Platform
    Permission.VIEW_ANALYTICS,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_DISPUTES,
    Permission.MANAGE_PLATFORM,
  ],

  [Role.SUPER_ADMIN]: [],
};

// Set super admin permissions after object initialization
ROLE_PERMISSIONS[Role.SUPER_ADMIN] = [
  // All admin permissions
  ...ROLE_PERMISSIONS[Role.ADMIN],

  // Super admin specific
  Permission.MANAGE_ADMINS,
  Permission.SYSTEM_SETTINGS,
  Permission.DATABASE_ACCESS,
  Permission.DELETE_PROFILE,
];

// Context-based access control interface
export interface AccessContext {
  userId: string;
  role: Role;
  resourceId?: string;
  resourceOwnerId?: string;
  sessionId?: string;
}

// Permission checker class
export class PermissionChecker {
  private context: AccessContext;

  constructor(context: AccessContext) {
    this.context = context;
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.context.role];
    return rolePermissions.includes(permission);
  }

  // Check if user can perform action on resource
  canPerform(action: Action, resource: Resource, resourceId?: string): boolean {
    // Super admin can do everything
    if (this.context.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Check resource-specific permissions
    switch (resource) {
      case Resource.USER:
        return this.canAccessUser(action, resourceId);

      case Resource.SESSION:
        return this.canAccessSession(action, resourceId);

      case Resource.REVIEW:
        return this.canAccessReview(action, resourceId);

      case Resource.PAYMENT:
        return this.canAccessPayment(action, resourceId);

      case Resource.ANALYTICS:
        return this.canAccessAnalytics(action);

      case Resource.PLATFORM:
        return this.canAccessPlatform(action);

      default:
        return false;
    }
  }

  // Check if user can access their own or others' data
  canAccessOwnResource(resourceOwnerId: string): boolean {
    return this.context.userId === resourceOwnerId;
  }

  // User access control
  private canAccessUser(action: Action, resourceId?: string): boolean {
    switch (action) {
      case Action.READ:
        return (
          this.hasPermission(Permission.VIEW_PROFILE) ||
          this.hasPermission(Permission.VIEW_ALL_USERS) ||
          (resourceId && this.canAccessOwnResource(resourceId))
        );

      case Action.UPDATE:
        return (
          this.hasPermission(Permission.MANAGE_USERS) ||
          (resourceId && this.canAccessOwnResource(resourceId) && this.hasPermission(Permission.EDIT_PROFILE))
        );

      case Action.DELETE:
        return (
          this.hasPermission(Permission.DELETE_PROFILE) ||
          this.hasPermission(Permission.MANAGE_USERS)
        );

      case Action.MANAGE:
        return this.hasPermission(Permission.MANAGE_USERS);

      default:
        return false;
    }
  }

  // Session access control
  private canAccessSession(action: Action, resourceId?: string): boolean {
    switch (action) {
      case Action.CREATE:
        return this.hasPermission(Permission.BOOK_SESSION);

      case Action.READ:
        return (
          this.hasPermission(Permission.VIEW_OWN_SESSIONS) ||
          this.hasPermission(Permission.VIEW_ALL_SESSIONS)
        );

      case Action.UPDATE:
        return (
          this.hasPermission(Permission.MANAGE_SESSIONS) ||
          this.hasPermission(Permission.MANAGE_STUDENT_SESSIONS) ||
          this.hasPermission(Permission.RESCHEDULE_SESSION)
        );

      case Action.DELETE:
        return (
          this.hasPermission(Permission.CANCEL_SESSION) ||
          this.hasPermission(Permission.MANAGE_SESSIONS)
        );

      default:
        return false;
    }
  }

  // Review access control
  private canAccessReview(action: Action, resourceId?: string): boolean {
    switch (action) {
      case Action.CREATE:
        return this.hasPermission(Permission.WRITE_REVIEWS);

      case Action.READ:
        return this.hasPermission(Permission.VIEW_REVIEWS);

      case Action.UPDATE:
        return (
          this.hasPermission(Permission.EDIT_OWN_REVIEWS) ||
          this.hasPermission(Permission.RESPOND_TO_REVIEWS) ||
          this.hasPermission(Permission.MODERATE_REVIEWS)
        );

      case Action.DELETE:
        return (
          this.hasPermission(Permission.DELETE_OWN_REVIEWS) ||
          this.hasPermission(Permission.DELETE_ANY_REVIEW)
        );

      default:
        return false;
    }
  }

  // Payment access control
  private canAccessPayment(action: Action, resourceId?: string): boolean {
    switch (action) {
      case Action.CREATE:
        return this.hasPermission(Permission.MAKE_PAYMENTS);

      case Action.READ:
        return (
          this.hasPermission(Permission.VIEW_OWN_PAYMENTS) ||
          this.hasPermission(Permission.VIEW_ALL_PAYMENTS)
        );

      case Action.UPDATE:
      case Action.MANAGE:
        return this.hasPermission(Permission.MANAGE_PAYMENTS);

      default:
        return false;
    }
  }

  // Analytics access control
  private canAccessAnalytics(action: Action): boolean {
    switch (action) {
      case Action.READ:
        return (
          this.hasPermission(Permission.VIEW_ANALYTICS) ||
          this.hasPermission(Permission.VIEW_MENTOR_ANALYTICS)
        );

      default:
        return false;
    }
  }

  // Platform access control
  private canAccessPlatform(action: Action): boolean {
    switch (action) {
      case Action.READ:
      case Action.UPDATE:
      case Action.MANAGE:
        return this.hasPermission(Permission.MANAGE_PLATFORM);

      default:
        return false;
    }
  }
}

// Utility functions
export function createPermissionChecker(context: AccessContext): PermissionChecker {
  return new PermissionChecker(context);
}

export function hasRole(userRole: string, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole as Role);
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function isMentor(role: Role): boolean {
  return role === Role.MENTOR;
}

export function isStudent(role: Role): boolean {
  return role === Role.STUDENT;
}

// Higher-order function for API route protection
export function withPermission(
  permission: Permission,
  handler: (req: any, res: any, context: AccessContext) => Promise<any>
) {
  return async (req: any, res: any) => {
    // This would be implemented in the actual API route
    // The session and user context would be extracted from the request
    throw new Error('withPermission should be implemented in API routes');
  };
}

// Middleware factory for Next.js API routes
export function requirePermission(permission: Permission) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Extract context from request
      const [req] = args;
      const context = extractContextFromRequest(req);
      
      const checker = createPermissionChecker(context);
      
      if (!checker.hasPermission(permission)) {
        throw new Error('Insufficient permissions');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Helper function to extract context from request
function extractContextFromRequest(req: any): AccessContext {
  // This would extract the user context from the request
  // Implementation depends on your authentication system
  return {
    userId: req.user?.id || '',
    role: req.user?.role || Role.STUDENT,
    resourceId: req.query?.id,
    resourceOwnerId: req.query?.ownerId,
  };
}

// Role hierarchy for inheritance
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.STUDENT]: [Role.STUDENT],
  [Role.MENTOR]: [Role.MENTOR],
  [Role.ADMIN]: [Role.ADMIN, Role.MENTOR, Role.STUDENT],
  [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR, Role.STUDENT],
};

// Check if a role inherits from another role
export function roleInheritsFrom(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole].includes(requiredRole);
}