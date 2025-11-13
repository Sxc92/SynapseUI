import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

import { IAM_API_PREFIX } from './constants';
/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>(`${IAM_API_PREFIX}/user/info`);
}
