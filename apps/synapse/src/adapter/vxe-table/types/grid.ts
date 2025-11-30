import type { VxeGridProps } from '#/adapter/vxe-table';

/**
 * API 接口定义
 */
export interface ApiMethods {
  getPage: (params: any) => Promise<any>;
  enable?: (id: any) => Promise<any>;
  remove?: (ids: any[]) => Promise<any>;
}

/**
 * 表格配置选项
 */
export interface GridOptions<T = any> {
  // 表格标题
  tableTitle: string;
  // 表格ID
  id?: string;
  // 基础表格配置（可选，会与默认配置合并）
  gridProps?: Partial<VxeGridProps<T>>;
  // 搜索表单配置
  formOptions: any;
  // API方法
  api: ApiMethods;
  // 默认分页大小
  pageSize?: number;
  // 默认排序
  sortConfig?: {
    field: string;
    order: 'asc' | 'desc';
  };
  // 是否启用树形结构或树形配置
  treeConfig?:
    | {
        // 子节点字段名（已废弃，保留用于兼容，实际使用 childrenField）
        children?: string;
        // 是否展开全部
        expandAll?: boolean;
        // 缩进
        indent?: number;
        // 父级字段名
        parentField?: string;
        // 行ID字段名
        rowField?: string;
        // 是否转换数据（false 表示数据已经是树形结构，true 表示需要从扁平结构转换）
        transform?: boolean;
      }
    | boolean;
  // 自动检测树结构的父级字段名，默认为'parentId'
  parentFieldName?: string;
  // 列配置函数，接收 helper 函数作为参数（解决循环依赖）
  columns?: (helpers: {
    createActionButtons: (row: T) => any;
    createStatusSwitch: (row: T, field?: string) => any;
  }) => any[];
}

/**
 * 表格实例API
 */
export interface GridInstance<T = any> {
  // 表格组件
  Grid: any;
  // 表格API
  api: any;
  // 创建状态开关
  createStatusSwitch: (row: T, field?: string) => any;
  // 创建操作按钮
  createActionButtons: (row: T) => any;
  // 重新加载数据
  reload: () => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置字段值并触发搜索（用于外部触发的搜索，如侧边栏选择等）
  setFieldValueAndSearch: (fieldName: string, value: any) => Promise<void>;
}

/**
 * 预设操作类型
 */
export type PresetActionType = 'view' | 'edit' | 'delete';

/**
 * 预设操作配置
 */
export interface ActionPreset {
  /** 按钮文本的国际化 key */
  textKey: string;
  /** 图标 */
  icon: string;
  /** 是否危险操作 */
  danger?: boolean;
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  /** 默认确认提示的国际化 key */
  defaultConfirmKey?: string;
}

/**
 * 标准操作按钮配置接口
 * 支持预设操作和自定义操作
 */
export interface StandardActionConfig<T = any> {
  /** 
   * 操作类型
   * - 预设操作：'view' | 'edit' | 'delete'（使用预设配置）
   * - 自定义操作：任意字符串（需要提供 textKey 和 icon）
   */
  action: PresetActionType | string;
  /** 
   * 自定义操作的文本国际化 key（自定义操作时必填）
   * 预设操作时不需要，会自动使用预设的 textKey
   */
  textKey?: string;
  /** 
   * 自定义操作的图标（自定义操作时必填）
   * 预设操作时不需要，会自动使用预设的 icon
   */
  icon?: string;
  /** 权限代码数组（如果为空数组、空字符串数组、null 或 undefined，则不进行权限校验） */
  accessCodes?: string[] | null;
  /** 点击事件处理函数 */
  onClick: (row: T) => void | Promise<void>;
  /** 是否危险操作（可选，会覆盖预设配置） */
  danger?: boolean;
  /** 按钮类型（可选，会覆盖预设配置） */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  /** 确认提示的国际化 key（可选，会覆盖预设配置） */
  confirmKey?: string;
  /** 无权限时的提示消息国际化 key（可选） */
  noPermissionKey?: string;
  /** 是否禁用（额外条件，会与权限检查结果合并） */
  disabled?: boolean;
}

