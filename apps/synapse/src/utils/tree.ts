/**
 * 树形数据处理工具函数
 */

/**
 * 树节点类型定义
 */
export interface TreeNode {
  id?: string | number | null | undefined;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * 过滤树形数据中的无效节点
 * 移除 id 为 undefined、null 或空字符串的节点，避免 Ant Design TreeSelect 的 TreeNode value 警告
 *
 * @param nodes 树形节点数组
 * @param valueField 节点值字段名，默认为 'id'
 * @returns 过滤后的有效节点数组
 *
 * @example
 * ```typescript
 * const validNodes = filterValidTreeNodes(menuTree, 'id');
 * ```
 */
export function filterValidTreeNodes<T extends TreeNode>(
  nodes: T[],
  valueField: string = 'id',
): T[] {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes
    .filter((node) => {
      if (!node || typeof node !== 'object') {
        return false;
      }

      const value = node[valueField];
      // 确保值字段有效（不是 undefined、null 或空字符串）
      const isValid = (
        value != null &&
        value !== undefined &&
        value !== '' &&
        !(typeof value === 'string' && value.trim() === '')
      );
      
      // 如果值无效，直接过滤掉
      if (!isValid) {
        return false;
      }
      
      return true;
    })
    .map((node) => {
      // 再次确保值字段有效（双重检查）
      const value = node[valueField];
      if (
        value == null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        // 如果值无效，不应该到达这里（因为已经过滤了），但为了安全起见，跳过
        return null;
      }
      
      const result: T = {
        ...node,
        // 确保值字段存在且有效
        [valueField]: value,
      } as T;

      // 递归处理子节点
      const childrenField = 'children';
      // 检查原始节点是否有 children 字段（包括空数组）
      if (childrenField in node) {
        if (Array.isArray(node[childrenField])) {
          // 如果 children 是数组（包括空数组），递归过滤子节点
          const filteredChildren = filterValidTreeNodes(
            node[childrenField] as T[],
            valueField,
          );
          // 保留过滤后的 children（即使是空数组也要保留，表示叶子节点）
          result[childrenField] = filteredChildren as any;
        } else {
          // 如果 children 不是数组（可能是 null、undefined 等），删除该字段
          delete result[childrenField];
        }
      }
      // 如果原始节点没有 children 字段，不添加它（保持原样）

      return result;
    })
    .filter((node): node is T => node !== null); // 过滤掉 null 值（双重检查的保险）
}

