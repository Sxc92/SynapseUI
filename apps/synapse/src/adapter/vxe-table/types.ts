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

export interface CellActionItem {
  /** 按钮文本 */
  text: string;
  /** 点击事件 */
  onClick?: (row: any, column: any) => void;
  /** 确认提示（字符串或配置对象） */
  confirm?: string | { cancelText?: string; okText?: string; title: string };
  /** 是否危险操作 */
  danger?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 图标 */
  icon?: any;
}

export interface CellActionsProps {
  /** 操作按钮列表 */
  actions?: CellActionItem[];
  /** 按钮尺寸 */
  size?: 'large' | 'middle' | 'small';
  /** 按钮类型 */
  type?: 'dashed' | 'default' | 'link' | 'primary' | 'text';
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
      | 'CellTooltip';
    props?: Record<string, any>;
  };
  /** 使用格式化器 */
  formatter?:
    | ((params: { cellValue: any; column: any; row: any }) => string)
    | string;
}
