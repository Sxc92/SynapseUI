<script setup lang="ts">
import { computed, nextTick, onMounted, ref, triggerRef, watch } from 'vue';

import { message } from 'ant-design-vue';

import { Card, CardContent } from '@vben-core/shadcn-ui';

import { $t } from '#/locales';

import { assignRolePermissions, getResourcesByMenuId } from '#/api/iam/resource';
import { getSystemList } from '#/api/iam/system';
import { getMenuTree } from '#/api/iam/menu';
import { getRolePermissionIds } from '#/api/iam/role';

import type { MenuNode, SystemNode, ResourceNode } from './types';
import { useCascadeSelection } from './useCascadeSelection';
import { usePermissionState } from './usePermissionState';
import ResourcePanel from './ResourcePanel.vue';
import SystemList from './SystemList.vue';
import MenuList from './MenuList.vue';

interface Props {
  roleId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'success': [];
  'error': [error: any];
}>();

  // 状态管理
const {
  systemMap,
  menuMap,
  resourceMap,
  menuParentMap,
  menuChildrenMap,
  resourceMenuMap,
  selectedSystemId,
  selectedSystemIds,
  selectedMenuId,
  selectedMenuIds,
  selectedResourceIds,
  expandedMenuIds,
  searchKeyword,
  filteredMenus,
  currentMenuResources,
  permissionStats,
  resetState,
  toggleMenuExpand,
} = usePermissionState();

// 级联选择（需要传入资源加载函数）
const cascadeSelection = useCascadeSelection(
  systemMap,
  menuMap,
  menuParentMap,
  menuChildrenMap,
  resourceMenuMap,
  selectedSystemIds,
  selectedMenuIds,
  selectedResourceIds,
  loadResourcesByMenu, // 传入资源加载函数
);

// 加载状态
const loading = ref(false);
const menuLoading = ref(false); // 菜单加载状态
const resourceLoading = ref(false); // 资源加载状态

// 缓存：已加载的菜单和资源
const menuCache = ref<Map<string, MenuNode[]>>(new Map()); // systemId -> MenuNode[]
const resourceCache = ref<Map<string, ResourceNode[]>>(new Map()); // menuId -> ResourceNode[]

// 当前选中的菜单信息
const currentMenuName = computed(() => {
  if (!selectedMenuId.value) return '';
  const menu = menuMap.value.get(selectedMenuId.value);
  return menu?.name || '';
});

// ==================== 数据加载函数 ====================

/**
 * 阶段1：快速启动 - 加载系统列表和权限ID
 */
async function loadSystemsAndPermissionIds() {
  try {
    console.log('[PermissionPanelLayout] Loading systems and permission IDs for roleId:', props.roleId);
    const [systems, permissionIds] = await Promise.all([
      getSystemList(),
      getRolePermissionIds(props.roleId),
    ]);
    console.log('[PermissionPanelLayout] Loaded permissionIds:', permissionIds);
    
    // 转换为 SystemNode 格式
    const sm = new Map<string, SystemNode>();
    for (const system of systems) {
      sm.set(system.id, {
        id: system.id,
        name: system.name,
        systemId: system.id,
        menus: [], // 菜单将在后续加载
      });
    }
    systemMap.value = sm;

    // 设置已选中的权限ID（用于反显）
    selectedSystemIds.value = new Set(permissionIds.systemIds || []);
    selectedMenuIds.value = new Set(permissionIds.menuIds || []);
    selectedResourceIds.value = new Set(permissionIds.resourceIds || []);
    
    console.log('[PermissionPanelLayout] Set selectedSystemIds:', Array.from(selectedSystemIds.value));
    console.log('[PermissionPanelLayout] Set selectedMenuIds:', Array.from(selectedMenuIds.value));
    console.log('[PermissionPanelLayout] Set selectedResourceIds:', Array.from(selectedResourceIds.value));

    // 默认选中第一个系统
    if (systems.length > 0 && systems[0]) {
      selectedSystemId.value = systems[0].id;
    }
  } catch (error: any) {
    console.error('加载系统列表失败:', error);
    message.error(error?.message || $t('common.queryFailed'));
    emit('error', error);
  }
}

/**
 * 阶段2：预加载菜单树
 */
async function loadAllMenus() {
  menuLoading.value = true;
  try {
    // 加载所有系统的菜单树（不传 systemId 获取所有）
    const allMenuTree = await getMenuTree();

    // 按系统分组菜单
    const menuTreeBySystem = new Map<string, any[]>();
    for (const menu of allMenuTree) {
      const systemId = menu.systemId;
      if (!menuTreeBySystem.has(systemId)) {
        menuTreeBySystem.set(systemId, []);
      }
      menuTreeBySystem.get(systemId)!.push(menu);
    }

    // 转换菜单树为 MenuNode 格式
    const mm = new Map<string, MenuNode>();
    const mpm = new Map<string, string>();
    const mcm = new Map<string, string[]>();

    function convertMenuTree(menu: any, parentMenuId?: string, level: number = 0): MenuNode {
      const menuNode: MenuNode = {
        id: menu.id,
        name: menu.name,
        menuId: menu.id,
        systemId: menu.systemId,
        parentMenuId,
        resources: [], // 资源将在选择菜单时加载
        selected: selectedMenuIds.value.has(menu.id),
        level,
        children: [],
      };

      mm.set(menu.id, menuNode);

      // 建立父子关系
      if (parentMenuId) {
        mpm.set(menu.id, parentMenuId);
        if (!mcm.has(parentMenuId)) {
          mcm.set(parentMenuId, []);
        }
        mcm.get(parentMenuId)!.push(menu.id);
      }

      // 处理子菜单（最多两级）
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          const childNode = convertMenuTree(child, menu.id, level + 1);
          menuNode.children!.push(childNode);
        }
      }

      return menuNode;
    }

    // 为每个系统转换菜单树
    for (const [systemId, menus] of menuTreeBySystem.entries()) {
      const menuNodes: MenuNode[] = [];
      for (const menu of menus) {
        menuNodes.push(convertMenuTree(menu, undefined, 0));
      }

      // 更新系统节点中的菜单列表
      const system = systemMap.value.get(systemId);
      if (system) {
        system.menus = menuNodes;
        systemMap.value.set(systemId, system);
      }

      // 缓存菜单树
      menuCache.value.set(systemId, menuNodes);

      // 自动展开所有菜单
      for (const menu of menuNodes) {
          expandedMenuIds.value.add(menu.menuId);
        function expandChildren(menu: MenuNode) {
            if (menu.children) {
              for (const child of menu.children) {
                expandedMenuIds.value.add(child.menuId);
                expandChildren(child);
              }
            }
          }
          expandChildren(menu);
        }
      }

    // 更新菜单相关的 Map
    menuMap.value = mm;
    menuParentMap.value = mpm;
    menuChildrenMap.value = mcm;
  } catch (error: any) {
    console.error('加载菜单失败:', error);
    message.error(error?.message || $t('common.queryFailed'));
  } finally {
    menuLoading.value = false;
  }
}

/**
 * 阶段3：按需加载资源
 */
async function loadResourcesByMenu(menuId: string) {
  // 检查缓存，如果已缓存，确保菜单对象已更新资源列表
  if (resourceCache.value.has(menuId)) {
    const cachedResources = resourceCache.value.get(menuId) || [];
    const menu = menuMap.value.get(menuId);
    if (menu && menu.resources.length === 0) {
      menu.resources = cachedResources;
      menuMap.value.set(menuId, menu);
    }
    return;
  }

  resourceLoading.value = true;
  try {
    const resources = await getResourcesByMenuId(menuId);

    // 转换为 ResourceNode 格式
    const resourceNodes: ResourceNode[] = [];
    for (const resource of resources) {
      const resourceNode: ResourceNode = {
        id: resource.id,
        name: resource.name,
        resourceId: resource.id,
        menuId,
        type: (resource.type === 'API' ? 'API' : 'BUTTON') as 'API' | 'BUTTON',
        code: resource.code || '',
        selected: selectedResourceIds.value.has(resource.id),
      };
      resourceNodes.push(resourceNode);
      resourceMap.value.set(resource.id, resourceNode);
      resourceMenuMap.value.set(resource.id, menuId);
    }

    // 缓存资源
    resourceCache.value.set(menuId, resourceNodes);

    // 更新菜单节点中的资源列表
    const menu = menuMap.value.get(menuId);
    if (menu) {
      menu.resources = resourceNodes;
      menuMap.value.set(menuId, menu);
    }
  } catch (error: any) {
    console.error('加载资源失败:', error);
    message.error(error?.message || $t('common.queryFailed'));
  } finally {
    resourceLoading.value = false;
  }
}

/**
 * 初始化加载
 */
async function initialize() {
  loading.value = true;
  try {
    // 阶段1：快速启动
    await loadSystemsAndPermissionIds();

    // 阶段2：后台预加载菜单树
    loadAllMenus();
  } catch (error: any) {
    console.error('初始化失败:', error);
    message.error(error?.message || $t('common.queryFailed'));
    emit('error', error);
  } finally {
    loading.value = false;
  }
}

// ==================== 事件处理函数 ====================

// 切换系统选中状态
async function handleToggleSystem(systemId: string, selected: boolean) {
  if (selected) {
    await cascadeSelection.selectSystem(systemId);
  } else {
    cascadeSelection.deselectSystem(systemId);
  }
}

// 切换菜单选中状态（选中菜单时，自动选中该菜单下的所有资源）
async function handleToggleMenu(menuId: string, selected: boolean) {
  console.log(`[PermissionPanelLayout] handleToggleMenu: menuId=${menuId}, selected=${selected}`);
  if (selected) {
    // 先加载资源（如果未加载）
    await loadResourcesByMenu(menuId);
    console.log('[PermissionPanelLayout] Resources loaded, selectedResourceIds before selectMenu:', Array.from(selectedResourceIds.value));
    
    // 自动选中该菜单（显示资源面板）
    selectedMenuId.value = menuId;
    
    // 等待一下，确保资源已加载并更新到菜单对象中
    await new Promise((resolve) => setTimeout(resolve, 10));
    // 然后选中菜单（会自动选中资源）
    await cascadeSelection.selectMenu(menuId);
    console.log('[PermissionPanelLayout] After selectMenu, selectedResourceIds:', Array.from(selectedResourceIds.value));
    
    // 强制触发响应式更新
    await nextTick();
    triggerRef(selectedResourceIds);
    // 重新创建 Set 以确保响应式更新
    const newSet = new Set(selectedResourceIds.value);
    selectedResourceIds.value = newSet;
    console.log('[PermissionPanelLayout] After update, selectedResourceIds:', Array.from(selectedResourceIds.value));
  } else {
    cascadeSelection.deselectMenu(menuId);
    // 如果当前选中的菜单被取消选中，清空选中菜单（隐藏资源面板）
    if (selectedMenuId.value === menuId) {
      selectedMenuId.value = null;
    }
    // 取消选中时也触发更新
    await nextTick();
    triggerRef(selectedResourceIds);
    selectedResourceIds.value = new Set(selectedResourceIds.value);
    console.log('[PermissionPanelLayout] After deselectMenu, selectedResourceIds:', Array.from(selectedResourceIds.value));
  }
}

// 切换资源选中状态
function handleToggleResource(resourceId: string, selected: boolean) {
  if (selected) {
    cascadeSelection.selectResource(resourceId);
  } else {
    cascadeSelection.deselectResource(resourceId);
  }
}

// 全选/取消全选当前菜单的所有资源
function handleSelectAllResources() {
  if (!selectedMenuId.value) return;
  cascadeSelection.selectAllResourcesInMenu(selectedMenuId.value);
}

function handleDeselectAllResources() {
  if (!selectedMenuId.value) return;
  cascadeSelection.deselectAllResourcesInMenu(selectedMenuId.value);
}

// 保存权限
async function savePermissions() {
  console.log('[PermissionPanelLayout] savePermissions 被调用');
  loading.value = true;
  try {
    // 收集所有选中的系统、菜单和资源ID
    const systemIds = Array.from(selectedSystemIds.value);
    const menuIds = Array.from(selectedMenuIds.value);
    const resourceIds = Array.from(selectedResourceIds.value);

    console.log('[PermissionPanelLayout] 准备保存权限:', { systemIds, menuIds, resourceIds });

    await assignRolePermissions(props.roleId, {
      systemIds,
      menuIds,
      resourceIds,
    });

    console.log('[PermissionPanelLayout] 权限保存成功');
    message.success($t('role.assignPermissionSuccess'));
    emit('success');
  } catch (error: any) {
    console.error('[PermissionPanelLayout] 保存权限失败:', error);
    message.error(error?.message || $t('common.error'));
    emit('error', error);
  } finally {
    loading.value = false;
  }
}

// ==================== 监听器 ====================

// 监听系统切换，自动展开所有菜单
watch(selectedSystemId, (newSystemId) => {
  if (!newSystemId) return;
  
  const system = systemMap.value.get(newSystemId);
  if (system && system.menus) {
    // 展开该系统的所有菜单
    function expandAllMenus(menus: MenuNode[]) {
      for (const menu of menus) {
        expandedMenuIds.value.add(menu.menuId);
        if (menu.children && menu.children.length > 0) {
          expandAllMenus(menu.children);
        }
      }
    }
    expandAllMenus(system.menus);
  }
});

// 监听菜单选择，加载该菜单的资源
watch(selectedMenuId, async (newMenuId) => {
  if (!newMenuId) return;

  // 加载资源（如果未缓存）
  await loadResourcesByMenu(newMenuId);
});

// 组件挂载时初始化
onMounted(() => {
  initialize();
});

// 暴露保存方法和重置方法
defineExpose({
  savePermissions,
  resetState: () => {
    resetState();
    menuCache.value.clear();
    resourceCache.value.clear();
  },
});
</script>

<template>
  <div class="flex h-[600px] flex-col">
    <!-- 三栏内容区域 -->
    <div class="flex flex-1 min-h-0 w-full gap-4 p-4">
      <!-- 左侧：系统列表 -->
      <SystemList
        :systems="Array.from(systemMap.values())"
        :selected-system-id="selectedSystemId"
        :selected-system-ids="selectedSystemIds"
        @update:selected-system-id="selectedSystemId = $event"
        @toggle-system="handleToggleSystem"
      />

      <!-- 中间：菜单列表 -->
      <MenuList
        :menus="filteredMenus"
        :selected-menu-id="selectedMenuId"
        :selected-menu-ids="selectedMenuIds"
        :expanded-menu-ids="expandedMenuIds"
        :search-keyword="searchKeyword"
        @update:selected-menu-id="selectedMenuId = $event"
        @update:search-keyword="searchKeyword = $event"
        @toggle-expand="toggleMenuExpand"
        @toggle-menu="handleToggleMenu"
      />

      <!-- 右侧：资源面板 -->
      <ResourcePanel
        :menu-name="currentMenuName"
        :resources="currentMenuResources"
        :selected-resource-ids="selectedResourceIds"
        @toggle-resource="handleToggleResource"
        @select-all="handleSelectAllResources"
        @deselect-all="handleDeselectAllResources"
      />
    </div>

    <!-- 权限预览 -->
    <Card class="mx-4 mb-4 mt-0 shrink-0 rounded-lg border">
      <CardContent class="px-4 py-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">
            {{ $t('role.selected') }}
            <span class="text-primary font-semibold">{{ permissionStats.selectedSystemCount }}</span>
            {{ $t('role.systems') }}，
            <span class="text-primary font-semibold">{{ permissionStats.selectedMenuCount }}</span>
            {{ $t('role.menus') }}，
            <span class="text-primary font-semibold">{{ permissionStats.selectedResourceCount }}</span>
            {{ $t('role.resources') }}
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
