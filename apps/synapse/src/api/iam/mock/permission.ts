/**
 * 权限分配 Mock 数据
 * 用于前端开发和测试
 */

import type { SystemApi } from '../system';
import type { MenuApi } from '../menu';
import type { ResourceApi } from '../resource';

// Mock 系统数据
export const mockSystems: SystemApi.System[] = [
  {
    id: 'sys-001',
    code: 'SYSTEM_MANAGE',
    name: '系统管理',
    status: true,
    sorted: 1,
  },
  {
    id: 'sys-002',
    code: 'USER_MANAGE',
    name: '用户管理',
    status: true,
    sorted: 2,
  },
  {
    id: 'sys-003',
    code: 'ORDER_MANAGE',
    name: '订单管理',
    status: true,
    sorted: 3,
  },
];

// Mock 菜单数据（树形结构，支持两级）
export const mockMenuTree: MenuApi.MenuTree[] = [
  // 系统1的菜单
  {
    id: 'menu-001',
    systemId: 'sys-001',
    parentId: undefined,
    code: 'SYSTEM_CONFIG',
    name: '系统配置',
    icon: 'mdi:cog',
    router: '/system/config',
    component: 'SystemConfig',
    visible: true,
    status: true,
    sorted: 1,
    children: [
      {
        id: 'menu-002',
        systemId: 'sys-001',
        parentId: 'menu-001',
        code: 'SYSTEM_CONFIG_BASIC',
        name: '基础配置',
        icon: undefined,
        router: '/system/config/basic',
        component: 'SystemConfigBasic',
        visible: true,
        status: true,
        sorted: 1,
        children: [],
      },
      {
        id: 'menu-003',
        systemId: 'sys-001',
        parentId: 'menu-001',
        code: 'SYSTEM_CONFIG_ADVANCED',
        name: '高级配置',
        icon: undefined,
        router: '/system/config/advanced',
        component: 'SystemConfigAdvanced',
        visible: true,
        status: true,
        sorted: 2,
        children: [],
      },
    ],
  },
  {
    id: 'menu-004',
    systemId: 'sys-001',
    parentId: undefined,
    code: 'ROLE_MANAGE',
    name: '角色管理',
    icon: 'mdi:account-group',
    router: '/system/role',
    component: 'RoleManage',
    visible: true,
    status: true,
    sorted: 2,
    children: [],
  },
  // 系统2的菜单
  {
    id: 'menu-005',
    systemId: 'sys-002',
    parentId: undefined,
    code: 'USER_LIST',
    name: '用户列表',
    icon: 'mdi:account',
    router: '/user/list',
    component: 'UserList',
    visible: true,
    status: true,
    sorted: 1,
    children: [
      {
        id: 'menu-006',
        systemId: 'sys-002',
        parentId: 'menu-005',
        code: 'USER_LIST_ACTIVE',
        name: '活跃用户',
        icon: undefined,
        router: '/user/list/active',
        component: 'UserListActive',
        visible: true,
        status: true,
        sorted: 1,
        children: [],
      },
    ],
  },
  {
    id: 'menu-007',
    systemId: 'sys-002',
    parentId: undefined,
    code: 'USER_PROFILE',
    name: '用户资料',
    icon: 'mdi:account-card',
    router: '/user/profile',
    component: 'UserProfile',
    visible: true,
    status: true,
    sorted: 2,
    children: [],
  },
  // 系统3的菜单
  {
    id: 'menu-008',
    systemId: 'sys-003',
    parentId: undefined,
    code: 'ORDER_LIST',
    name: '订单列表',
    icon: 'mdi:format-list-bulleted',
    router: '/order/list',
    component: 'OrderList',
    visible: true,
    status: true,
    sorted: 1,
    children: [],
  },
];

// Mock 资源数据（按菜单组织）
export const mockResources: Record<string, ResourceApi.Resource[]> = {
  // menu-002 的资源
  'menu-002': [
    {
      id: 'res-001',
      systemId: 'sys-001',
      menuId: 'menu-002',
      code: 'system:config:basic:view',
      name: '查看基础配置',
      type: 'BUTTON',
      description: '查看基础配置按钮权限',
      status: true,
      sorted: 1,
    },
    {
      id: 'res-002',
      systemId: 'sys-001',
      menuId: 'menu-002',
      code: 'system:config:basic:edit',
      name: '编辑基础配置',
      type: 'BUTTON',
      description: '编辑基础配置按钮权限',
      status: true,
      sorted: 2,
    },
    {
      id: 'res-003',
      systemId: 'sys-001',
      menuId: 'menu-002',
      code: 'api:system:config:basic:get',
      name: '/api/system/config/basic',
      type: 'API',
      description: '获取基础配置接口',
      status: true,
      sorted: 3,
    },
  ],
  // menu-003 的资源
  'menu-003': [
    {
      id: 'res-004',
      systemId: 'sys-001',
      menuId: 'menu-003',
      code: 'system:config:advanced:view',
      name: '查看高级配置',
      type: 'BUTTON',
      description: '查看高级配置按钮权限',
      status: true,
      sorted: 1,
    },
    {
      id: 'res-005',
      systemId: 'sys-001',
      menuId: 'menu-003',
      code: 'api:system:config:advanced:update',
      name: '/api/system/config/advanced/update',
      type: 'API',
      description: '更新高级配置接口',
      status: true,
      sorted: 2,
    },
  ],
  // menu-004 的资源
  'menu-004': [
    {
      id: 'res-006',
      systemId: 'sys-001',
      menuId: 'menu-004',
      code: 'role:add',
      name: '新增角色',
      type: 'BUTTON',
      description: '新增角色按钮权限',
      status: true,
      sorted: 1,
    },
    {
      id: 'res-007',
      systemId: 'sys-001',
      menuId: 'menu-004',
      code: 'role:edit',
      name: '编辑角色',
      type: 'BUTTON',
      description: '编辑角色按钮权限',
      status: true,
      sorted: 2,
    },
    {
      id: 'res-008',
      systemId: 'sys-001',
      menuId: 'menu-004',
      code: 'role:delete',
      name: '删除角色',
      type: 'BUTTON',
      description: '删除角色按钮权限',
      status: true,
      sorted: 3,
    },
    {
      id: 'res-009',
      systemId: 'sys-001',
      menuId: 'menu-004',
      code: 'api:role:list',
      name: '/api/role/list',
      type: 'API',
      description: '获取角色列表接口',
      status: true,
      sorted: 4,
    },
  ],
  // menu-005 的资源
  'menu-005': [
    {
      id: 'res-010',
      systemId: 'sys-002',
      menuId: 'menu-005',
      code: 'user:add',
      name: '新增用户',
      type: 'BUTTON',
      description: '新增用户按钮权限',
      status: true,
      sorted: 1,
    },
    {
      id: 'res-011',
      systemId: 'sys-002',
      menuId: 'menu-005',
      code: 'user:edit',
      name: '编辑用户',
      type: 'BUTTON',
      description: '编辑用户按钮权限',
      status: true,
      sorted: 2,
    },
    {
      id: 'res-012',
      systemId: 'sys-002',
      menuId: 'menu-005',
      code: 'api:user:list',
      name: '/api/user/list',
      type: 'API',
      description: '获取用户列表接口',
      status: true,
      sorted: 3,
    },
  ],
  // menu-006 的资源
  'menu-006': [
    {
      id: 'res-013',
      systemId: 'sys-002',
      menuId: 'menu-006',
      code: 'user:active:view',
      name: '查看活跃用户',
      type: 'BUTTON',
      description: '查看活跃用户按钮权限',
      status: true,
      sorted: 1,
    },
  ],
  // menu-007 的资源
  'menu-007': [
    {
      id: 'res-014',
      systemId: 'sys-002',
      menuId: 'menu-007',
      code: 'user:profile:edit',
      name: '编辑用户资料',
      type: 'BUTTON',
      description: '编辑用户资料按钮权限',
      status: true,
      sorted: 1,
    },
  ],
  // menu-008 的资源
  'menu-008': [
    {
      id: 'res-015',
      systemId: 'sys-003',
      menuId: 'menu-008',
      code: 'order:view',
      name: '查看订单',
      type: 'BUTTON',
      description: '查看订单按钮权限',
      status: true,
      sorted: 1,
    },
    {
      id: 'res-016',
      systemId: 'sys-003',
      menuId: 'menu-008',
      code: 'order:cancel',
      name: '取消订单',
      type: 'BUTTON',
      description: '取消订单按钮权限',
      status: true,
      sorted: 2,
    },
    {
      id: 'res-017',
      systemId: 'sys-003',
      menuId: 'menu-008',
      code: 'api:order:list',
      name: '/api/order/list',
      type: 'API',
      description: '获取订单列表接口',
      status: true,
      sorted: 3,
    },
  ],
};

// Mock 角色权限ID（用于反显）
export const mockRolePermissionIds: Record<string, {
  systemIds: string[];
  menuIds: string[];
  resourceIds: string[];
}> = {
  // 1986713754259144705 的权限（部分选中）
  '1986713754259144705': {
    systemIds: ['sys-001', 'sys-002'], // 选中了系统1和系统2
    menuIds: ['menu-001', 'menu-002', 'menu-004', 'menu-005'], // 选中了部分菜单
    resourceIds: ['res-001', 'res-002', 'res-006', 'res-007', 'res-010'], // 选中了部分资源
  },
  // role-002 的权限（全选系统1）
  'role-002': {
    systemIds: ['sys-001'],
    menuIds: ['menu-001', 'menu-002', 'menu-003', 'menu-004'],
    resourceIds: [
      'res-001',
      'res-002',
      'res-003',
      'res-004',
      'res-005',
      'res-006',
      'res-007',
      'res-008',
      'res-009',
    ],
  },
  // role-003 的权限（空权限）
  'role-003': {
    systemIds: [],
    menuIds: [],
    resourceIds: [],
  },
};

/**
 * 延迟函数（模拟网络请求）
 */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock API 函数
 */
export const mockPermissionApi = {
  /**
   * Mock 获取系统列表
   */
  async getSystemList(): Promise<SystemApi.System[]> {
    await delay(200);
    return [...mockSystems];
  },

  /**
   * Mock 获取菜单树
   */
  async getMenuTree(systemId?: string): Promise<MenuApi.MenuTree[]> {
    await delay(500);
    if (systemId) {
      // 返回指定系统的菜单
      return mockMenuTree.filter((menu) => menu.systemId === systemId);
    }
    // 返回所有菜单
    return [...mockMenuTree];
  },

  /**
   * Mock 获取资源列表
   */
  async getResourcesByMenuId(menuId: string): Promise<ResourceApi.Resource[]> {
    await delay(300);
    return mockResources[menuId] || [];
  },

  /**
   * Mock 获取角色权限ID
   */
  async getRolePermissionIds(roleId: string): Promise<{
    systemIds: string[];
    menuIds: string[];
    resourceIds: string[];
  }> {
    await delay(200);
    console.log('[Mock] getRolePermissionIds called with roleId:', roleId);
    console.log('[Mock] Available roleIds in mock data:', Object.keys(mockRolePermissionIds));
    
    // 如果直接匹配，返回对应数据
    if (mockRolePermissionIds[roleId]) {
      console.log('[Mock] Found exact match for roleId:', roleId);
      return mockRolePermissionIds[roleId];
    }
    
    // 如果没有匹配，使用第一个有权限的角色作为默认（用于测试）
    // 或者可以根据 roleId 的某些特征来映射
    const defaultRoleId = '1986713754259144705';
    console.log('[Mock] No match found, using default roleId:', defaultRoleId);
    return mockRolePermissionIds[defaultRoleId] || {
      systemIds: [],
      menuIds: [],
      resourceIds: [],
    };
  },

  /**
   * Mock 保存角色权限
   */
  async assignRolePermissions(
    roleId: string,
    data: {
      systemIds: string[];
      menuIds: string[];
      resourceIds: string[];
    },
  ): Promise<void> {
    await delay(500);
    // 更新 mock 数据
    mockRolePermissionIds[roleId] = {
      systemIds: data.systemIds,
      menuIds: data.menuIds,
      resourceIds: data.resourceIds,
    };
    console.log('[Mock] 保存角色权限:', { roleId, ...data });
  },
};

