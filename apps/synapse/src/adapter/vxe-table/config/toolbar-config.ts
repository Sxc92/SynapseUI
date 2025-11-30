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
 * 默认新增按钮配置
 */
export interface DefaultAddButtonConfig {
  /** 权限码数组 */
  accessCodes: string[];
  /** 点击事件处理函数 */
  action: () => void;
  /** 是否启用（默认 true） */
  enabled?: boolean;
  /** 图标名称（默认 'Plus'） */
  icon?: string;
}

/**
 * 创建工具栏按钮的简化配置选项
 * 支持默认新增按钮和自定义按钮
 */
export interface CreateToolbarButtonsSimpleOptions {
  /** 权限检查函数 */
  hasAccessByCodes: (codes: string[]) => boolean;
  /** 图标映射表 */
  iconMap: Record<string, any>;
  /** 默认新增按钮配置（可选） */
  addButton?: DefaultAddButtonConfig;
  /** 自定义按钮配置数组（可选） */
  customButtons?: ToolbarButtonConfig[];
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
      // 支持两种方式：
      // 1. 从 iconMap 中获取（组件形式）
      // 2. 如果是 mdi: 或 ic: 等 Iconify 格式，使用 VbenIcon 组件
      let IconComponent: any = null;
      let iconString: string | undefined = undefined;
      if (config.icon) {
        // 先尝试从 iconMap 中获取
        IconComponent = iconMap[config.icon];
        // 如果 iconMap 中没有，且是 Iconify 格式（如 mdi:plus），使用 VbenIcon 组件
        // 检查是否是 Iconify 格式：包含冒号的字符串（如 mdi:plus, ic:home 等）
        if (!IconComponent && typeof config.icon === 'string' && config.icon.includes(':')) {
          // 标记为 Iconify 格式，在组件中使用 VbenIcon
          iconString = config.icon;
        }
      }

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

      // 构建返回对象
      const result: any = {
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
      
      // 如果图标是 Iconify 格式，添加图标字符串
      if (iconString) {
        result._iconString = iconString;
        // 调试信息：确认图标字符串已设置
        console.debug('[ToolbarButton] 设置图标字符串:', iconString, 'config.icon:', config.icon);
      } else if (config.icon) {
        // 调试信息：如果图标存在但没有设置 iconString
        console.debug('[ToolbarButton] 图标未设置为字符串:', config.icon, 'IconComponent:', IconComponent);
      }
      
      return result;
    });
  });
}

/**
 * 创建工具栏按钮的简化工厂函数
 *
 * 支持默认新增按钮和自定义按钮的统一配置
 * - 如果提供了 addButton 配置，会自动添加默认的新增按钮
 * - 可以同时添加其他自定义按钮
 *
 * @param options 创建选项
 * @returns 处理后的按钮配置（响应式）
 *
 * @example
 * ```ts
 * const toolbarButtons = createToolbarButtonsSimple({
 *   hasAccessByCodes,
 *   iconMap,
 *   addButton: {
 *     accessCodes: ['role:create'],
 *     action: () => drawerForm.openCreate(),
 *   },
 *   customButtons: [
 *     {
 *       textKey: 'common.export',
 *       type: 'default',
 *       icon: 'Download',
 *       onClick: () => exportData(),
 *     },
 *   ],
 * });
 * ```
 */
export function createToolbarButtonsSimple(
  options: CreateToolbarButtonsSimpleOptions,
): ComputedRef<ProcessedToolbarButton[]> {
  const { hasAccessByCodes, iconMap, addButton, customButtons = [] } = options;

  // 构建按钮配置数组
  const configs: ToolbarButtonConfig[] = [];

  // 如果启用了默认新增按钮，添加到配置中
  if (addButton?.enabled !== false && addButton) {
    configs.push({
      textKey: 'common.add',
      type: 'primary',
      icon: addButton.icon || 'mdi:plus', // 支持自定义图标，默认为 'mdi:plus'
      accessCodes: addButton.accessCodes,
    });
  }

  // 添加自定义按钮
  configs.push(...customButtons);

  // 构建事件处理器映射
  const eventHandlers: Record<string, () => void> = {};
  if (addButton?.enabled !== false && addButton) {
    eventHandlers['common.add'] = addButton.action;
  }

  // 为自定义按钮添加事件处理器（如果配置中有 onClick）
  customButtons.forEach((button) => {
    if (button.onClick) {
      eventHandlers[button.textKey] = button.onClick;
    }
  });

  // 使用原有的 createToolbarButtons 函数
  return createToolbarButtons({
    configs,
    hasAccessByCodes,
    iconMap,
    eventHandlers,
  });
}
