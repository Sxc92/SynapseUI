import type { PageRequest, PageResponse } from '@vben/request';

import { requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';

export namespace ResourceApi {
  /** 资源分页查询参数 */
  export interface ResourcePage extends PageRequest {
    systemId?: string;
    menuId?: string;
    code?: string;
    name?: string;
    type?: string;
    status?: boolean;
  }

  /** 资源数据 */
  export interface Resource {
    id: string;
    systemId: string;
    menuId?: string;
    code: string;
    name: string;
    type: string; // API、BUTTON
    description?: string;
    permissions?: string; // 权限编码（accessCodes）
    status: boolean;
    sorted?: number; // 排序号（可选）
  }

  /** 资源分页查询返回值 */
  export type ResourcePageResult = PageResponse<Resource>;
}

/**
 * 获取资源分页数据
 */
export async function getResourcePage(
  params: ResourceApi.ResourcePage,
): Promise<ResourceApi.ResourcePageResult> {
  return requestClient.post<ResourceApi.ResourcePageResult>(
    `${IAM_API_PREFIX}/resource/page`,
    params,
  );
}

/**
 * 创建或更新资源
 * 如果 data 中包含 id，则为更新；否则为新增
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function addOrModifyResource(
  data: ResourceApi.Resource | Partial<ResourceApi.Resource>,
): Promise<any> {
  return requestClient.post<any>(`${IAM_API_PREFIX}/resource/addOrModify`, data);
}

/**
 * 获取资源详情
 * 使用 POST 请求，在 body 中传递 id
 * requestClient 配置了 responseReturn: 'data'，成功时返回 data 字段的值
 */
export async function getResourceDetail(
  id: string | { id: string },
): Promise<ResourceApi.Resource> {
  // 如果传入的是字符串，转换为对象；如果已经是对象，直接使用
  const requestData = typeof id === 'string' ? { id } : id;
  return requestClient.post<ResourceApi.Resource>(
    `${IAM_API_PREFIX}/resource/detail`,
    requestData,
  );
}

/**
 * 删除资源
 * 使用 DELETE 请求，在 URL 中传递 id
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function deleteResource(id: string): Promise<any> {
  return requestClient.delete<any>(`${IAM_API_PREFIX}/resource/delete/${id}`);
}

/**
 * 获取资源列表（根据菜单ID）
 * 
 * 开发环境 Mock：设置 VITE_USE_MOCK=true 或直接修改条件判断启用
 */
export async function getResourcesByMenuId(
  menuId: string,
): Promise<ResourceApi.Resource[]> {
  // 开发环境使用 Mock 数据（可通过环境变量 VITE_USE_MOCK 控制）
  const useMock = import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === '1');
  if (useMock) {
    const { mockPermissionApi } = await import('./mock/permission');
    return mockPermissionApi.getResourcesByMenuId(menuId);
  }
  return requestClient.post<ResourceApi.Resource[]>(
    `${IAM_API_PREFIX}/resource/list`,
    { menuId },
  );
}

/**
 * 权限树节点基础接口
 */
interface BasePermissionTreeNode {
  id: string;
  name: string;
  selected?: boolean; // 是否被选中
  children?: PermissionTreeNode[];
}

/**
 * 权限树节点类型（联合类型）
 * 通过 type 字段区分是 system、menu 还是 resource
 * 后端返回结构：systemId 作为根，下挂 menuId，再下挂 resource
 */
export type PermissionTreeNode =
  | (BasePermissionTreeNode & { type: 'system'; systemId: string })
  | (BasePermissionTreeNode & { type: 'menu'; menuId: string })
  | (BasePermissionTreeNode & {
      type: 'resource';
      resourceId: string;
      resourceType: 'API' | 'BUTTON'; // 资源类型：'API' 表示接口权限，'BUTTON' 表示按钮权限
      code?: string; // 权限编码（可选）
    });

/**
 * 系统权限节点类型
 */
export type SystemPermissionNode = Extract<PermissionTreeNode, { type: 'system' }>;

/**
 * 菜单权限节点类型
 */
export type MenuPermissionNode = Extract<PermissionTreeNode, { type: 'menu' }>;

/**
 * 资源权限节点类型
 */
export type ResourcePermissionNode = Extract<PermissionTreeNode, { type: 'resource' }>;

/**
 * 获取角色已分配的权限（菜单和资源）
 * 
 * 接口路径：POST ${IAM_API_PREFIX}/role/permissions
 * 请求参数：{ roleId: string }
 * 
 * 接口返回数据结构（树形结构，可能多棵树）：
 * [
 *   {
 *     type: 'system',        // 节点类型，固定值 'system'
 *     id: string,           // 系统ID（与 systemId 相同）
 *     name: string,          // 系统名称
 *     systemId: string,     // 系统ID（必填）
 *     selected: boolean,     // 是否已分配给该角色（系统节点通常为 false，因为系统不直接分配）
 *     children: [            // 菜单节点数组（可选）
 *       {
 *         type: 'menu',      // 节点类型，固定值 'menu'
 *         id: string,        // 菜单ID（与 menuId 相同）
 *         name: string,       // 菜单名称
 *         menuId: string,    // 菜单ID（必填）
 *         selected: boolean,  // 是否已分配给该角色
 *         children: [         // 子菜单或资源节点数组（可选，支持多级菜单）
 *           {
 *             type: 'menu',   // 子菜单节点
 *             id: string,
 *             name: string,
 *             menuId: string,
 *             selected: boolean,
 *             children: [...]  // 可以继续嵌套子菜单或资源
 *           },
 *           {
 *             type: 'resource', // 资源节点
 *             id: string,     // 资源ID（与 resourceId 相同）
 *             name: string,   // 资源名称
 *             resourceId: string, // 资源ID（必填）
 *             resourceType: 'API' | 'BUTTON', // 资源类型（必填）：'API' 表示接口权限，'BUTTON' 表示按钮权限
 *             code: string,   // 权限编码（可选，用于显示）
 *             selected: boolean // 是否已分配给该角色
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   ... // 可能有多棵树（多个系统）
 * ]
 * 
 * 注意事项：
 * 1. 树形结构：system -> menu -> resource，支持多级菜单嵌套
 * 2. 每个节点必须包含 type 字段用于区分节点类型（'system' | 'menu' | 'resource'）
 * 3. selected 字段表示该权限是否已分配给当前角色
 * 4. 资源节点必须包含 resourceType 字段（'API' | 'BUTTON'）用于前端分类显示
 * 5. 资源节点的 code 字段用于显示权限编码（可选）
 */
export async function getRolePermissions(
  roleId: string,
): Promise<PermissionTreeNode[]> {
  return requestClient.post<PermissionTreeNode[]>(
    `${IAM_API_PREFIX}/role/permissions`,
    { roleId },
  );
}

/**
 * 分配角色权限
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 * 
 * 注意：系统、菜单、资源是三级联动关系
 * - 如果分配了菜单，必须分配其所属的系统
 * - 如果分配了资源，必须分配其所属的菜单和系统
 * 
 * 开发环境 Mock：设置 VITE_USE_MOCK=true 或直接修改条件判断启用
 */
export async function assignRolePermissions(
  roleId: string,
  data: {
    systemIds: string[];
    menuIds: string[];
    resourceIds: string[];
  },
): Promise<any> {
  // 开发环境使用 Mock 数据（可通过环境变量 VITE_USE_MOCK 控制）
  const useMock = import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === '1');
  if (useMock) {
    const { mockPermissionApi } = await import('./mock/permission');
    await mockPermissionApi.assignRolePermissions(roleId, data);
    return { success: true };
  }
  return requestClient.post<any>(`${IAM_API_PREFIX}/role/assignPermissions/${roleId}`, {
    ...data,
  });
}

