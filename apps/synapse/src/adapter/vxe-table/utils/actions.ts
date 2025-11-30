import { $t } from '#/locales';

import type { ActionPreset, StandardActionConfig } from '../types/grid';

/**
 * 预设操作配置
 * 定义 view、edit、delete 三个预设操作的默认配置
 */
const actionPresets: Record<string, ActionPreset> = {
  view: {
    textKey: 'common.view',
    icon: 'mdi:eye-outline',
    type: 'default',
  },
  edit: {
    textKey: 'common.edit',
    icon: 'mdi:pencil-outline',
    type: 'default',
  },
  delete: {
    textKey: 'common.delete',
    icon: 'mdi:delete-outline',
    danger: true,
    type: 'default',
    defaultConfirmKey: 'common.deleteConfirm',
  },
};

/**
 * 创建标准化的操作按钮配置
 * 统一处理国际化、权限检查和消息提示
 *
 * 使用预设配置对象，业务只需配置 action key、权限码和点击事件
 *
 * @param actions 操作按钮配置数组
 * @param handlers 处理器配置（包含权限检查、消息提示、表格 API 等）
 * @returns 标准化的操作按钮配置数组，可直接用于 CellActions 组件
 *
 * @example
 * ```typescript
 * const actions = createStandardActions(
 *   [
 *     {
 *       action: 'view',
 *       accessCodes: ['system:view'],
 *       onClick: (row) => drawerForm.openView(row),
 *     },
 *     {
 *       action: 'edit',
 *       accessCodes: ['system:edit'],
 *       onClick: (row) => drawerForm.openEdit(row),
 *     },
 *     {
 *       action: 'delete',
 *       accessCodes: ['system:delete'],
 *       confirmKey: 'system.deleteConfirm', // 可覆盖默认确认提示
 *       onClick: async (row) => {
 *         const response = await deleteSystem(row.id);
 *         if (response.code === 200) {
 *           message.success($t('common.deleteSuccess'));
 *           reload();
 *         }
 *       },
 *     },
 *   ],
 *   {
 *     hasAccessByCodes,
 *     message,
 *     gridApi: () => gridApiRef.value,
 *     reload: () => reloadRef.value,
 *   }
 * );
 * ```
 */
/**
 * 判断是否需要权限校验
 * 如果 accessCodes 是空数组、空字符串数组、null 或 undefined，则不需要权限校验
 */
function shouldCheckPermission(accessCodes?: string[] | null): boolean {
  if (!accessCodes || accessCodes.length === 0) {
    return false;
  }
  // 检查是否所有元素都是空字符串
  const hasNonEmptyCode = accessCodes.some((code) => code && code.trim() !== '');
  return hasNonEmptyCode;
}

export function createStandardActions<T = any>(
  actions: StandardActionConfig<T>[],
  handlers: {
    /** 权限检查函数 */
    hasAccessByCodes?: (codes: string[]) => boolean;
    /** 消息提示函数 */
    message?: {
      warning: (content: string) => void;
      success: (content: string) => void;
      error: (content: string) => void;
    };
    /** 表格 API（用于设置加载状态，可以是函数以支持响应式） */
    gridApi?:
      | {
          setLoading: (loading: boolean) => void;
        }
      | (() => {
          setLoading: (loading: boolean) => void;
        } | undefined);
    /** 刷新函数（可以是函数以支持响应式） */
    reload?: (() => void) | (() => (() => void) | undefined);
  },
) {
  const { hasAccessByCodes, message: msg } = handlers;

  return actions.map((actionConfig) => {
    const {
      action: actionKey,
      textKey: customTextKey,
      icon: customIcon,
      accessCodes,
      onClick: originalOnClick,
      danger: customDanger,
      type: customType,
      confirmKey: customConfirmKey,
      noPermissionKey,
      disabled: customDisabled = false,
    } = actionConfig;

    // 获取预设配置
    const preset = actionPresets[actionKey];
    
    let textKey: string;
    let icon: string;
    let danger: boolean;
    let type: string;
    let confirmKey: string | undefined;

    if (preset) {
      // 使用预设配置，允许业务配置覆盖
      textKey = preset.textKey;
      icon = preset.icon;
      danger = customDanger !== undefined ? customDanger : preset.danger || false;
      type = customType || preset.type || 'default';
      confirmKey = customConfirmKey || preset.defaultConfirmKey;
    } else {
      // 自定义操作：必须提供 textKey 和 icon
      if (!customTextKey || !customIcon) {
        console.error(
          `[createStandardActions] 自定义 action "${actionKey}" 必须提供 textKey 和 icon。`,
        );
        return null;
      }
      textKey = customTextKey;
      icon = customIcon;
      danger = customDanger || false;
      type = customType || 'default';
      confirmKey = customConfirmKey;
    }

    // 判断是否需要权限校验
    const needCheckPermission = shouldCheckPermission(accessCodes);
    
    // 检查权限（如果不需要权限校验，则默认有权限）
    const hasPermission = needCheckPermission
      ? hasAccessByCodes?.(accessCodes!) ?? true
      : true;
    const disabled = !hasPermission || customDisabled;

    // 包装 onClick，自动添加权限检查
    // 注意：加载状态和刷新操作需要在 originalOnClick 内部处理
    const onClick = (row: T) => {
      // 如果需要权限校验，再次检查权限（防止权限在渲染后发生变化）
      if (needCheckPermission && !hasAccessByCodes?.(accessCodes!)) {
        const noPermissionMessage = noPermissionKey
          ? $t(noPermissionKey)
          : $t('common.noPermission');
        msg?.warning(noPermissionMessage);
        return;
      }

      // 执行原始 onClick（内部可以自行处理加载状态和刷新）
      originalOnClick(row);
    };

    return {
      text: $t(textKey),
      icon,
      danger,
      type,
      disabled,
      confirm: confirmKey ? $t(confirmKey) : undefined,
      onClick,
    };
  }).filter(Boolean); // 过滤掉 null 值
}

