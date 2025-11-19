import type { CountryData } from './types';

import type { VxeGridProps } from '#/adapter/vxe-table';

/**
 * 国家表格的 gridProps 配置
 *
 * 这里定义了表格的所有自定义配置项
 * 可以通过 gridProps 传入任何 VxeGridProps 支持的配置
 */
export const gridConfig: Partial<VxeGridProps<CountryData>> = {
  // 自定义表格高度
  // 注意：不要设置 height，使用默认的 'auto' 配合 CSS 限制高度
  // height: undefined, // 已移除，使用默认配置配合 CSS 控制高度
  // 自定义边框样式: 'full' | 'outer' | 'inner' | 'none'
  border: 'full',
  // 自定义尺寸: 'large' | 'medium' | 'small' | 'mini'
  size: 'large',
  // align: 'center',
  // 自定义复选框配置
  checkboxConfig: {
    highlight: true,
    trigger: 'default',
  },
  // stripe: true,
  // 自定义筛选配置
  filterConfig: {
    remote: false,
    showIcon: true,
  },
  // 注意：pagerConfig 已经在 createGrid 的默认配置中设置
  // 如果需要自定义分页配置，可以在这里覆盖
  // pagerConfig: { ... },

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
    // 如果需要默认排序，可以添加 defaultSort
    // defaultSort: {
    //   field: 'name',        // 排序字段名
    //   order: 'asc',         // 排序方向: 'asc' 升序 | 'desc' 降序
    // },
  },
  // 其他常用配置示例：
  autoResize: false, // 自动调整大小（禁用以避免频繁重排）
  columnConfig: {
    resizable: true, // 允许手动调整列宽
  },
  rowConfig: {
    isHover: true, // 行悬停效果
    resizable: false, // 禁用行高调整，避免频繁重排
  },
};
