import type { PageRequest, PageResponse } from '@vben/request';

import { requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';

export namespace RoleApi {
  /** 角色分页查询参数 */
  export interface RolePage extends PageRequest {
    code?: string;
    description?: string;
    status?: boolean;
  }

  /** 角色数据 */
  export interface Role {
    id: string;
    code: string;
    description?: string;
    status: boolean;
  }

  /** 角色分页查询返回值 */
  export type RolePageResult = PageResponse<Role>;
}

/**
 * 获取角色分页数据
 */
export async function getRolePage(
  params: RoleApi.RolePage,
): Promise<RoleApi.RolePageResult> {
  return requestClient.post<RoleApi.RolePageResult>(
    `${IAM_API_PREFIX}/role/page`,
    params,
  );
}

/**
 * 创建或更新角色
 * 如果 data 中包含 id，则为更新；否则为新增
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function addOrModifyRole(
  data: RoleApi.Role | Partial<RoleApi.Role>,
): Promise<any> {
  return requestClient.post<any>(`${IAM_API_PREFIX}/role/addOrModify`, data);
}

/**
 * 获取角色详情
 * 使用 POST 请求，在 body 中传递 id
 * requestClient 配置了 responseReturn: 'data'，成功时返回 data 字段的值
 */
export async function getRoleDetail(
  id: string | { id: string },
): Promise<RoleApi.Role> {
  // 如果传入的是字符串，转换为对象；如果已经是对象，直接使用
  const requestData = typeof id === 'string' ? { id } : id;
  return requestClient.post<RoleApi.Role>(
    `${IAM_API_PREFIX}/role/detail`,
    requestData,
  );
}

/**
 * 删除角色
 * 使用 DELETE 请求，在 URL 中传递 id
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function deleteRole(id: string): Promise<any> {
  return requestClient.delete<any>(`${IAM_API_PREFIX}/role/delete/${id}`);
}

/**
 * 获取角色已分配的权限ID列表
 * 接口路径：GET /iam/role/{roleId}/permissionIds
 * 请求参数：roleId（路径参数）
 * 返回：{ systemIds: string[], menuIds: string[], resourceIds: string[] }
 * 
 * 用于获取角色已分配的系统ID、菜单ID和资源ID列表，用于标记选中状态
 * 
 * 注意：系统、菜单、资源是三级联动关系
 * 
 * 开发环境 Mock：
 * - 方式1：设置环境变量 VITE_USE_MOCK=true 或 VITE_USE_MOCK_PERMISSION_API=true
 * - 方式2：开发环境默认使用 Mock（如果后端不可用）
 */
export async function getRolePermissionIds(roleId: string): Promise<{
  systemIds: string[];
  menuIds: string[];
  resourceIds: string[];
}> {
  // 开发环境使用 Mock 数据（可通过环境变量控制）
  const useMock = import.meta.env.DEV && (
    import.meta.env.VITE_USE_MOCK === 'true' || 
    import.meta.env.VITE_USE_MOCK === '1' ||
    import.meta.env.VITE_USE_MOCK_PERMISSION_API === 'true' ||
    import.meta.env.VITE_USE_MOCK_PERMISSION_API === '1'
  );
  
  if (useMock) {
    const { mockPermissionApi } = await import('./mock/permission');
    return mockPermissionApi.getRolePermissionIds(roleId);
  }
  
  // 尝试调用真实 API，如果失败则降级到 Mock（仅开发环境）
  if (import.meta.env.DEV) {
    try {
      return await requestClient.get<{ systemIds: string[]; menuIds: string[]; resourceIds: string[] }>(
        `${IAM_API_PREFIX}/role/${roleId}/permissionIds`,
      );
    } catch (error) {
      console.warn('[getRolePermissionIds] 后端 API 调用失败，降级到 Mock 数据:', error);
      const { mockPermissionApi } = await import('./mock/permission');
      return mockPermissionApi.getRolePermissionIds(roleId);
    }
  }
  
  return requestClient.get<{ systemIds: string[]; menuIds: string[]; resourceIds: string[] }>(
    `${IAM_API_PREFIX}/role/${roleId}/permissionIds`,
  );
}

