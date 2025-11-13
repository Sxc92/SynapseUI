import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

/**
 * VXE Table 全局网格配置
 * 这里定义了所有表格的默认配置项
 */
export const defaultGridConfig: VxeTableGridOptions = {
  // ========== 基础配置 ==========
  /** 对齐方式 */
  align: 'center',
  /** 是否显示边框 */
  border: false,
  /** 是否显示斑马纹 */
  stripe: false,
  /** 是否圆角 */
  round: true,
  /** 尺寸 */
  size: 'small',
  /** 高度 */
  height: 'auto',
  /** 最小高度 */
  minHeight: 180,
  /** 最大高度 */
  maxHeight: undefined,
  /** 显示内容溢出 */
  showOverflow: true,
  /** 显示表头溢出 */
  showHeaderOverflow: true,
  /** 显示表尾溢出 */
  showFooterOverflow: true,
  /** 是否自动换行（默认禁用，避免无限滚动问题） */
  autoResize: false,
  /** 是否保持原始数据（使用 proxyConfig 时必须为 true） */
  keepSource: true,
  /** 是否显示表尾合计 */
  showFooter: false,
  /** 是否显示表头 */
  showHeader: true,

  // ========== 列配置 ==========
  columnConfig: {
    /** 是否可调整列宽 */
    resizable: true,
    /** 最小列宽 */
    minWidth: 80,
    /** 最大列宽 */
    maxWidth: undefined,
  },

  // ========== 行配置 ==========
  rowConfig: {
    /** 行主键字段 */
    keyField: 'id',
    /** 是否启用行高亮 */
    isHover: true,
    /** 是否启用行选中高亮 */
    isCurrent: false,
  },

  // ========== 选择配置 ==========
  checkboxConfig: {
    /** 是否高亮选中行 */
    highlight: false,
    /** 选中时的触发方式 */
    trigger: 'default',
    /** 是否严格模式 */
    strict: false,
    /** 选中标签字段 */
    labelField: undefined,
  },
  radioConfig: {
    /** 是否高亮选中行 */
    highlight: false,
    /** 选中时的触发方式 */
    trigger: 'default',
    /** 是否严格模式 */
    strict: false,
    /** 选中标签字段 */
    labelField: undefined,
  },

  // ========== 分页配置 ==========
  pagerConfig: {
    /** 是否启用 */
    enabled: true,
    /** 当前页 */
    currentPage: 1,
    /** 每页数量 */
    pageSize: 20,
    /** 每页数量选项 */
    pageSizes: [10, 20, 30, 50, 100, 200],
    /** 总条数 */
    total: 0,
    /** 是否显示背景 */
    background: true,
    /** 分页器布局 */
    layouts: [
      'Total',
      'Sizes',
      'PrevJump',
      'PrevPage',
      'Number',
      'NextPage',
      'NextJump',
      'Jump',
    ],
  },

  // ========== 表单配置（已禁用，使用 formOptions） ==========
  formConfig: {
    /** 全局禁用vxe-table的表单配置，使用formOptions */
    enabled: true,
  },

  // ========== 代理配置 ==========
  proxyConfig: {
    /** 是否启用代理模式 */
    enabled: false,
    /** 是否自动加载 */
    autoLoad: false,
    /** 是否显示加载状态 */
    showLoading: true,
    /** 是否自动序号 */
    seq: true,
    /** 响应数据字段映射 */
    response: {
      result: 'items',
      total: 'total',
      list: 'items',
    },
    /** 是否显示活动消息 */
    showActiveMsg: true,
    /** 是否显示响应消息 */
    showResponseMsg: false,
    /** 分页配置 */
    page: {
      currentPage: 1,
      pageSize: 20,
    },
    /** 排序配置 */
    sort: true,
    /** 筛选配置 */
    filter: true,
  },

  // ========== 工具栏配置 ==========
  toolbarConfig: {
    /** 是否启用 */
    enabled: true,
    /** 是否自定义工具栏 */
    custom: false,
    /** 工具栏按钮配置 */
    buttons: [],
    /** 工具栏工具配置 */
    tools: [],
    /** 工具栏插槽配置 */
    slots: {},
    /** 刷新按钮 */
    refresh: false,
    /** 导入按钮 */
    import: false,
    /** 导出按钮 */
    export: false,
    /** 打印按钮 */
    print: false,
    /** 缩放按钮 */
    zoom: false,
    /** 是否显示搜索表单切换按钮（扩展功能） */
    search: false,
  },

  // ========== 编辑配置 ==========
  editConfig: {
    /** 是否启用 */
    enabled: false,
    /** 触发方式 */
    trigger: 'manual',
    /** 编辑模式 */
    mode: 'cell',
    /** 是否显示编辑状态 */
    showStatus: true,
    /** 是否显示更新状态 */
    showUpdateStatus: true,
    /** 是否显示插入状态 */
    showInsertStatus: true,
  },

  // ========== 排序配置 ==========
  sortConfig: {
    /** 是否支持多列排序 */
    multiple: false,
    /** 触发方式 */
    trigger: 'default',
    /** 排序方法 */
    sortMethod: undefined,
    /** 默认排序 */
    defaultSort: undefined,
    /** 是否远程排序 */
    remote: false,
  },

  // ========== 筛选配置 ==========
  filterConfig: {
    /** 是否显示筛选图标 */
    showIcon: true,
    /** 筛选方法 */
    filterMethod: undefined,
    /** 是否远程筛选 */
    remote: false,
  },

  // ========== 树形配置 ==========
  treeConfig: {
    /** 子节点字段名（新配置） */
    childrenField: 'children',
    /** 是否展开所有 */
    expandAll: false,
    /** 是否手风琴模式 */
    accordion: false,
    /** 触发方式 */
    trigger: 'default',
    /** 是否保留展开状态 */
    reserve: false,
    /** 是否懒加载 */
    lazy: false,
    /** 是否存在子节点字段 */
    hasChild: 'hasChild',
    /** 是否显示图标 */
    showIcon: true,
    /** 是否转换数据（当启用 row-config.drag 时必须为 true） */
    transform: true,
  },

  // ========== 展开配置 ==========
  expandConfig: {
    /** 触发方式 */
    trigger: 'default',
    /** 是否懒加载 */
    lazy: false,
    /** 是否显示图标 */
    showIcon: true,
  },

  // ========== 导出配置 ==========
  exportConfig: {
    /** 导出类型 */
    types: ['csv', 'html', 'xml', 'txt'],
    /** 导出方式 */
    modes: ['current', 'selected', 'all'],
    /** 导出文件名 */
    filename: undefined,
    /** 导出原始数据 */
    original: false,
    /** 导出消息 */
    message: true,
    /** 是否包含表头 */
    isHeader: true,
    /** 是否包含表尾 */
    isFooter: false,
  },

  // ========== 导入配置 ==========
  importConfig: {
    /** 导入模式 */
    modes: ['covering', 'insert'],
    /** 导入类型 */
    types: ['csv'],
    /** 导入消息 */
    message: true,
  },

  // ========== 打印配置 ==========
  printConfig: {},

  // ========== 菜单配置 ==========
  menuConfig: {},

  // ========== 虚拟滚动配置 ==========
  scrollY: {
    /** 是否启用 */
    enabled: false,
    /** 触发虚拟滚动的阈值 */
    gt: 0,
    /** 虚拟滚动行高 */
    oSize: 0,
  },
  scrollX: {
    /** 是否启用 */
    enabled: false,
    /** 触发虚拟滚动的阈值 */
    gt: 0,
  },
};
