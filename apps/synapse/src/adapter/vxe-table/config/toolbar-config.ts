import type { ComputedRef } from 'vue';

import { computed } from 'vue';

/**
 * 工具栏按钮配置
 *
 * 提供通用的工具栏按钮配置接口和类型定义
 * 用于在 gridConfig.ts 中配置表格工具栏按钮
 */

/**
 * 工具栏按钮配置接口
 *
 * 用于定义表格工具栏中的按钮配置
 * 支持权限检查、图标、禁用状态等配置
 */
export interface ToolbarButtonConfig {
  /** 按钮文本的国际化 key */
  textKey: string;
  /** 按钮类型 */
  type?: 'dashed' | 'default' | 'link' | 'primary' | 'text';
  /** 图标组件名称（从 @vben/icons 导入） */
  icon?: string;
  /** 权限码数组，用于权限检查 */
  accessCodes?: string[];
  /** 是否禁用（函数形式，支持响应式） */
  disabled?: () => boolean;
  /**
   * 点击事件处理函数（可选）
   * 如果不提供，会根据 textKey 自动绑定到对应的操作
   * 例如：'add' 会自动绑定到 drawerForm.openCreate
   */
  onClick?: () => void;
}

/**
 * 处理后的工具栏按钮配置
 * 包含实际的图标组件和绑定好的事件处理器
 */
export interface ProcessedToolbarButton extends ToolbarButtonConfig {
  /** 图标组件 */
  IconComponent?: any;
  /** 是否有权限 */
  hasPermission: boolean;
  /** 绑定好的点击事件处理器 */
  onClick: () => void;
  /** 禁用状态计算函数 */
  disabled: () => boolean;
}

/**
 * 创建工具栏按钮的选项
 */
export interface CreateToolbarButtonsOptions {
  /** 按钮配置数组 */
  configs: ToolbarButtonConfig[];
  /** 权限检查函数 */
  hasAccessByCodes: (codes: string[]) => boolean;
  /** 图标映射表 */
  iconMap: Record<string, any>;
  /** 事件处理器映射表（可选） */
  eventHandlers?: Record<string, () => void>;
}

/**
 * 创建工具栏按钮的工厂函数
 *
 * 将配置转换为实际可用的按钮配置，包括：
 * - 权限检查
 * - 图标组件映射
 * - 事件处理器绑定
 * - 禁用状态计算
 *
 * @param options 创建选项
 * @returns 处理后的按钮配置（响应式）
 */
export function createToolbarButtons(
  options: CreateToolbarButtonsOptions,
): ComputedRef<ProcessedToolbarButton[]> {
  const { configs, hasAccessByCodes, iconMap, eventHandlers = {} } = options;

  return computed(() => {
    return configs.map((config) => {
      // 检查权限
      // 如果 accessCodes 为空数组或包含空字符串，则不进行权限检查
      const hasValidAccessCodes =
        config.accessCodes &&
        config.accessCodes.some((code) => code && code.trim() !== '');
      const hasPermission = hasValidAccessCodes
        ? hasAccessByCodes(config.accessCodes!)
        : true;

      // 获取图标组件
      const IconComponent = config.icon ? iconMap[config.icon] : null;

      // 绑定实际的点击事件
      // 优先级：1. 配置中的 onClick 2. eventHandlers 中的处理器 3. 根据 textKey 自动绑定
      let onClickHandler = config.onClick;
      if (!onClickHandler) {
        // 先从 eventHandlers 中查找
        onClickHandler = eventHandlers[config.textKey];
      }

      // 如果还是没有，包装一个带权限检查的空函数
      if (onClickHandler) {
        // 如果配置了事件处理器，包装它以添加权限检查
        const originalOnClick = onClickHandler;
        onClickHandler = () => {
          // 如果有权限要求，先检查权限
          const hasValidAccessCodes =
            config.accessCodes &&
            config.accessCodes.some((code) => code && code.trim() !== '');
          if (hasValidAccessCodes && !hasAccessByCodes(config.accessCodes!)) {
            console.warn(`[${config.textKey}按钮] 无权限，阻止操作`);
            return;
          }
          originalOnClick();
        };
      } else {
        onClickHandler = () => {
          const hasValidAccessCodes =
            config.accessCodes &&
            config.accessCodes.some((code) => code && code.trim() !== '');
          if (hasValidAccessCodes && !hasAccessByCodes(config.accessCodes!)) {
            console.warn(`[${config.textKey}按钮] 无权限，阻止操作`);
            return;
          }
          console.warn(`[${config.textKey}按钮] 未配置事件处理器`);
        };
      }

      return {
        ...config,
        hasPermission,
        IconComponent,
        onClick: onClickHandler,
        disabled: () => {
          // 如果没有权限，禁用按钮
          // 只有当 accessCodes 有效时才进行权限检查
          const hasValidAccessCodes =
            config.accessCodes &&
            config.accessCodes.some((code) => code && code.trim() !== '');
          if (hasValidAccessCodes && !hasAccessByCodes(config.accessCodes!)) {
            return true;
          }
          // 如果有自定义的 disabled 函数，也执行它
          if (config.disabled) {
            return config.disabled();
          }
          return false;
        },
      };
    });
  });
}
