import type { PageRequest, PageResponse } from '@vben/request';
import type { RouteRecordStringComponent } from '@vben/types';

import { fullResponseClient, requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';

export namespace MenuApi {
  /** 菜单分页查询参数 */
  export interface MenuPage extends PageRequest {
    systemId?: string;
    parentId?: string;
    code?: string;
    name?: string;
    router?: string;
    component?: string;
    icon?: string;
    status?: boolean;
    visible?: boolean;
  }

  /** 菜单数据 */
  export interface Menu {
    id: string;
    systemId: string;
    parentId?: string;
    code: string;
    name: string;
    icon?: string;
    router?: string;
    component?: string;
    visible: boolean;
    status: boolean;
  }

  /** 菜单分页查询返回值 */
  export type MenuPageResult = PageResponse<Menu>;
}

/**
 * 获取菜单分页数据
 */
export async function getMenuPage(
  params: MenuApi.MenuPage,
): Promise<MenuApi.MenuPageResult> {
  return requestClient.post<MenuApi.MenuPageResult>(
    `${IAM_API_PREFIX}/menu/page`,
    params,
  );
}

/**
 * 创建或更新菜单
 * 如果 data 中包含 id，则为更新；否则为新增
 * 使用 fullResponseClient 返回完整的响应对象（包括 code 和 msg）
 */
export async function addOrModifyMenu(
  data: MenuApi.Menu | Partial<MenuApi.Menu>,
): Promise<{ code: number | string; data?: any; msg: string }> {
  // 使用 fullResponseClient 获取完整响应（包括 code 和 msg）
  const response = await fullResponseClient.post<{
    code: number | string;
    data?: any;
    msg: string;
  }>(`${IAM_API_PREFIX}/menu/addOrModify`, data);

  // fullResponseClient 返回的是 AxiosResponse，需要提取 data
  return response;
}

/**
 * 获取菜单详情
 * 使用 POST 请求，在 body 中传递 id
 * requestClient 配置了 responseReturn: 'data'，成功时返回 data 字段的值
 */
export async function getMenuDetail(
  id: string | { id: string },
): Promise<MenuApi.Menu> {
  // 如果传入的是字符串，转换为对象；如果已经是对象，直接使用
  const requestData = typeof id === 'string' ? { id } : id;
  return requestClient.post<MenuApi.Menu>(
    `${IAM_API_PREFIX}/menu/detail`,
    requestData,
  );
}

/**
 * 删除菜单
 * 使用 DELETE 请求，在 URL 中传递 id
 * 使用 fullResponseClient 返回完整的响应对象（包括 code 和 msg）
 */
export async function deleteMenu(
  id: string,
): Promise<{ code: number | string; data?: any; msg: string }> {
  // 使用 fullResponseClient 获取完整响应（包括 code 和 msg）
  const response = await fullResponseClient.delete<{
    code: number | string;
    data?: any;
    msg: string;
  }>(`${IAM_API_PREFIX}/menu/delete/${id}`);

  // fullResponseClient 返回的是 AxiosResponse，需要提取 data
  return response;
}

/**
 * 获取用户所有菜单（保留原有接口）
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}

/**
 * 获取菜单树（用于父菜单选择）
 * 返回树形结构的菜单列表
 */
export async function getMenuTree(systemId?: string): Promise<MenuApi.Menu[]> {
  const params = systemId ? { systemId } : {};
  return requestClient.post<MenuApi.Menu[]>(
    `${IAM_API_PREFIX}/menu/tree`,
    params,
  );
}
