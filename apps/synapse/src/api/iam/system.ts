import type { PageRequest, PageResponse } from '@vben/request';

import { requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';

export namespace SystemApi {
  /** 系统分页查询参数 */
  export interface SystemPage extends PageRequest {
    code?: string;
    name?: string;
    status?: boolean;
  }

  /** 系统数据 */
  export interface System {
    id: string;
    code: string;
    name: string;
    status: boolean;
    sorted: number;
  }

  /** 系统分页查询返回值 */
  export type SystemPageResult = PageResponse<System>;
}

/**
 * 获取系统分页数据
 */
export async function getPage(
  params: SystemApi.SystemPage,
): Promise<SystemApi.SystemPageResult> {
  return requestClient.post<SystemApi.SystemPageResult>(
    `${IAM_API_PREFIX}/system/page`,
    params,
  );
}

/**
 * 创建或更新系统
 * 如果 data 中包含 id，则为更新；否则为新增
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function addOrModifySystem(
  data: Partial<SystemApi.System> | SystemApi.System,
): Promise<any> {
  return requestClient.post<any>(`${IAM_API_PREFIX}/system/addOrModify`, data);
}

/**
 * 获取系统详情
 * 使用 POST 请求，在 body 中传递 id
 * requestClient 配置了 responseReturn: 'data'，成功时返回 data 字段的值
 */
export async function getSystemDetail(
  id: string | { id: string },
): Promise<SystemApi.System> {
  // 如果传入的是字符串，转换为对象；如果已经是对象，直接使用
  const requestData = typeof id === 'string' ? { id } : id;
  return requestClient.post<SystemApi.System>(
    `${IAM_API_PREFIX}/system/detail`,
    requestData,
  );
}

/**
 * 删除系统
 * 使用 DELETE 请求，在 URL 中传递 id
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function deleteSystem(id: string): Promise<any> {
  return requestClient.delete<any>(`${IAM_API_PREFIX}/system/delete/${id}`);
}

/**
 * 获取所有系统列表（用于下拉选择）
 * 返回启用状态的系统列表
 */
export async function getAllSystems(): Promise<SystemApi.System[]> {
  return requestClient
    .post<SystemApi.SystemPageResult>(`${IAM_API_PREFIX}/system/page`, {
      status: true,
      pageSize: 1000,
      pageNum: 1,
    })
    .then((res) => res.records || []);
}

/**
 * 获取系统列表（用于权限分配）
 * 接口路径：GET /iam/system/list
 * 返回所有启用状态的系统列表
 * 
 * 开发环境 Mock：
 * - 方式1：设置环境变量 VITE_USE_MOCK=true 或 VITE_USE_MOCK_PERMISSION_API=true
 * - 方式2：开发环境默认使用 Mock（如果后端不可用）
 */
export async function getSystemList(): Promise<SystemApi.System[]> {
  // 开发环境使用 Mock 数据（可通过环境变量控制）
  const useMock = import.meta.env.DEV && (
    import.meta.env.VITE_USE_MOCK === 'true' || 
    import.meta.env.VITE_USE_MOCK === '1' ||
    import.meta.env.VITE_USE_MOCK_PERMISSION_API === 'true' ||
    import.meta.env.VITE_USE_MOCK_PERMISSION_API === '1'
  );
  
  if (useMock) {
    const { mockPermissionApi } = await import('./mock/permission');
    return mockPermissionApi.getSystemList();
  }
  
  // 尝试调用真实 API，如果失败则降级到 Mock（仅开发环境）
  if (import.meta.env.DEV) {
    try {
      return await requestClient.post<SystemApi.System[]>(`${IAM_API_PREFIX}/system/list`, {});
    } catch (error) {
      console.warn('[getSystemList] 后端 API 调用失败，降级到 Mock 数据:', error);
      const { mockPermissionApi } = await import('./mock/permission');
      return mockPermissionApi.getSystemList();
    }
  }
  
  return requestClient.post<SystemApi.System[]>(`${IAM_API_PREFIX}/system/list`, {});
}
