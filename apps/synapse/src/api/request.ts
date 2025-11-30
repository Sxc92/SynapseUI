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
    } catch (error) {
      // 如果出现异常，确保清理状态并跳转到登录页
      console.error('[doReAuthenticate] 重新认证过程中出现异常:', error);
      try {
        const accessStore = useAccessStore();
        resetAllStores();
        accessStore.setLoginExpired(false);

        // 尝试跳转到登录页
        const router = useRouter();
        await router.replace({
          path: LOGIN_PATH,
          query: {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          },
        });
      } catch (fallbackError) {
        // 如果跳转也失败，记录错误并使用 window.location 作为最后的兜底方案
        console.error('[doReAuthenticate] 跳转登录页失败，使用 window.location:', fallbackError);
        window.location.href = LOGIN_PATH;
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

  // 统一的响应拦截器：先判断 HTTP 状态码，再判断 body 内的 code
  client.addResponseInterceptor({
    fulfilled: (response) => {
      const { config, data: responseData, status } = response;

      // 第一步：判断 HTTP 状态码
      // HTTP 状态码不在 200-399 范围内的，会被 axios 自动处理为 rejected
      if (status < 200 || status >= 400) {
        // HTTP 状态码异常，会被 axios 处理为 rejected
        return response;
      }

      // HTTP 状态码正常，继续处理
      // 第二步：判断 body 内的 code
      let body: any;
      
      // 根据 responseReturn 配置获取响应体
      if (config.responseReturn === 'raw') {
        // raw 模式：responseData 是完整的 AxiosResponse，需要从 data 获取
        body = responseData?.data;
      } else if (config.responseReturn === 'body') {
        // body 模式：responseData 就是响应体
        body = responseData;
      } else {
        // data 模式：responseData 可能是提取后的 data，也可能是完整响应
        body = responseData;
      }

      // 检查 body 中的 code 字段
      if (body && typeof body === 'object' && 'code' in body) {
        // 检查业务码是否表示 token 失效
        const tokenExpiredCodes = [
          401,
          '401',
          'UNAUTHORIZED',
          'TOKEN_EXPIRED',
          'TOKEN_INVALID',
        ];

        if (tokenExpiredCodes.includes(body.code)) {
          // token 失效：转换为 401 错误，让 authenticateResponseInterceptor 处理
          console.warn('[Token失效] 业务码表示 token 失效:', body.code);
          const error = new Error(body.msg || body.message || 'Token 失效') as any;
          error.response = {
            ...response,
            status: 401,
            data: body,
          };
          error.data = body;
          throw error;
        }

        // 如果 code 不是 SUCCESS，抛出业务异常
        if (body.code !== 'SUCCESS') {
          const errorMsg = body.msg || body.message || '请求失败';
          const error = new Error(errorMsg) as any;
          error.response = {
            ...response,
            status: status,
            data: body,
          };
          error.data = body;
          throw error;
        }

        // code 是 SUCCESS，根据 responseReturn 返回相应数据
        if (config.responseReturn === 'data') {
          // data 模式：提取 data 字段
          return body.data;
        }
      }

      // 没有 code 字段，根据 responseReturn 返回相应数据
      if (config.responseReturn === 'data') {
        // data 模式：如果没有 code 字段，直接返回 body（可能是其他格式的响应）
        return body || responseData;
      }

      // body 和 raw 模式直接返回
      return responseData;
    },
    rejected: (error) => {
      // 处理 rejected 的情况
      const response = error?.response;
      const status = response?.status;
      const responseData = response?.data ?? error?.data;

      // 第一步：判断 HTTP 状态码
      // 如果 HTTP 状态码是 401，交给 authenticateResponseInterceptor 处理
      if (status === 401) {
        throw error;
      }

      // 第二步：判断 body 内的 code（如果存在）
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        // 检查业务码是否表示 token 失效
      const tokenExpiredCodes = [
        401,
        '401',
        'UNAUTHORIZED',
        'TOKEN_EXPIRED',
        'TOKEN_INVALID',
      ];

        if (tokenExpiredCodes.includes(responseData.code)) {
          // token 失效：转换为 401 错误
        console.warn('[Token失效] 业务码表示 token 失效:', responseData.code);
        const modifiedError = Object.assign(error, {
          response: {
            ...error.response,
            status: 401,
            data: responseData,
          },
        });
        throw modifiedError;
      }

        // 如果 code 不是 SUCCESS，使用 msg 作为错误信息
        if (responseData.code !== 'SUCCESS') {
          const errorMsg = responseData.msg || responseData.message || error.message || '请求失败';
          error.message = errorMsg;
          // 确保错误对象包含完整的响应数据
          if (!error.response) {
            error.response = { status, data: responseData } as any;
          } else if (!error.response.data) {
            error.response.data = responseData;
          }
          if (!error.data) {
            error.data = responseData;
          }
        }
      }

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
