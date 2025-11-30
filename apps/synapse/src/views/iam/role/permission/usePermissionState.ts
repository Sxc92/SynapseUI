import { computed, ref } from 'vue';

import type {
  MenuNode,
  PermissionStats,
  ResourceNode,
  SystemNode,
} from './types';

/**
 * 权限状态管理 Hook
 */
export function usePermissionState() {
  // 数据索引
  const systemMap = ref<Map<string, SystemNode>>(new Map());
  const menuMap = ref<Map<string, MenuNode>>(new Map());
  const resourceMap = ref<Map<string, ResourceNode>>(new Map());

  // 父子关系
  const menuParentMap = ref<Map<string, string>>(new Map());
  const menuChildrenMap = ref<Map<string, string[]>>(new Map());
  const resourceMenuMap = ref<Map<string, string>>(new Map());

  // 选中状态
  const selectedSystemId = ref<string | null>(null);
  const selectedSystemIds = ref<Set<string>>(new Set()); // 新增：选中的系统ID集合
  const selectedMenuId = ref<string | null>(null);
  const selectedMenuIds = ref<Set<string>>(new Set());
  const selectedResourceIds = ref<Set<string>>(new Set());
  const expandedMenuIds = ref<Set<string>>(new Set());

  // UI 状态
  const searchKeyword = ref('');

  // 计算属性：当前系统的菜单列表
  const currentSystemMenus = computed(() => {
    if (!selectedSystemId.value) {
      return [];
    }
    const system = systemMap.value.get(selectedSystemId.value);
    return system?.menus || [];
  });

  // 计算属性：过滤后的菜单列表
  const filteredMenus = computed(() => {
    const menus = currentSystemMenus.value;
    if (!searchKeyword.value.trim()) {
      return menus;
    }

    const keyword = searchKeyword.value.toLowerCase();
    const result: MenuNode[] = [];

    function filterMenu(menu: MenuNode): boolean {
      // 检查当前菜单是否匹配
      const match = menu.name.toLowerCase().includes(keyword);

      // 检查子菜单是否匹配
      let hasMatchingChild = false;
      if (menu.children && menu.children.length > 0) {
        const filteredChildren: MenuNode[] = [];
        for (const child of menu.children) {
          if (filterMenu(child)) {
            filteredChildren.push(child);
            hasMatchingChild = true;
          }
        }
        if (hasMatchingChild) {
          // 如果有匹配的子菜单，保留当前菜单但只显示匹配的子菜单
          result.push({
            ...menu,
            children: filteredChildren,
          });
          return true;
        }
      }

      // 如果当前菜单匹配，添加到结果
      if (match) {
        result.push(menu);
        return true;
      }

      return false;
    }

    for (const menu of menus) {
      filterMenu(menu);
    }

    return result;
  });

  // 计算属性：当前选中菜单的资源列表
  const currentMenuResources = computed(() => {
    if (!selectedMenuId.value) {
      return [];
    }
    const menu = menuMap.value.get(selectedMenuId.value);
    return menu?.resources || [];
  });

  // 计算属性：权限统计
  const permissionStats = computed<PermissionStats>(() => {
    const totalSystemCount = systemMap.value.size;
    const totalMenuCount = menuMap.value.size;
    const totalResourceCount = resourceMap.value.size;
    const selectedSystemCount = selectedSystemIds.value.size;
    const selectedMenuCount = selectedMenuIds.value.size;
    const selectedResourceCount = selectedResourceIds.value.size;

    return {
      selectedSystemCount,
      selectedMenuCount,
      selectedResourceCount,
      totalSystemCount,
      totalMenuCount,
      totalResourceCount,
    };
  });

  // 重置状态
  function resetState() {
    systemMap.value.clear();
    menuMap.value.clear();
    resourceMap.value.clear();
    menuParentMap.value.clear();
    menuChildrenMap.value.clear();
    resourceMenuMap.value.clear();
    selectedSystemId.value = null;
    selectedSystemIds.value.clear(); // 新增
    selectedMenuId.value = null;
    selectedMenuIds.value.clear();
    selectedResourceIds.value.clear();
    expandedMenuIds.value.clear();
    searchKeyword.value = '';
  }

  // 切换菜单展开/折叠
  function toggleMenuExpand(menuId: string) {
    if (expandedMenuIds.value.has(menuId)) {
      expandedMenuIds.value.delete(menuId);
    } else {
      expandedMenuIds.value.add(menuId);
    }
  }

  // 检查菜单是否展开
  function isMenuExpanded(menuId: string): boolean {
    return expandedMenuIds.value.has(menuId);
  }

  // 检查菜单是否选中
  function isMenuSelected(menuId: string): boolean {
    return selectedMenuIds.value.has(menuId);
  }

  // 检查资源是否选中
  function isResourceSelected(resourceId: string): boolean {
    return selectedResourceIds.value.has(resourceId);
  }

  return {
    // 数据索引
    systemMap,
    menuMap,
    resourceMap,
    // 父子关系
    menuParentMap,
    menuChildrenMap,
    resourceMenuMap,
    // 选中状态
    selectedSystemId,
    selectedSystemIds, // 新增
    selectedMenuId,
    selectedMenuIds,
    selectedResourceIds,
    expandedMenuIds,
    // UI 状态
    searchKeyword,
    // 计算属性
    currentSystemMenus,
    filteredMenus,
    currentMenuResources,
    permissionStats,
    // 方法
    resetState,
    toggleMenuExpand,
    isMenuExpanded,
    isMenuSelected,
    isResourceSelected,
  };
}

