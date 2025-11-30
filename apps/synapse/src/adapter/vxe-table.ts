import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { useVbenForm } from './form';
// 导入配置中心
import {
  defaultGridConfig,
  registerFormatters,
  registerRenderers,
} from './vxe-table/config';

/**
 * 配置 VXE Table
 *
 * 使用配置中心统一管理所有配置项，包括：
 * - 全局网格配置
 * - 自定义渲染器
 * - 自定义格式化器
 */
setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    // 1. 设置全局网格配置
    vxeUI.setConfig({
      grid: defaultGridConfig as VxeTableGridOptions,
    });

    // 2. 注册所有自定义渲染器
    registerRenderers(vxeUI);

    // 3. 注册所有自定义格式化器
    registerFormatters(vxeUI);
  },
  useVbenForm,
});

// 导出核心 API
export { useVbenVxeGrid };

// 导出配置中心和工具函数
export {
  defaultGridConfig,
  formatBankCard,
  formatFileSize,
  formatIdCard,
  formatMoney,
  formatPercent,
  formatPhone,
  registerFormatters,
  registerRenderers,
} from './vxe-table/config';
// 导出 Grid 组件和相关功能
export {
  createGrid,
  createStandardActions,
} from './vxe-table/grid';

// 导出类型定义
export type {
  ApiMethods,
  GridInstance,
  GridOptions,
  StandardActionConfig,
} from './vxe-table/grid';
export type * from './vxe-table/types';

// 导出类型定义
export type * from '@vben/plugins/vxe-table';
