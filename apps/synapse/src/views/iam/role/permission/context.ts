import { inject, provide, type InjectionKey } from 'vue';

import type { MenuNode, ResourceNode, SystemNode } from './types';

/**
 * 权限面板 Context
 */
export interface PermissionPanelContext {
  // 数据索引
  systemMap: Map<string, SystemNode>;
  menuMap: Map<string, MenuNode>;
  resourceMap: Map<string, ResourceNode>;
  
  // 选中状态
  selectedSystemId: string | null;
  selectedMenuId: string | null;
  selectedMenuIds: Set<string>;
  selectedResourceIds: Set<string>;
  expandedMenuIds: Set<string>;
  
  // 方法
  selectSystem: (systemId: string) => void;
  selectMenu: (menuId: string) => void;
  toggleMenuExpand: (menuId: string) => void;
  toggleResource: (resourceId: string, selected: boolean) => void;
}

const permissionPanelContextKey: InjectionKey<PermissionPanelContext> = Symbol('permissionPanelContext');

/**
 * 提供权限面板 Context
 */
export function providePermissionPanelContext(context: PermissionPanelContext) {
  provide(permissionPanelContextKey, context);
}

/**
 * 注入权限面板 Context
 */
export function usePermissionPanelContext(): PermissionPanelContext {
  const context = inject(permissionPanelContextKey);
  if (!context) {
    throw new Error('usePermissionPanelContext must be used within PermissionPanelLayout');
  }
  return context;
}

