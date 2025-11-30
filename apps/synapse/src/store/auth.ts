import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { token } = await loginApi(params);

      // 如果成功获取到 token
      if (token) {
        accessStore.setAccessToken(token);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodesResponse] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        // 优先使用用户信息中的 permissions 字段，如果不存在或为空，再使用 getAccessCodesApi 的结果
        let accessCodes: string[] = [];
        
        // 1. 首先尝试从用户信息中获取 permissions 字段
        const userPermissions = (userInfo as any)?.permissions;
        if (Array.isArray(userPermissions) && userPermissions.length > 0) {
          accessCodes = userPermissions;
          console.log('[authLogin] 使用用户信息中的 permissions 字段作为权限编码');
        } else {
          // 2. 如果用户信息中没有 permissions，则使用 getAccessCodesApi 的结果
        if (Array.isArray(accessCodesResponse)) {
          accessCodes = accessCodesResponse;
            console.log('[authLogin] 权限编码是数组格式，直接使用');
        } else if (accessCodesResponse && typeof accessCodesResponse === 'object') {
          // 如果返回的是包装对象，提取 data 字段
          const responseData = accessCodesResponse as any;
            console.log('[authLogin] 权限编码是对象格式，尝试提取 data 字段');
            console.log('[authLogin] 响应对象 keys:', Object.keys(responseData));
          if ('data' in responseData && Array.isArray(responseData.data)) {
            accessCodes = responseData.data;
              console.log('[authLogin] 从 data 字段提取到权限编码数组');
            } else {
              console.warn('[authLogin] 响应对象中没有找到 data 字段或 data 不是数组');
            }
          } else {
            console.warn('[authLogin] 权限编码响应格式异常:', accessCodesResponse);
          }
        }

        // 确保所有元素都是字符串
        const beforeFilterCount = accessCodes.length;
        accessCodes = accessCodes.filter((code): code is string => typeof code === 'string');
        const filteredCount = beforeFilterCount - accessCodes.length;
        if (filteredCount > 0) {
          console.warn(`[authLogin] 过滤掉了 ${filteredCount} 个非字符串类型的权限编码`);
        }

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);


        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                // 如果用户信息中的 homePath 是默认的 /analytics，则使用配置的 defaultHomePath
                // 否则使用用户信息中的 homePath（允许后端自定义用户首页）
                userInfo.homePath && userInfo.homePath !== '/analytics'
                  ? userInfo.homePath
                  : preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } catch (error) {
      // 捕获登录过程中的错误，防止错误向上传播到 Vue 组件事件处理程序
      // 错误消息已经在响应拦截器（errorMessageResponseInterceptor）中显示给用户
      // 这里只需要捕获错误，避免 Vue 警告 "Unhandled error during execution of component event handler"
      console.error('[authLogin] 登录失败:', error);
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);

    // 同步更新 accessCodes：优先使用用户信息中的 permissions 字段
    let accessCodes: string[] = [];
    
    // 1. 首先尝试从用户信息中获取 permissions 字段
    const userPermissions = (userInfo as any)?.permissions;
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      accessCodes = userPermissions;
    } else {
      // 2. 如果用户信息中没有 permissions，则使用 getAccessCodesApi 的结果
      try {
        const accessCodesResponse = await getAccessCodesApi();

        if (Array.isArray(accessCodesResponse)) {
          accessCodes = accessCodesResponse;
        } else if (accessCodesResponse && typeof accessCodesResponse === 'object') {
          // 如果返回的是包装对象，提取 data 字段
          const responseData = accessCodesResponse as any;
          if ('data' in responseData && Array.isArray(responseData.data)) {
            accessCodes = responseData.data;
          } else {
            console.warn('[fetchUserInfo] 响应对象中没有找到 data 字段或 data 不是数组');
          }
        } else {
          console.warn('[fetchUserInfo] 权限编码响应格式异常:', accessCodesResponse);
        }
      } catch (error) {
        console.error('[fetchUserInfo] 获取权限编码失败:', error);
      }
    }

    // 确保所有元素都是字符串
    accessCodes = accessCodes.filter((code): code is string => typeof code === 'string');
    // 更新 accessCodes
    accessStore.setAccessCodes(accessCodes);

    // 验证存储是否成功
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
