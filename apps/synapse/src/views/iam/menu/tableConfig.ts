import type { MenuData } from './menuTable';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { getAllSystems } from '#/api/iam/system';

/**
 * 菜单表格的 gridProps 配置
 *
 * 这里定义了表格的所有自定义配置项
 * 可以通过 gridProps 传入任何 VxeGridProps 支持的配置
 */
export const gridConfig: Partial<VxeGridProps<MenuData>> = {
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

/**
 * 搜索表单配置
 * 使用函数形式返回配置，避免函数被 structuredClone 处理
 */
export const formOptions = () => ({
  collapsed: false,
  // 显示搜索按钮（手动触发搜索）
  submitButtonOptions: {
    show: true,
  },
  // 显示重置按钮（清除所有搜索条件）
  resetButtonOptions: {
    show: true,
  },
  schema: [
    // 系统字段已移至左侧系统列表，但保留在表单中（隐藏）以确保搜索条件正确传递
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllSystems,
        labelField: 'name',
        valueField: 'id',
        placeholder: $t('system.selectPlaceholder'),
        allowClear: true,
      },
      fieldName: 'systemId',
      label: $t('system.name'),
      hide: true, // 隐藏字段，但保留在表单值中
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('menu.searchCodePlaceholder'),
      },
      fieldName: 'code',
      label: $t('menu.code'),
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('menu.searchNamePlaceholder'),
      },
      fieldName: 'name',
      label: $t('menu.name'),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: $t('common.selectStatusPlaceholder'),
        options: [
          { label: $t('common.enabled'), value: 'true' },
          { label: $t('common.disabled'), value: 'false' },
        ],
      },
      fieldName: 'status',
      label: $t('common.status'),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: $t('menu.selectVisiblePlaceholder'),
        options: [
          { label: $t('menu.show'), value: 'true' },
          { label: $t('menu.hide'), value: 'false' },
        ],
      },
      fieldName: 'visible',
      label: $t('menu.visible'),
    },
  ],
  collapseTriggerResize: false,
});

