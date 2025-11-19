/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { resetAllStores, useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { refreshTokenApi } from './iam';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  // 防止 doReAuthenticate 重复调用的标志
  let isReAuthenticating = false;

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    // 如果正在重新认证，直接返回，避免无限循环
    if (isReAuthenticating) {
      console.warn('[doReAuthenticate] 正在重新认证中，跳过重复调用');
      return;
    }

    try {
      isReAuthenticating = true;
      console.warn('Access token or refresh token is invalid or expired. ');
      const accessStore = useAccessStore();
      accessStore.setAccessToken(null);
      if (
        preferences.app.loginExpiredMode === 'modal' &&
        accessStore.isAccessChecked
      ) {
        accessStore.setLoginExpired(true);
      } else {
        // 直接清理状态并跳转，不调用需要认证的 logout API，避免无限循环
        resetAllStores();
        accessStore.setLoginExpired(false);
        
        // 跳转到登录页
        const router = useRouter();
        await router.replace({
          path: LOGIN_PATH,
          query: {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          },
        });
      }
    } finally {
      // 延迟重置标志，确保所有清理操作完成
      setTimeout(() => {
        isReAuthenticating = false;
      }, 1000);
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    // baseRequestClient 返回原始响应，resp.data 是 RefreshTokenResult，token 在 resp.data.data.token 中
    const responseData = resp.data as any;
    const newToken =
      responseData?.data?.token || responseData?.token || responseData;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 'SUCCESS', // 后端返回的成功码是字符串 "SUCCESS"
    }),
  );

  // 处理业务码表示 token 失效的情况（在 authenticateResponseInterceptor 之前处理）
  // 后端可能返回 200 状态码，但业务码表示 token 失效，需要转换为 401 错误
  client.addResponseInterceptor({
    rejected: async (error) => {
      const responseData = error?.response?.data ?? error?.data;
      // 检查业务码是否表示 token 失效（常见的业务码：401, '401', 'UNAUTHORIZED', 'TOKEN_EXPIRED' 等）
      // 根据实际后端返回的业务码进行调整
      const tokenExpiredCodes = [401, '401', 'UNAUTHORIZED', 'TOKEN_EXPIRED', 'TOKEN_INVALID'];
      
      if (
        responseData &&
        typeof responseData === 'object' &&
        'code' in responseData &&
        tokenExpiredCodes.includes(responseData.code)
      ) {
        console.warn('[Token失效] 业务码表示 token 失效:', responseData.code);
        // 将错误转换为 401 状态码，这样 authenticateResponseInterceptor 可以处理
        const modifiedError = Object.assign(error, {
          response: {
            ...error.response,
            status: 401,
            data: responseData,
          },
        });
        // 不在这里调用 doReAuthenticate，让 authenticateResponseInterceptor 统一处理
        throw modifiedError;
      }
      // 如果不是 token 失效的业务码，继续抛出原始错误
      throw error;
    },
  });

  // token过期的处理（处理 HTTP 401 状态码和业务码转换后的 401）
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 后端接口返回的错误字段是 msg
      const responseData = error?.response?.data ?? {};
      const errorMessage =
        responseData?.msg ?? responseData?.error ?? responseData?.message ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

// 返回完整响应对象的 requestClient（用于需要获取 code 和 msg 的接口）
export const fullResponseClient = createRequestClient(apiURL, {
  responseReturn: 'body', // 返回完整的响应对象
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
