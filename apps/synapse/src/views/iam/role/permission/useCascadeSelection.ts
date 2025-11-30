import type { MenuNode, SystemNode } from './types';

/**
 * 级联选择逻辑 Hook（三级联动：系统 → 菜单 → 资源）
 */
export function useCascadeSelection(
  systemMap: { value: Map<string, SystemNode> },
  menuMap: { value: Map<string, MenuNode> },
  menuParentMap: { value: Map<string, string> },
  menuChildrenMap: { value: Map<string, string[]> },
  resourceMenuMap: { value: Map<string, string> },
  selectedSystemIds: { value: Set<string> },
  selectedMenuIds: { value: Set<string> },
  selectedResourceIds: { value: Set<string> },
  loadResourcesByMenu?: (menuId: string) => Promise<void>,
) {
  /**
   * 选中资源时，级联选中菜单和系统
   */
  function selectResource(resourceId: string) {
    selectedResourceIds.value.add(resourceId);

    // 获取资源所属的菜单
    const menuId = resourceMenuMap.value.get(resourceId);
    if (!menuId) return;

    const menu = menuMap.value.get(menuId);
    if (!menu) return;

    // 自动选中菜单
        selectMenu(menuId);

    // 自动选中系统
    if (menu.systemId) {
      selectedSystemIds.value.add(menu.systemId);
    }
  }

  /**
   * 取消选中资源时，级联取消选中菜单（不取消系统，因为系统可能还有其他菜单/资源）
   */
  function deselectResource(resourceId: string) {
    selectedResourceIds.value.delete(resourceId);

    // 获取资源所属的菜单
    const menuId = resourceMenuMap.value.get(resourceId);
    if (!menuId) return;

    const menu = menuMap.value.get(menuId);
    if (!menu) return;

    // 检查该菜单是否还有其他资源被选中
    const hasOtherSelectedResources = menu.resources.some(
      (resource) => resource.id !== resourceId && selectedResourceIds.value.has(resource.id),
    );

    // 如果该菜单没有其他资源被选中，取消选中菜单
    if (!hasOtherSelectedResources) {
    deselectMenu(menuId);
  }
  }

  /**
   * 选中菜单时，级联选中系统、所有子菜单和资源
   */
  async function selectMenu(menuId: string) {
    console.log(`[useCascadeSelection] selectMenu: menuId=${menuId}`);
    // 如果已经选中，避免重复处理
    if (selectedMenuIds.value.has(menuId)) {
      console.log(`[useCascadeSelection] Menu ${menuId} already selected, skipping`);
      return;
    }

    selectedMenuIds.value.add(menuId);
    console.log(`[useCascadeSelection] Menu ${menuId} added to selectedMenuIds`);

    const menu = menuMap.value.get(menuId);
    if (!menu) {
      console.log(`[useCascadeSelection] Menu ${menuId} not found in menuMap`);
      return;
    }

    // 自动选中系统
    if (menu.systemId) {
      selectedSystemIds.value.add(menu.systemId);
      console.log(`[useCascadeSelection] System ${menu.systemId} added to selectedSystemIds`);
    }

    // 如果资源还没有加载，先加载资源
    if (menu.resources.length === 0 && loadResourcesByMenu) {
      console.log(`[useCascadeSelection] Menu ${menuId} has no resources, loading...`);
      await loadResourcesByMenu(menuId);
    }

    // 重新获取菜单（确保资源已更新）
    const updatedMenu = menuMap.value.get(menuId);
    console.log(`[useCascadeSelection] Updated menu resources count: ${updatedMenu?.resources?.length || 0}`);
    
    if (updatedMenu) {
    // 选中该菜单下的所有资源
      if (updatedMenu.resources && updatedMenu.resources.length > 0) {
        const resourceIds: string[] = [];
        for (const resource of updatedMenu.resources) {
          selectedResourceIds.value.add(resource.id);
          resourceIds.push(resource.id);
        }
        console.log(`[useCascadeSelection] Added ${resourceIds.length} resources to selectedResourceIds:`, resourceIds);
        console.log(`[useCascadeSelection] Current selectedResourceIds:`, Array.from(selectedResourceIds.value));
      } else if (loadResourcesByMenu) {
        // 如果资源还是空的，再次尝试加载（可能是缓存问题）
        console.log(`[useCascadeSelection] Resources still empty, retrying load...`);
        await loadResourcesByMenu(menuId);
        const finalMenu = menuMap.value.get(menuId);
        if (finalMenu && finalMenu.resources && finalMenu.resources.length > 0) {
          const resourceIds: string[] = [];
          for (const resource of finalMenu.resources) {
      selectedResourceIds.value.add(resource.id);
            resourceIds.push(resource.id);
          }
          console.log(`[useCascadeSelection] After retry, added ${resourceIds.length} resources:`, resourceIds);
          console.log(`[useCascadeSelection] Current selectedResourceIds:`, Array.from(selectedResourceIds.value));
        }
      }
    }

    // 递归选中所有子菜单
    const childMenuIds = menuChildrenMap.value.get(menuId) || [];
    for (const childMenuId of childMenuIds) {
      await selectMenu(childMenuId);
    }

    // 检查父菜单是否应该被选中（只要有一个子菜单被选中，父菜单就应该被选中）
    const parentMenuId = menuParentMap.value.get(menuId);
    if (parentMenuId && !selectedMenuIds.value.has(parentMenuId)) {
      const parentMenu = menuMap.value.get(parentMenuId);
      if (parentMenu && parentMenu.children) {
        // 检查是否至少有一个子菜单被选中
        const hasAnyChildSelected = parentMenu.children.some((child) =>
          selectedMenuIds.value.has(child.menuId),
        );

        // 只要有一个子菜单被选中，就选中父菜单
        if (hasAnyChildSelected) {
          // 只选中父菜单本身，不递归选中所有子菜单（避免循环）
          selectedMenuIds.value.add(parentMenuId);
          
          // 自动选中系统
          if (parentMenu.systemId) {
            selectedSystemIds.value.add(parentMenu.systemId);
          }
          
          // 选中父菜单下的所有资源
          if (parentMenu.resources && parentMenu.resources.length > 0) {
            for (const resource of parentMenu.resources) {
              selectedResourceIds.value.add(resource.id);
            }
          }
        }
      }
    }
  }

  /**
   * 取消选中菜单时，级联取消选中所有子菜单和资源（不取消系统，因为系统可能还有其他菜单）
   * 注意：只有当父菜单的所有子菜单都被取消选中时，才会取消选中父菜单
   */
  function deselectMenu(menuId: string) {
    // 如果已经取消选中，避免重复处理
    if (!selectedMenuIds.value.has(menuId)) {
      return;
    }

    selectedMenuIds.value.delete(menuId);

    const menu = menuMap.value.get(menuId);
    if (!menu) return;

    // 取消选中该菜单下的所有资源
    for (const resource of menu.resources) {
      selectedResourceIds.value.delete(resource.id);
    }

    // 递归取消选中所有子菜单
    const childMenuIds = menuChildrenMap.value.get(menuId) || [];
    for (const childMenuId of childMenuIds) {
      deselectMenu(childMenuId);
    }

    // 检查父菜单是否应该被取消选中（只有当所有子菜单都被取消选中时）
    const parentMenuId = menuParentMap.value.get(menuId);
    if (parentMenuId && selectedMenuIds.value.has(parentMenuId)) {
      const parentMenu = menuMap.value.get(parentMenuId);
      if (parentMenu && parentMenu.children) {
        // 检查父菜单的所有子菜单是否都被取消选中
        const allChildrenDeselected = parentMenu.children.every(
          (child) => !selectedMenuIds.value.has(child.menuId),
        );

        // 只有当所有子菜单都被取消选中时，才取消选中父菜单
        if (allChildrenDeselected) {
          deselectMenu(parentMenuId);
        }
      }
    }
  }

  /**
   * 选中系统时，级联选中该系统的所有菜单和资源
   */
  async function selectSystem(systemId: string) {
    selectedSystemIds.value.add(systemId);

    const system = systemMap.value.get(systemId);
    if (!system) return;

    // 选中该系统的所有菜单
    for (const menu of system.menus) {
      await selectMenu(menu.menuId);
    }
  }

  /**
   * 取消选中系统时，级联取消选中该系统的所有菜单和资源
   */
  function deselectSystem(systemId: string) {
    selectedSystemIds.value.delete(systemId);

    const system = systemMap.value.get(systemId);
    if (!system) return;

    // 取消选中该系统的所有菜单（会自动级联取消资源）
    for (const menu of system.menus) {
      deselectMenu(menu.menuId);
    }
  }

  /**
   * 批量选中当前系统的所有权限
   */
  async function selectAllInSystem(_systemId: string, systemMenus: MenuNode[]) {
    for (const menu of systemMenus) {
      await selectMenu(menu.menuId);
    }
  }

  /**
   * 批量取消选中当前系统的所有权限
   */
  function deselectAllInSystem(_systemId: string, systemMenus: MenuNode[]) {
    for (const menu of systemMenus) {
      deselectMenu(menu.menuId);
    }
  }

  /**
   * 批量选中当前菜单的所有资源
   */
  function selectAllResourcesInMenu(menuId: string) {
    const menu = menuMap.value.get(menuId);
    if (!menu) return;

    for (const resource of menu.resources) {
      selectedResourceIds.value.add(resource.id);
    }

    // 检查是否应该选中菜单
    if (menu.resources.length > 0) {
      const allSelected = menu.resources.every((resource) =>
        selectedResourceIds.value.has(resource.id),
      );
      if (allSelected) {
        selectMenu(menuId);
      }
    }
  }

  /**
   * 批量取消选中当前菜单的所有资源
   */
  function deselectAllResourcesInMenu(menuId: string) {
    const menu = menuMap.value.get(menuId);
    if (!menu) return;

    for (const resource of menu.resources) {
      selectedResourceIds.value.delete(resource.id);
    }

    // 取消选中菜单
    deselectMenu(menuId);
  }

  return {
    // 资源级联
    selectResource,
    deselectResource,
    // 菜单级联
    selectMenu,
    deselectMenu,
    // 系统级联
    selectSystem,
    deselectSystem,
    // 批量操作
    selectAllInSystem,
    deselectAllInSystem,
    selectAllResourcesInMenu,
    deselectAllResourcesInMenu,
  };
}

