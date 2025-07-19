import {
  Role,
  Permission,
  Action,
  Resource,
  AccessContext,
  PermissionChecker,
  createPermissionChecker,
  hasRole,
  isAdmin,
  isMentor,
  isStudent,
  roleInheritsFrom,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY
} from '@/lib/rbac';

describe('RBAC System', () => {
  describe('Role Utilities', () => {
    it('should correctly identify roles', () => {
      expect(isStudent(Role.STUDENT)).toBe(true);
      expect(isStudent(Role.MENTOR)).toBe(false);
      
      expect(isMentor(Role.MENTOR)).toBe(true);
      expect(isMentor(Role.STUDENT)).toBe(false);
      
      expect(isAdmin(Role.ADMIN)).toBe(true);
      expect(isAdmin(Role.SUPER_ADMIN)).toBe(true);
      expect(isAdmin(Role.STUDENT)).toBe(false);
    });

    it('should check role membership correctly', () => {
      expect(hasRole(Role.STUDENT, [Role.STUDENT, Role.MENTOR])).toBe(true);
      expect(hasRole(Role.ADMIN, [Role.STUDENT, Role.MENTOR])).toBe(false);
    });

    it('should handle role inheritance correctly', () => {
      expect(roleInheritsFrom(Role.SUPER_ADMIN, Role.ADMIN)).toBe(true);
      expect(roleInheritsFrom(Role.SUPER_ADMIN, Role.STUDENT)).toBe(true);
      expect(roleInheritsFrom(Role.ADMIN, Role.STUDENT)).toBe(true);
      expect(roleInheritsFrom(Role.STUDENT, Role.ADMIN)).toBe(false);
    });
  });

  describe('Role Permissions', () => {
    it('should have correct permissions for students', () => {
      const studentPermissions = ROLE_PERMISSIONS[Role.STUDENT];
      
      expect(studentPermissions).toContain(Permission.BOOK_SESSION);
      expect(studentPermissions).toContain(Permission.WRITE_REVIEWS);
      expect(studentPermissions).toContain(Permission.VIEW_MENTOR_PROFILES);
      expect(studentPermissions).toContain(Permission.MAKE_PAYMENTS);
      
      expect(studentPermissions).not.toContain(Permission.SET_AVAILABILITY);
      expect(studentPermissions).not.toContain(Permission.MANAGE_USERS);
    });

    it('should have correct permissions for mentors', () => {
      const mentorPermissions = ROLE_PERMISSIONS[Role.MENTOR];
      
      expect(mentorPermissions).toContain(Permission.SET_AVAILABILITY);
      expect(mentorPermissions).toContain(Permission.RESPOND_TO_REVIEWS);
      expect(mentorPermissions).toContain(Permission.VIEW_MENTOR_ANALYTICS);
      expect(mentorPermissions).toContain(Permission.MANAGE_STUDENT_SESSIONS);
      
      expect(mentorPermissions).not.toContain(Permission.BOOK_SESSION);
      expect(mentorPermissions).not.toContain(Permission.WRITE_REVIEWS);
    });

    it('should have correct permissions for admins', () => {
      const adminPermissions = ROLE_PERMISSIONS[Role.ADMIN];
      
      expect(adminPermissions).toContain(Permission.VIEW_ALL_USERS);
      expect(adminPermissions).toContain(Permission.MANAGE_USERS);
      expect(adminPermissions).toContain(Permission.VIEW_ALL_SESSIONS);
      expect(adminPermissions).toContain(Permission.MODERATE_REVIEWS);
      expect(adminPermissions).toContain(Permission.VIEW_ANALYTICS);
      
      expect(adminPermissions).not.toContain(Permission.DATABASE_ACCESS);
    });

    it('should have all permissions for super admin', () => {
      const superAdminPermissions = ROLE_PERMISSIONS[Role.SUPER_ADMIN];
      
      expect(superAdminPermissions).toContain(Permission.DATABASE_ACCESS);
      expect(superAdminPermissions).toContain(Permission.MANAGE_ADMINS);
      expect(superAdminPermissions).toContain(Permission.SYSTEM_SETTINGS);
      
      // Should include all admin permissions
      const adminPermissions = ROLE_PERMISSIONS[Role.ADMIN];
      adminPermissions.forEach(permission => {
        expect(superAdminPermissions).toContain(permission);
      });
    });
  });

  describe('PermissionChecker', () => {
    let studentContext: AccessContext;
    let mentorContext: AccessContext;
    let adminContext: AccessContext;
    let superAdminContext: AccessContext;

    beforeEach(() => {
      studentContext = {
        userId: 'student123',
        role: Role.STUDENT
      };

      mentorContext = {
        userId: 'mentor123',
        role: Role.MENTOR
      };

      adminContext = {
        userId: 'admin123',
        role: Role.ADMIN
      };

      superAdminContext = {
        userId: 'superadmin123',
        role: Role.SUPER_ADMIN
      };
    });

    describe('hasPermission', () => {
      it('should check student permissions correctly', () => {
        const checker = createPermissionChecker(studentContext);
        
        expect(checker.hasPermission(Permission.BOOK_SESSION)).toBe(true);
        expect(checker.hasPermission(Permission.WRITE_REVIEWS)).toBe(true);
        expect(checker.hasPermission(Permission.SET_AVAILABILITY)).toBe(false);
        expect(checker.hasPermission(Permission.MANAGE_USERS)).toBe(false);
      });

      it('should check mentor permissions correctly', () => {
        const checker = createPermissionChecker(mentorContext);
        
        expect(checker.hasPermission(Permission.SET_AVAILABILITY)).toBe(true);
        expect(checker.hasPermission(Permission.RESPOND_TO_REVIEWS)).toBe(true);
        expect(checker.hasPermission(Permission.BOOK_SESSION)).toBe(false);
        expect(checker.hasPermission(Permission.WRITE_REVIEWS)).toBe(false);
      });

      it('should check admin permissions correctly', () => {
        const checker = createPermissionChecker(adminContext);
        
        expect(checker.hasPermission(Permission.MANAGE_USERS)).toBe(true);
        expect(checker.hasPermission(Permission.VIEW_ALL_SESSIONS)).toBe(true);
        expect(checker.hasPermission(Permission.DATABASE_ACCESS)).toBe(false);
      });
    });

    describe('canPerform', () => {
      it('should allow students to create sessions', () => {
        const checker = createPermissionChecker(studentContext);
        
        expect(checker.canPerform(Action.CREATE, Resource.SESSION)).toBe(true);
        expect(checker.canPerform(Action.CREATE, Resource.REVIEW)).toBe(true);
        expect(checker.canPerform(Action.MANAGE, Resource.USER)).toBe(false);
      });

      it('should allow mentors to manage their sessions', () => {
        const checker = createPermissionChecker(mentorContext);
        
        expect(checker.canPerform(Action.UPDATE, Resource.SESSION)).toBe(true);
        expect(checker.canPerform(Action.READ, Resource.SESSION)).toBe(true);
        expect(checker.canPerform(Action.CREATE, Resource.SESSION)).toBe(false);
      });

      it('should allow admins to manage all resources', () => {
        const checker = createPermissionChecker(adminContext);
        
        expect(checker.canPerform(Action.MANAGE, Resource.USER)).toBe(true);
        expect(checker.canPerform(Action.READ, Resource.ANALYTICS)).toBe(true);
        expect(checker.canPerform(Action.MANAGE, Resource.PLATFORM)).toBe(true);
      });

      it('should allow super admin to do everything', () => {
        const checker = createPermissionChecker(superAdminContext);
        
        expect(checker.canPerform(Action.CREATE, Resource.USER)).toBe(true);
        expect(checker.canPerform(Action.DELETE, Resource.USER)).toBe(true);
        expect(checker.canPerform(Action.MANAGE, Resource.PLATFORM)).toBe(true);
        expect(checker.canPerform(Action.READ, Resource.ANALYTICS)).toBe(true);
      });
    });

    describe('canAccessOwnResource', () => {
      it('should allow access to own resources', () => {
        const checker = createPermissionChecker(studentContext);
        
        expect(checker.canAccessOwnResource('student123')).toBe(true);
        expect(checker.canAccessOwnResource('other123')).toBe(false);
      });
    });

    describe('resource-specific access control', () => {
      it('should control user access correctly', () => {
        const studentChecker = createPermissionChecker(studentContext);
        const adminChecker = createPermissionChecker(adminContext);
        
        // Students can read their own profile
        expect(studentChecker.canPerform(Action.READ, Resource.USER, 'student123')).toBe(true);
        expect(studentChecker.canPerform(Action.READ, Resource.USER, 'other123')).toBe(true); // Can view other profiles
        
        // Students cannot manage other users
        expect(studentChecker.canPerform(Action.MANAGE, Resource.USER)).toBe(false);
        
        // Admins can manage all users
        expect(adminChecker.canPerform(Action.MANAGE, Resource.USER)).toBe(true);
        expect(adminChecker.canPerform(Action.DELETE, Resource.USER)).toBe(false); // Only super admin can delete
      });

      it('should control session access correctly', () => {
        const studentChecker = createPermissionChecker(studentContext);
        const mentorChecker = createPermissionChecker(mentorContext);
        
        // Students can create sessions
        expect(studentChecker.canPerform(Action.CREATE, Resource.SESSION)).toBe(true);
        
        // Mentors cannot create sessions but can manage them
        expect(mentorChecker.canPerform(Action.CREATE, Resource.SESSION)).toBe(false);
        expect(mentorChecker.canPerform(Action.UPDATE, Resource.SESSION)).toBe(true);
      });

      it('should control review access correctly', () => {
        const studentChecker = createPermissionChecker(studentContext);
        const mentorChecker = createPermissionChecker(mentorContext);
        
        // Students can create and manage their own reviews
        expect(studentChecker.canPerform(Action.CREATE, Resource.REVIEW)).toBe(true);
        expect(studentChecker.canPerform(Action.UPDATE, Resource.REVIEW)).toBe(true);
        expect(studentChecker.canPerform(Action.DELETE, Resource.REVIEW)).toBe(true);
        
        // Mentors can respond to reviews but not create them
        expect(mentorChecker.canPerform(Action.CREATE, Resource.REVIEW)).toBe(false);
        expect(mentorChecker.canPerform(Action.UPDATE, Resource.REVIEW)).toBe(true); // Can respond
      });

      it('should control payment access correctly', () => {
        const studentChecker = createPermissionChecker(studentContext);
        const adminChecker = createPermissionChecker(adminContext);
        
        // Students can make payments
        expect(studentChecker.canPerform(Action.CREATE, Resource.PAYMENT)).toBe(true);
        expect(studentChecker.canPerform(Action.READ, Resource.PAYMENT)).toBe(true);
        
        // Admins can manage all payments
        expect(adminChecker.canPerform(Action.MANAGE, Resource.PAYMENT)).toBe(true);
      });

      it('should control analytics access correctly', () => {
        const studentChecker = createPermissionChecker(studentContext);
        const mentorChecker = createPermissionChecker(mentorContext);
        const adminChecker = createPermissionChecker(adminContext);
        
        // Students cannot access analytics
        expect(studentChecker.canPerform(Action.READ, Resource.ANALYTICS)).toBe(false);
        
        // Mentors can access their own analytics
        expect(mentorChecker.canPerform(Action.READ, Resource.ANALYTICS)).toBe(true);
        
        // Admins can access all analytics
        expect(adminChecker.canPerform(Action.READ, Resource.ANALYTICS)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined context gracefully', () => {
      const context: AccessContext = {
        userId: '',
        role: Role.STUDENT
      };
      
      const checker = createPermissionChecker(context);
      expect(checker.canAccessOwnResource('')).toBe(true);
    });

    it('should handle invalid permissions', () => {
      const checker = createPermissionChecker({
        userId: 'user123',
        role: Role.STUDENT
      });
      
      // Should return false for permissions not assigned to the role
      expect(checker.hasPermission(Permission.DATABASE_ACCESS)).toBe(false);
    });

    it('should handle resource access without resourceId', () => {
      const checker = createPermissionChecker({
        userId: 'user123',
        role: Role.ADMIN
      });
      
      // Should still work for general resource access
      expect(checker.canPerform(Action.READ, Resource.USER)).toBe(true);
    });
  });
});