import type {
  MenuPermissionNode,
  PermissionTreeNode,
  ResourcePermissionNode,
  SystemPermissionNode,
} from '#/api/iam/resource';

import type { MenuNode, ResourceNode, SystemNode } from './types';

/**
 * 将后端返回的权限树转换为结构化数据
 */
export function transformPermissionTrees(trees: PermissionTreeNode[]): {
  systems: SystemNode[];
  systemMap: Map<string, SystemNode>;
  menuMap: Map<string, MenuNode>;
  resourceMap: Map<string, ResourceNode>;
  menuParentMap: Map<string, string>;
  menuChildrenMap: Map<string, string[]>;
  resourceMenuMap: Map<string, string>;
} {
  const systemMap = new Map<string, SystemNode>();
  const menuMap = new Map<string, MenuNode>();
  const resourceMap = new Map<string, ResourceNode>();
  const menuParentMap = new Map<string, string>();
  const menuChildrenMap = new Map<string, string[]>();
  const resourceMenuMap = new Map<string, string>();

  /**
   * 递归处理菜单节点（支持多级菜单）
   */
  function processMenuNode(
    menuNode: MenuPermissionNode,
    systemId: string,
    parentMenuId?: string,
    level: number = 0,
  ): MenuNode {
    const menuId = menuNode.menuId;
    const resources: ResourceNode[] = [];
    
    // 处理资源节点
    if (menuNode.children) {
      for (const child of menuNode.children) {
        if (child.type === 'resource') {
          // 这是资源节点
          const resourceNode = child as ResourcePermissionNode;
          const resource: ResourceNode = {
            id: resourceNode.id,
            name: resourceNode.name,
            resourceId: resourceNode.resourceId,
            menuId: menuId,
            type: resourceNode.resourceType || 'BUTTON', // 资源类型，默认 BUTTON
            code: resourceNode.code || '',
            selected: resourceNode.selected || false,
          };
          resources.push(resource);
          resourceMap.set(resource.id, resource);
          resourceMenuMap.set(resource.id, menuId);
        }
      }
    }

    const menu: MenuNode = {
      id: menuNode.id,
      name: menuNode.name,
      menuId: menuId,
      systemId,
      parentMenuId,
      resources,
      selected: menuNode.selected || false,
      level,
      children: [],
    };

    menuMap.set(menu.id, menu);

    // 建立父子关系
    if (parentMenuId) {
      menuParentMap.set(menuId, parentMenuId);
      if (!menuChildrenMap.has(parentMenuId)) {
        menuChildrenMap.set(parentMenuId, []);
      }
      menuChildrenMap.get(parentMenuId)!.push(menuId);
    }

    // 处理子菜单（递归）
    if (menuNode.children) {
      for (const child of menuNode.children) {
        if (child.type === 'menu') {
          // 这是子菜单节点
          const childMenu = processMenuNode(child, systemId, menuId, level + 1);
          menu.children!.push(childMenu);
        }
      }
    }

    return menu;
  }

  // 处理系统节点
  for (const node of trees) {
    // 只处理系统节点
    if (node.type !== 'system') {
      continue;
    }

    const systemNode = node as SystemPermissionNode;
    const systemId = systemNode.systemId;
    const menus: MenuNode[] = [];

    // 处理菜单节点
    if (systemNode.children) {
      for (const child of systemNode.children) {
        if (child.type === 'menu') {
          // 这是菜单节点
          const menu = processMenuNode(child, systemId, undefined, 0);
          menus.push(menu);
        }
      }
    }

    const system: SystemNode = {
      id: systemNode.id,
      name: systemNode.name,
      systemId,
      menus,
    };

    systemMap.set(systemId, system);
  }

  return {
    systems: Array.from(systemMap.values()),
    systemMap,
    menuMap,
    resourceMap,
    menuParentMap,
    menuChildrenMap,
    resourceMenuMap,
  };
}

/**
 * 从树中提取所有已选中的节点ID
 */
export function extractSelectedIds(
  trees: PermissionTreeNode[],
): {
  selectedMenuIds: Set<string>;
  selectedResourceIds: Set<string>;
} {
  const selectedMenuIds = new Set<string>();
  const selectedResourceIds = new Set<string>();

  function traverse(node: PermissionTreeNode) {
    // 根据节点类型和选中状态提取ID
    if (node.selected) {
      if (node.type === 'menu') {
        selectedMenuIds.add(node.id);
      } else if (node.type === 'resource') {
        selectedResourceIds.add(node.id);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const tree of trees) {
    traverse(tree);
  }

  return {
    selectedMenuIds,
    selectedResourceIds,
  };
}

