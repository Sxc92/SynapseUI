import { baseRequestClient, requestClient } from '#/api/request';

import { AUTH_API_PREFIX, IAM_API_PREFIX } from './constants';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    token: string;
    expiresIn: number;
  }

  export interface RefreshTokenResult {
    data: {
      expiresIn: number;
      token: string;
    };
    msg: string;
    code: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    `${IAM_API_PREFIX}${AUTH_API_PREFIX}/login`,
    data,
  );
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 * 使用 requestClient 而不是 baseRequestClient，确保请求头包含 token
 */
export async function logoutApi() {
  return requestClient.post(`${IAM_API_PREFIX}${AUTH_API_PREFIX}/logout`);
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>(`${IAM_API_PREFIX}/resource/code`);
}
