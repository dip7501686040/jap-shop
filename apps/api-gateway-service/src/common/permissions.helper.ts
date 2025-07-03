export interface UserMenu {
  id: string;
  name: string;
  href: string;
  icon: string;
  order: number;
  isActive: boolean;
  canAdd: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export type UserMenus = UserMenu[];

export interface RolePermissions {
  [key: string]: boolean;
}

export interface MenuPermissions {
  [key: string]: {
    canAdd: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export function transformUserMenus(user: any): UserMenus {
  const menus: UserMenus = [];

  if (user?.role?.roleMenus) {
    for (const roleMenu of user.role.roleMenus) {
      const menu = roleMenu.menu;
      menus.push({
        id: menu.id,
        name: menu.name,
        href: menu.href,
        icon: menu.icon,
        order: menu.order,
        isActive: menu.isActive,
        canAdd: roleMenu.canAdd,
        canRead: roleMenu.canRead,
        canUpdate: roleMenu.canUpdate,
        canDelete: roleMenu.canDelete,
      });
    }
  }

  // Sort by order
  menus.sort((a, b) => a.order - b.order);

  return menus;
}

export function transformToRolePermissions(user: any): RolePermissions {
  const permissions: RolePermissions = {};

  if (user?.role?.roleMenus) {
    for (const roleMenu of user.role.roleMenus) {
      const menu = roleMenu.menu;
      // Extract permission name from href (e.g., '/dashboard/customers' -> 'customers')
      const permissionName = extractPermissionNameFromHref(menu.href);
      // Use canRead to determine if the menu is accessible
      permissions[permissionName] = roleMenu.canRead && menu.isActive;
    }
  }

  return permissions;
}

export function transformToMenuPermissions(user: any): MenuPermissions {
  const permissions: MenuPermissions = {};

  if (user?.role?.roleMenus) {
    for (const roleMenu of user.role.roleMenus) {
      const menu = roleMenu.menu;
      const permissionName = extractPermissionNameFromHref(menu.href);
      permissions[permissionName] = {
        canAdd: roleMenu.canAdd,
        canRead: roleMenu.canRead,
        canUpdate: roleMenu.canUpdate,
        canDelete: roleMenu.canDelete,
      };
    }
  }

  return permissions;
}

function extractPermissionNameFromHref(href: string): string {
  // Handle different href patterns
  if (href === '/dashboard') {
    return 'dashboard';
  }

  // For paths like '/dashboard/customers', extract 'customers'
  const pathParts = href.split('/');
  if (pathParts.length >= 3 && pathParts[1] === 'dashboard') {
    return pathParts[2];
  }

  // For other patterns, use the last part or the full href without slashes
  return pathParts[pathParts.length - 1] || href.replace(/\//g, '');
}

export function getUserMenusForRole(user: any): string[] {
  const menus = transformUserMenus(user);
  return menus
    .filter((menu) => menu.isActive && menu.canRead)
    .map((menu) => menu.href);
}

export function getUserPermissionForMenu(
  user: any,
  menuName: string,
): {
  canAdd: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
} {
  const permissions = transformToMenuPermissions(user);
  return (
    permissions[menuName] || {
      canAdd: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
    }
  );
}
