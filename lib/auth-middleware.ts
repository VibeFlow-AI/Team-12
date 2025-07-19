import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  Permission, 
  Role, 
  Action, 
  Resource, 
  AccessContext, 
  createPermissionChecker,
  hasRole,
  isAdmin
} from '@/lib/rbac';

// Authentication check middleware
export async function requireAuth(request: NextRequest): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }

    return { 
      success: true, 
      user: session.user 
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Authentication failed' 
    };
  }
}

// Role-based authorization middleware
export async function requireRole(
  request: NextRequest, 
  requiredRoles: Role[]
): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const userRole = authResult.user?.role as Role;
  
  if (!hasRole(userRole, requiredRoles)) {
    return { 
      success: false, 
      error: 'Insufficient permissions' 
    };
  }

  return authResult;
}

// Permission-based authorization middleware
export async function requirePermission(
  request: NextRequest, 
  permission: Permission,
  resourceOwnerId?: string
): Promise<{ 
  success: boolean; 
  user?: any; 
  context?: AccessContext;
  error?: string 
}> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const context: AccessContext = {
    userId: authResult.user.id,
    role: authResult.user.role as Role,
    resourceOwnerId: resourceOwnerId
  };

  const checker = createPermissionChecker(context);
  
  if (!checker.hasPermission(permission)) {
    return { 
      success: false, 
      error: 'Permission denied' 
    };
  }

  return { 
    success: true, 
    user: authResult.user,
    context 
  };
}

// Resource-based authorization middleware
export async function requireResourceAccess(
  request: NextRequest,
  action: Action,
  resource: Resource,
  resourceId?: string,
  resourceOwnerId?: string
): Promise<{ 
  success: boolean; 
  user?: any; 
  context?: AccessContext;
  error?: string 
}> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const context: AccessContext = {
    userId: authResult.user.id,
    role: authResult.user.role as Role,
    resourceId: resourceId,
    resourceOwnerId: resourceOwnerId
  };

  const checker = createPermissionChecker(context);
  
  if (!checker.canPerform(action, resource, resourceId)) {
    return { 
      success: false, 
      error: 'Access denied for this resource' 
    };
  }

  return { 
    success: true, 
    user: authResult.user,
    context 
  };
}

// Admin-only middleware
export async function requireAdmin(request: NextRequest): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  return requireRole(request, [Role.ADMIN, Role.SUPER_ADMIN]);
}

// Student-only middleware
export async function requireStudent(request: NextRequest): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  return requireRole(request, [Role.STUDENT]);
}

// Mentor-only middleware
export async function requireMentor(request: NextRequest): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  return requireRole(request, [Role.MENTOR]);
}

// Owner or admin access middleware
export async function requireOwnerOrAdmin(
  request: NextRequest, 
  resourceOwnerId: string
): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  const authResult = await requireAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }

  const userRole = authResult.user?.role as Role;
  const userId = authResult.user?.id;

  // Allow if user is admin or owns the resource
  if (isAdmin(userRole) || userId === resourceOwnerId) {
    return authResult;
  }

  return { 
    success: false, 
    error: 'Access denied' 
  };
}

// Wrapper function for API route handlers with authentication
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: any, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuth(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    return handler(request, authResult.user, ...args);
  };
}

// Wrapper function for API route handlers with role check
export function withRole<T extends any[]>(
  roles: Role[],
  handler: (request: NextRequest, user: any, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireRole(request, roles);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Authentication required' ? 401 : 403 }
      );
    }

    return handler(request, authResult.user, ...args);
  };
}

// Wrapper function for API route handlers with permission check
export function withPermission<T extends any[]>(
  permission: Permission,
  handler: (request: NextRequest, user: any, context: AccessContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requirePermission(request, permission);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Authentication required' ? 401 : 403 }
      );
    }

    return handler(request, authResult.user!, authResult.context!, ...args);
  };
}

// Wrapper function for API route handlers with resource access check
export function withResourceAccess<T extends any[]>(
  action: Action,
  resource: Resource,
  handler: (request: NextRequest, user: any, context: AccessContext, ...args: T) => Promise<NextResponse>,
  getResourceId?: (request: NextRequest, ...args: T) => string,
  getResourceOwnerId?: (request: NextRequest, ...args: T) => Promise<string>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    let resourceId: string | undefined;
    let resourceOwnerId: string | undefined;

    if (getResourceId) {
      resourceId = getResourceId(request, ...args);
    }

    if (getResourceOwnerId) {
      resourceOwnerId = await getResourceOwnerId(request, ...args);
    }

    const authResult = await requireResourceAccess(
      request, 
      action, 
      resource, 
      resourceId, 
      resourceOwnerId
    );
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Authentication required' ? 401 : 403 }
      );
    }

    return handler(request, authResult.user!, authResult.context!, ...args);
  };
}

// Utility function to extract user context from request
export function createUserContext(user: any): AccessContext {
  return {
    userId: user.id,
    role: user.role as Role,
  };
}

// Error response helper
export function createErrorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Success response helper
export function createSuccessResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Validation helper for request data
export function validateRequest(data: any, schema: any): { 
  success: boolean; 
  data?: any; 
  errors?: any[] 
} {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors
    };
  }

  return {
    success: true,
    data: result.data
  };
}