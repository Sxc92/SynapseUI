import type { PageRequest, PageResponse } from '@vben/request';
import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';

export namespace UserApi {
  /** 用户分页查询参数 */
  export interface UserPage extends PageRequest {
    username?: string;
    email?: string;
    phone?: string;
    status?: string;
  }

  /** 用户数据 */
  export interface User {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
    status?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 用户分页查询返回值 */
  export type UserPageResult = PageResponse<User>;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>(`${IAM_API_PREFIX}/user/info`);
}

/**
 * 获取用户分页数据
 * 直接返回 PageResponse 格式，表格组件会自动识别并处理
 * requestClient 已经判断过业务编码 code === 'SUCCESS'，如果成功才会返回数据
 */
export async function getUserPage(
  params: UserApi.UserPage,
): Promise<UserApi.UserPageResult> {
  return requestClient.post<UserApi.UserPageResult>(
    `${IAM_API_PREFIX}/user/page`,
    params,
  );
}

/**
 * 创建或更新用户
 * 如果 data 中包含 id，则为更新；否则为新增
 * requestClient 已经判断过业务编码，成功时返回 data 字段的值
 */
export async function addOrModifyUser(
  data: UserApi.User | Partial<UserApi.User>,
): Promise<any> {
  return requestClient.post<any>(`${IAM_API_PREFIX}/user/addOrModify`, data);
}
