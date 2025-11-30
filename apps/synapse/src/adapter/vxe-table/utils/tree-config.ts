import type { GridOptions } from '../types/grid';

/**
 * 树形配置选项
 */
export interface TreeConfigOptions {
  parentField: string;
  rowField: string;
  childrenField: string;
  indent: number;
  expandAll: boolean;
  transform: boolean;
}

/**
 * 规范化树形配置
 * @param treeConfig 树形配置（可以是布尔值或配置对象）
 * @returns 规范化后的树形配置对象，如果不需要树形结构则返回 null
 */
export function normalizeTreeConfig(
  treeConfig: GridOptions['treeConfig'],
): TreeConfigOptions | null {
  if (!treeConfig) {
    return null;
  }

  // 如果是布尔值，使用默认配置
  if (typeof treeConfig === 'boolean') {
    return {
      parentField: 'parentId',
      rowField: 'id',
      childrenField: 'children', // 使用 childrenField 替代废弃的 children
      indent: 20,
      expandAll: false,
      transform: true, // 当启用 drag 时，必须设置为 true
    };
  }

  // 使用用户配置并填充默认值
  return {
    parentField: treeConfig.parentField || 'parentId',
    rowField: treeConfig.rowField || 'id',
    childrenField: treeConfig.children || 'children',
    indent: treeConfig.indent || 20,
    expandAll: treeConfig.expandAll || false,
    transform: (treeConfig as any).transform ?? true,
  };
}

