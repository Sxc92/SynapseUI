import type { UserData } from './useUserTable';

import type { VxeGridProps } from '#/adapter/vxe-table';

/**
 * 用户表格的 gridProps 配置
 *
 * 这里定义了表格的所有自定义配置项
 * 可以通过 gridProps 传入任何 VxeGridProps 支持的配置
 */
export const gridConfig: Partial<VxeGridProps<UserData>> = {
  // 自定义边框样式: 'full' | 'outer' | 'inner' | 'none'
  border: 'full',
  // 自定义尺寸: 'large' | 'medium' | 'small' | 'mini'
  size: 'large',
  // 自定义复选框配置
  checkboxConfig: {
    highlight: true,
    trigger: 'default',
  },
  // 自定义筛选配置
  filterConfig: {
    remote: false,
    showIcon: true,
  },
  // 自定义工具栏配置
  toolbarConfig: {
    enabled: true,
    refresh: true,
    zoom: true,
    custom: true,
  },
  // 自定义排序配置
  sortConfig: {
    multiple: true,
    trigger: 'default',
  },
  // 其他常用配置
  autoResize: false, // 自动调整大小（禁用以避免频繁重排）
  columnConfig: {
    resizable: true, // 允许手动调整列宽
  },
  rowConfig: {
    isHover: true, // 行悬停效果
    resizable: false, // 禁用行高调整，避免频繁重排
  },
};

