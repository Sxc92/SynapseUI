import type { PageRequest, PageResponse } from '@vben/request';

import { fullResponseClient, requestClient } from '#/api/request';

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
 * 使用 fullResponseClient 返回完整的响应对象（包括 code 和 msg）
 */
export async function addOrModifySystem(
  data: SystemApi.System | Partial<SystemApi.System>,
): Promise<{ code: string | number; msg: string; data?: any }> {
  // 使用 fullResponseClient 获取完整响应（包括 code 和 msg）
  const response = await fullResponseClient.post<{
    code: string | number;
    msg: string;
    data?: any;
  }>(`${IAM_API_PREFIX}/system/addOrModify`, data);
  
  // fullResponseClient 返回的是 AxiosResponse，需要提取 data
  return response;
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
 * 使用 POST 请求，在 body 中传递 id 数组
 * 使用 fullResponseClient 返回完整的响应对象（包括 code 和 msg）
 */
export async function deleteSystem(
  id: string,
): Promise<{ code: string | number; msg: string; data?: any }> {
  // 使用 fullResponseClient 获取完整响应（包括 code 和 msg）
  const response = await fullResponseClient.delete<{
    code: string | number;
    msg: string;
    data?: any;
  }>(`${IAM_API_PREFIX}/system/delete/${id}`);
  
  // fullResponseClient 返回的是 AxiosResponse，需要提取 data
  return response;
}

/**
 * 获取所有系统列表（用于下拉选择）
 * 返回启用状态的系统列表
 */
export async function getAllSystems(): Promise<SystemApi.System[]> {
  return requestClient.post<SystemApi.SystemPageResult>(
    `${IAM_API_PREFIX}/system/page`,
    { status: true, pageSize: 1000, pageNum: 1 },
  ).then((res) => res.records || []);
}

