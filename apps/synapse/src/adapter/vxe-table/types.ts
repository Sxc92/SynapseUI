/**
 * VXE Table 扩展类型定义
 */

import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

/**
 * 渲染器选项类型
 */
export interface RendererOptions {
  props?: Record<string, any>;
  params?: {
    [key: string]: any;
    column?: any;
    row?: any;
  };
}

/**
 * 单元格渲染器 Props
 */
export interface CellImageProps {
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 是否可预览 */
  preview?: boolean;
  /** 加载失败时的占位图 */
  fallback?: string;
}

export interface CellLinkProps {
  /** 链接文本 */
  text?: string;
  /** 链接地址 */
  href?: string;
  /** 打开方式 */
  target?: '_blank' | '_parent' | '_self' | '_top';
  /** 点击事件 */
  onClick?: (row: any, column: any) => void;
}

export interface CellTagProps {
  /** 标签颜色 */
  color?: string;
  /** 颜色映射对象 */
  colorMap?: Record<string, string>;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭事件 */
  onClose?: (row: any, column: any) => void;
}

export interface CellStatusInfo {
  /** 状态文本 */
  text?: string;
  /** 状态类型 */
  status?: 'default' | 'error' | 'success' | 'warning';
  /** 是否显示为徽标 */
  badge?: boolean;
}

export interface CellStatusProps {
  /** 状态映射对象 */
  statusMap?: Record<string, CellStatusInfo>;
  /** 是否显示圆点 */
  showDot?: boolean;
}

/**
 * 内置按钮类型
 */
export type BuiltInActionType = 'view' | 'edit' | 'delete';

/**
 * 内置按钮配置
 */
export interface BuiltInActionConfig {
  /** 内置按钮类型 */
  action: BuiltInActionType;
  /** 权限代码数组 */
  accessCodes: string[];
  /** 自定义确认提示（仅用于 delete，可选） */
  confirm?: string | { cancelText?: string; okText?: string; title: string };
}

/**
 * 自定义按钮配置
 */
export interface CustomActionConfig {
  /** 按钮文本（支持字符串或函数，函数用于国际化，在渲染时调用） */
  text: string | (() => string);
  /** 图标 */
  icon?: any;
  /** 权限代码数组（如果提供，会自动进行权限检查和禁用处理） */
  accessCodes?: string[];
  /** 点击事件（如果提供 accessCodes，会自动添加权限检查） */
  onClick?: (row: any, column: any) => void;
  /** 确认提示（字符串或配置对象） */
  confirm?: string | { cancelText?: string; okText?: string; title: string };
  /** 是否危险操作 */
  danger?: boolean;
  /** 是否禁用（如果提供了 accessCodes，会根据权限自动设置，此选项作为额外条件） */
  disabled?: boolean;
  /** 按钮类型（如果设置，会覆盖 props 中的 type） */
  type?: 'dashed' | 'default' | 'link' | 'primary' | 'text';
  /** 无权限时的提示消息（可选，默认使用通用提示，支持字符串或函数） */
  noPermissionMessage?: string | (() => string);
}

/**
 * 操作按钮配置（内置或自定义）
 */
export type CellActionItem = BuiltInActionConfig | CustomActionConfig;

/**
 * 判断是否为内置按钮配置
 */
export function isBuiltInAction(
  action: CellActionItem,
): action is BuiltInActionConfig {
  return 'action' in action && 'accessCodes' in action;
}

/**
 * 内置按钮处理器配置
 */
export interface BuiltInActionHandlers {
  /** 查看详情处理器 */
  onView?: (row: any) => void;
  /** 编辑处理器 */
  onEdit?: (row: any) => void;
  /** 删除处理器 */
  onDelete?: (row: any) => Promise<any>;
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
}

export interface CellActionsProps {
  /** 操作按钮列表 */
  actions?: CellActionItem[];
  /** 按钮尺寸 */
  size?: 'large' | 'middle' | 'small';
  /** 按钮类型 */
  type?: 'dashed' | 'default' | 'link' | 'primary' | 'text';
  /** 内置按钮处理器（当使用内置按钮时需要） */
  handlers?: BuiltInActionHandlers;
  /** 显示模式：'buttons' 按钮模式（默认），'dropdown' 下拉菜单模式 */
  mode?: 'buttons' | 'dropdown';
  /** 下拉菜单触发按钮的文本（仅在 mode='dropdown' 时有效） */
  dropdownText?: string;
  /** 下拉菜单触发按钮的图标（仅在 mode='dropdown' 时有效） */
  dropdownIcon?: string;
  /** 下拉菜单的宽度（仅在 mode='dropdown' 时有效，支持数字（px）或字符串，如 '140px'、'auto'） */
  dropdownWidth?: number | string;
}

export interface CellMoneyProps {
  /** 前缀 */
  prefix?: string;
  /** 小数精度 */
  precision?: number;
  /** 是否显示千分位 */
  thousands?: boolean;
  /** 文字颜色 */
  color?: string;
}

export interface CellProgressProps {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 状态 */
  status?: 'active' | 'exception' | 'normal' | 'success';
  /** 是否显示信息 */
  showInfo?: boolean;
  /** 自定义格式函数 */
  format?: (percent: number) => string;
  /** 进度条颜色 */
  strokeColor?: string;
  /** 未完成部分颜色 */
  trailColor?: string;
}

export interface CellTooltipProps {
  /** 提示内容 */
  title?: string;
  /** 提示位置 */
  placement?: 'bottom' | 'left' | 'right' | 'top';
  /** 最大宽度 */
  maxWidth?: number;
}

/**
 * 格式化器选项
 */
export interface FormatterOptions {
  precision?: number;
  prefix?: string;
  suffix?: string;
  thousands?: boolean;
  [key: string]: any;
}

/**
 * 扩展的表格配置选项（继承自 VxeTableGridOptions）
 */
export type ExtendedGridOptions = VxeTableGridOptions;

/**
 * 列配置扩展类型
 */
export interface ExtendedColumnConfig {
  /** 使用自定义渲染器 */
  cellRender?: {
    name:
      | 'CellActions'
      | 'CellImage'
      | 'CellLink'
      | 'CellMoney'
      | 'CellProgress'
      | 'CellStatus'
      | 'CellStatusIcon'
      | 'CellTag'
      | 'CellTooltip'
      | 'CellTreeSeq';
    props?: Record<string, any>;
  };
  /** 使用格式化器 */
  formatter?:
    | ((params: { cellValue: any; column: any; row: any }) => string)
    | string;
}
