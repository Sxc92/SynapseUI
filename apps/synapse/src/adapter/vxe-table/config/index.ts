/**
 * VXE Table 配置中心
 *
 * 统一管理 VXE Table 的所有配置项，包括：
 * - 全局网格配置
 * - 自定义渲染器
 * - 自定义格式化器
 * - 工具栏按钮配置
 */

export {
  formatBankCard,
  formatFileSize,
  formatIdCard,
  formatMoney,
  formatPercent,
  formatPhone,
  registerFormatters,
} from './formatters';
export { defaultGridConfig } from './grid-config';
export { registerRenderers } from './renderers';
export {
  createToolbarButtons,
  type ToolbarButtonConfig,
  type ProcessedToolbarButton,
  type CreateToolbarButtonsOptions,
} from './toolbar-config';

// 注意：formatNumber 是格式化器名称，不是函数，不需要导出
// 如果需要格式化函数，可以从 formatters.ts 中导出
