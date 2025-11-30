import type { PageRequest, PageResponse } from '@vben/request';
import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

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
    sorted?: number; // 排序号（可选）
  }




  /** 菜单分页查询返回值 */
  export type MenuPageResult = PageResponse<Menu>;

  /** 菜单树形分页查询参数 */
  export interface MenuTreePage extends MenuPage {
    // 继承所有分页查询参数
  }

  /** 树形菜单数据（包含 children） */
  export interface MenuTree extends Menu {
    children?: MenuTree[];
  }

  /** 菜单树形分页查询返回值 */
  export type MenuTreePageResult = PageResponse<MenuTree>;
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
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function addOrModifyMenu(
  data: MenuApi.Menu | Partial<MenuApi.Menu>,
): Promise<any> {
  return requestClient.post<any>(`${IAM_API_PREFIX}/menu/addOrModify`, data);
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
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function deleteMenu(id: string): Promise<any> {
  return requestClient.delete<any>(`${IAM_API_PREFIX}/menu/delete/${id}`);
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
 * 
 * 开发环境 Mock：设置 VITE_USE_MOCK=true 或直接修改条件判断启用
 */
export async function getMenuTree(systemId?: string): Promise<MenuApi.MenuTree[]> {
  // 开发环境使用 Mock 数据（可通过环境变量 VITE_USE_MOCK 控制）
  const useMock = import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === '1');
  if (useMock) {
    const { mockPermissionApi } = await import('./mock/permission');
    return mockPermissionApi.getMenuTree(systemId);
  }
  const params = systemId ? { systemId } : {};
  return requestClient.post<MenuApi.MenuTree[]>(
    `${IAM_API_PREFIX}/menu/tree`,
    params,
  );
}

/**
 * 获取菜单树形分页数据
 * 返回树形结构的分页数据，records 中的每个 MenuTree 可能包含 children 数组
 * total 表示根节点总数
 */
export async function getMenuTreePage(
  params: MenuApi.MenuTreePage,
): Promise<MenuApi.MenuTreePageResult> {
  return requestClient.post<MenuApi.MenuTreePageResult>(
    `${IAM_API_PREFIX}/menu/tree/page`,
    params,
  );
}
