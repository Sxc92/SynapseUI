import { computed } from 'vue';

import { preferences, updatePreferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

function useAccess() {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const accessMode = computed(() => {
    return preferences.app.accessMode;
  });

  /**
   * 基于角色判断是否有权限
   * @description: Determine whether there is permission，The role is judged by the user's role
   * @param roles
   */
  function hasAccessByRoles(roles: string[]) {
    const userRoleSet = new Set(userStore.userRoles);
    const intersection = roles.filter((item) => userRoleSet.has(item));
    return intersection.length > 0;
  }

  /**
   * 规范化权限码：统一处理单冒号和双冒号格式
   * @param code 权限码
   * @returns 规范化后的权限码（统一为双冒号格式）
   */
  function normalizeCode(code: string): string {
    // 如果已经是双冒号格式，直接返回
    if (code.includes('::')) {
      return code;
    }
    // 将第一个单冒号转为双冒号（如 role:add -> role::add）
    // 只替换第一个冒号，避免影响后续的冒号
    return code.replace(/:/, '::');
  }

  /**
   * 基于权限码判断是否有权限
   * @description: Determine whether there is permission，The permission code is judged by the user's permission code
   * @param codes 权限码数组，只要用户拥有其中任意一个权限码即返回 true
   * 支持单冒号和双冒号格式的匹配（如 role:add 和 role::add 都能匹配）
   */
  function hasAccessByCodes(codes: string[]) {
    if (!Array.isArray(codes) || codes.length === 0) {
      return false;
    }
    const userCodes = accessStore.accessCodes;
    
    // 创建用户权限码的规范化集合（统一为双冒号格式）
    const normalizedUserCodesSet = new Set(
      userCodes.map((code) => normalizeCode(code))
    );
    
    // 同时保留原始格式的集合，用于直接匹配
    const userCodesSet = new Set(userCodes);
    
    const intersection = codes.filter((item) => {
      // 1. 直接匹配（原始格式）
      if (userCodesSet.has(item)) {
        return true;
      }
      
      // 2. 规范化匹配（统一为双冒号格式后匹配）
      const normalizedItem = normalizeCode(item);
      if (normalizedUserCodesSet.has(normalizedItem)) {
        return true;
      }
      
      // 3. 反向匹配：检查用户权限码的规范化版本是否匹配
      for (const userCode of userCodes) {
        const normalizedUserCode = normalizeCode(userCode);
        if (normalizedUserCode === normalizedItem) {
          return true;
        }
      }
      
      return false;
    });
    
    return intersection.length > 0;
  }

  /**
   * 基于 resourceCode 判断是否有权限（resourceCode 的别名方法）
   * @description: Check if user has any of the specified resource codes
   * @param resourceCodes 资源码数组，只要用户拥有其中任意一个资源码即返回 true
   */
  function hasResourceCode(resourceCodes: string | string[]) {
    const codes = Array.isArray(resourceCodes) ? resourceCodes : [resourceCodes];
    return hasAccessByCodes(codes);
  }

  /**
   * 检查用户是否拥有所有指定的 resourceCode
   * @description: Check if user has all of the specified resource codes
   * @param resourceCodes 资源码数组，用户必须拥有所有资源码才返回 true
   */
  function hasAllResourceCodes(resourceCodes: string[]) {
    if (!Array.isArray(resourceCodes) || resourceCodes.length === 0) {
      return false;
    }
    const userCodesSet = new Set(accessStore.accessCodes);
    return resourceCodes.every((code) => userCodesSet.has(code));
  }

  /**
   * 获取当前用户的所有 resourceCode
   * @description: Get all resource codes of the current user
   */
  function getResourceCodes(): string[] {
    return [...accessStore.accessCodes];
  }

  async function toggleAccessMode() {
    updatePreferences({
      app: {
        accessMode:
          preferences.app.accessMode === 'frontend' ? 'backend' : 'frontend',
      },
    });
  }

  return {
    accessMode,
    getResourceCodes,
    hasAccessByCodes,
    hasAccessByRoles,
    hasAllResourceCodes,
    hasResourceCode,
    toggleAccessMode,
  };
}

export { useAccess };
