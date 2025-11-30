import { computed } from 'vue';

import { useNamespace } from '@vben/hooks';

/**
 * 使用菜单项样式
 */
export function useMenuItemStyle() {
  const ns = useNamespace('permission-menu-item');
  
  return {
    ns,
    itemClass: computed(() => [
      ns.b(),
      'flex items-center rounded-md px-3 py-2 text-sm transition-colors cursor-pointer',
    ]),
    itemActiveClass: computed(() => ns.is('active')),
    itemHoverClass: computed(() => 'hover:bg-accent'),
  };
}

/**
 * 使用系统列表样式
 */
export function useSystemListStyle() {
  const ns = useNamespace('permission-system-list');
  
  return {
    ns,
    itemClass: computed(() => [
      ns.b(),
      'mb-1 cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
    ]),
    itemActiveClass: computed(() => ns.is('active')),
  };
}

/**
 * 使用资源面板样式
 */
export function useResourcePanelStyle() {
  const ns = useNamespace('permission-resource-panel');
  
  return {
    ns,
    resourceItemClass: computed(() => [
      ns.e('item'),
      'flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50',
    ]),
  };
}

