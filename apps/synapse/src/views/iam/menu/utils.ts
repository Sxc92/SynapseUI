import type { MenuData } from './types';

/**
 * 将菜单列表转换为树形结构（用于父菜单选择）
 * @param menus 菜单列表
 * @param excludeId 要排除的菜单 ID（编辑时排除自身）
 * @returns 树形结构的菜单列表
 */
export function convertMenuListToTree(
  menus: MenuData[],
  excludeId?: string,
): Array<{ label: string; value: string; children?: any[] }> {
  // 过滤掉要排除的菜单及其子菜单
  const filteredMenus = excludeId
    ? menus.filter((menu) => {
        // 简单的过滤逻辑：排除指定 ID 的菜单
        // 如果需要排除子菜单，需要递归处理
        return menu.id !== excludeId;
      })
    : menus;

  // 构建树形结构
  const menuMap = new Map<string, any>();
  const rootMenus: any[] = [];

  // 第一遍：创建所有节点的映射
  filteredMenus.forEach((menu) => {
    menuMap.set(menu.id, {
      label: menu.name,
      value: menu.id,
      children: [],
    });
  });

  // 第二遍：构建父子关系
  filteredMenus.forEach((menu) => {
    const node = menuMap.get(menu.id)!;
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!;
      parent.children.push(node);
    } else {
      rootMenus.push(node);
    }
  });

  return rootMenus;
}

