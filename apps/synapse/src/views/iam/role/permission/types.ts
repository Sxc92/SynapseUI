
/**
 * 系统节点
 */
export interface SystemNode {
  id: string;
  name: string;
  systemId: string;
  menus: MenuNode[];
}

/**
 * 菜单节点
 */
export interface MenuNode {
  id: string;
  name: string;
  menuId: string;
  systemId: string;
  parentMenuId?: string; // 支持多级菜单
  children?: MenuNode[]; // 子菜单
  resources: ResourceNode[]; // 该菜单下的资源
  selected?: boolean; // 是否选中（从后端返回）
  level?: number; // 菜单层级（用于缩进显示）
}

/**
 * 资源节点
 */
export interface ResourceNode {
  id: string;
  name: string;
  resourceId: string;
  menuId: string;
  type: 'API' | 'BUTTON'; // 资源类型
  code: string; // 权限编码
  selected?: boolean; // 是否选中（从后端返回）
}

/**
 * 权限状态
 */
export interface PermissionState {
  // 数据索引
  systemMap: Map<string, SystemNode>;
  menuMap: Map<string, MenuNode>;
  resourceMap: Map<string, ResourceNode>;
  
  // 父子关系
  menuParentMap: Map<string, string>; // menuId -> parentMenuId
  menuChildrenMap: Map<string, string[]>; // menuId -> childMenuIds[]
  resourceMenuMap: Map<string, string>; // resourceId -> menuId
  
  // 选中状态
  selectedSystemId: string | null;
  selectedSystemIds: Set<string>; // 新增：选中的系统ID集合
  selectedMenuId: string | null;
  selectedMenuIds: Set<string>;
  selectedResourceIds: Set<string>;
  expandedMenuIds: Set<string>;
  
  // UI 状态
  searchKeyword: string;
  filteredMenus: MenuNode[];
}

/**
 * 权限统计
 */
export interface PermissionStats {
  selectedSystemCount: number; // 新增：选中的系统数量
  selectedMenuCount: number;
  selectedResourceCount: number;
  totalSystemCount: number; // 新增：系统总数
  totalMenuCount: number;
  totalResourceCount: number;
}

