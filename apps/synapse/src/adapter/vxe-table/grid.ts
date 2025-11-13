import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, nextTick, ref } from 'vue';

import { mergeWithArrayOverride } from '@vben/utils';

import { Button, message, Modal, Popconfirm, Switch } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

/**
 * 创建分页图标配置
 * VxeTable 的分页图标配置只接受 CSS 类名字符串
 * 我们使用自定义的 CSS 类名，然后通过 CSS 样式覆盖为 Iconify 图标
 * @returns 分页图标配置对象
 */
function createPagerIcons() {
  // 使用自定义 CSS 类名，这些类名会在 CSS 中映射到 Iconify 图标
  // 通过 CSS 的方式实现图标替换，保持与 VxeTable 的兼容性
  return {
    iconHomePage: 'vxe-icon-pager-first-lucide', // 首页：将通过 CSS 显示为 Lucide 图标
    iconPrevJump: 'vxe-icon-pager-prev-jump-lucide', // 向前跳转：双左箭头
    iconPrevPage: 'vxe-icon-pager-prev-lucide', // 上一页：单左箭头
    iconNextPage: 'vxe-icon-pager-next-lucide', // 下一页：单右箭头
    iconNextJump: 'vxe-icon-pager-next-jump-lucide', // 向后跳转：双右箭头
    iconEndPage: 'vxe-icon-pager-last-lucide', // 末页：将通过 CSS 显示为 Lucide 图标
    iconJumpMore: 'vxe-icon-pager-more-lucide', // 更多：水平省略号
  };
}

/**
 * 创建序列号配置
 * @param pagerInfoRef 分页信息的响应式引用
 * @param defaultPageSize 默认每页大小
 * @returns 序列号配置对象
 */
function createSeqConfig(
  pagerInfoRef: ReturnType<
    typeof ref<{ currentPage: number; enabled: boolean; pageSize: number }>
  >,
  defaultPageSize: number = 10,
) {
  return {
    // 自定义序列号计算方法
    // 根据分页配置自动处理：如果启用分页，会根据当前页和每页大小计算；否则使用行索引+1
    seqMethod: ({ rowIndex }: any) => {
      // 使用闭包访问分页信息
      const pagerInfo = pagerInfoRef.value;

      // 检查是否启用了分页
      if (pagerInfo && pagerInfo.enabled) {
        const currentPage = pagerInfo.currentPage || 1;
        const pageSize = pagerInfo.pageSize || defaultPageSize;
        // 根据当前页和每页大小计算序列号
        // 例如：第1页显示 1-10，第2页显示 11-20
        return (currentPage - 1) * pageSize + rowIndex + 1;
      }

      // 如果没有分页配置，直接使用行索引+1（从1开始）
      return rowIndex + 1;
    },
  };
}

// 定义API接口
export interface ApiMethods {
  getPage: (params: any) => Promise<any>;
  enable?: (id: any) => Promise<any>;
  remove?: (ids: any[]) => Promise<any>;
}

// 定义表格配置选项
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

// 表格实例API
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
}

/**
 * 创建表格工厂函数
 * @param options 表格配置选项
 * @returns 表格实例
 */
export function createGrid<T = any>(options: GridOptions<T>): GridInstance<T> {
  if (!options) {
    throw new Error('Options must be provided');
  }

  // 使用 ref 存储 gridApi，避免在 proxyConfig 中访问未定义的变量
  const gridApiRef = ref<any>(null);

  // 存储分页信息，用于序列号计算
  const pagerInfoRef = ref<{
    currentPage: number;
    enabled: boolean;
    pageSize: number;
  }>({
    currentPage: 1,
    pageSize: options.pageSize || 10,
    enabled: true,
  });

  // 处理树形配置
  let treeConfigOptions = null;
  if (options.treeConfig) {
    // 如果是布尔值，使用默认配置
    treeConfigOptions =
      typeof options.treeConfig === 'boolean'
        ? {
            parentField: 'parentId',
            rowField: 'id',
            childrenField: 'children', // 使用 childrenField 替代废弃的 children
            indent: 20,
            expandAll: false,
            transform: true, // 当启用 drag 时，必须设置为 true
          }
        : {
            // 使用用户配置并填充默认值
            parentField: options.treeConfig.parentField || 'parentId',
            rowField: options.treeConfig.rowField || 'id',
            childrenField: options.treeConfig.children || 'children',
            indent: options.treeConfig.indent || 20,
            expandAll: options.treeConfig.expandAll || false,
            transform: (options.treeConfig as any).transform ?? true,
          };
    }

  // 创建状态开关函数（在初始化 grid 之前创建，避免循环依赖）
  const createStatusSwitch = (row: T, field = 'status') => {
    if (!options.api.enable) return null;

    return h(Switch, {
      checked: (row as any)[field],
      checkedChildren: $t('common.enabled'),
      unCheckedChildren: $t('common.disabled'),
      onChange: (checked: any) => {
        const isChecked = checked === true || checked === 'true';
        Modal.confirm({
          title: isChecked
            ? $t('common.confirmEnable')
            : $t('common.confirmDisabled'),
          icon: h('span', { class: 'anticon anticon-exclamation-circle' }),
          okText: $t('common.confirm'),
          onOk: async () => {
            try {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(true);
              }
              const result = await (options.api.enable as (id: any) => Promise<any>)((row as any).id);
              if (result.code === 200) {
                message.success(result.msg || $t('common.success'));
                if (gridApiRef.value) {
                  gridApiRef.value.reload();
                }
              } else {
                message.error(result.msg || $t('common.error'));
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error);
              message.error($t('common.error'));
            } finally {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(false);
              }
            }
          },
          onCancel: () => {},
        });
      },
    });
  };

  // 创建操作按钮函数（在初始化 grid 之前创建，避免循环依赖）
  const createActionButtons = (row: T) => {
    if (!options.api.remove) return null;

    return h(
      Popconfirm,
      {
        title: $t('common.confirmDelete'),
        icon: h('span', { class: 'anticon anticon-exclamation-circle' }),
        onConfirm: async () => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            const result = await (options.api.remove as (ids: any[]) => Promise<any>)([(row as any).id]);
            if (result.code === 200) {
              message.success($t('common.deleteSuccess'));
              if (gridApiRef.value) {
                gridApiRef.value.reload();
              }
            } else {
              message.error(result.msg || $t('common.deleteFailed'));
            }
          } catch (error) {
            message.error($t('common.deleteFailed'));
            console.error(error);
          } finally {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(false);
            }
          }
        },
      },
      {
        default: () =>
          h(Button, { type: 'link', danger: true }, () => $t('common.delete')),
      },
    );
  };

  // 处理列配置：如果提供了 columns 函数，则调用它；否则使用 gridProps.columns
  let finalColumns: any[] = [];
  if (typeof options.columns === 'function') {
    // 使用函数方式，传入 helper 函数
    finalColumns = options.columns({ createStatusSwitch, createActionButtons });
  } else if (options.gridProps?.columns) {
    // 使用用户提供的列配置
    finalColumns = options.gridProps.columns;
  }

  // 默认表格配置
  const defaultGridProps: Partial<VxeGridProps<T>> = {
    id: options.id || `grid-${Date.now()}`,
    border: true,
    round: true,
    loading: false,
    height: 'auto',
    minHeight: 300, // 设置最小高度
    showHeaderOverflow: true,
    stripe: true, // 斑马纹
    showHeader: true, // 显示表头
    showFooter: false, // 显示表尾
    align: 'left', // 表格对齐方式
    headerAlign: 'left', // 表头对齐方式
    showOverflow: true, // 显示溢出内容
    // 表格高度配置：使用 auto 让表格自适应容器
    resizableConfig: {
      // 列宽拖拽模式，支持自适应和固定模式 auto,fixed
      dragMode: 'fixed', // 改为 fixed 模式，避免频繁的自动调整导致重排
      // 禁用所有单元格的拖拽调整行高，避免频繁重排
      isAllRowDrag: false,
      // 显示拖拽提示，拖拽过程中显示信息
      showDragTip: true,
    },
    // 序列号配置
    // 如果需要自定义序列号列，可以在列配置中使用 { type: 'seq', ... }
    // seqConfig 用于配置序列号的全局行为
    seqConfig: createSeqConfig(pagerInfoRef, options.pageSize || 10),
    customConfig: {
      storage: true,
    },
    // 如果有树形配置，设置treeConfig
    ...(treeConfigOptions
      ? {
          treeConfig: treeConfigOptions as any,
        }
      : {}),
    rowConfig: {
      isHover: true,
      isCurrent: true,
      // 禁用行高调整，避免频繁重排
      resizable: false,
      // 注意：如果启用 drag，需要在 treeConfig 中设置 transform: true
      drag: false, // 默认禁用拖拽，避免与 treeConfig.transform 冲突
    },
    cellConfig: {
      height: 48, // 使用 cellConfig.height 替代废弃的 rowConfig.height
    },
    columnConfig: {
      minWidth: 100,
      resizable: true, // 允许手动调整列宽
    },
    // 禁用 autoResize 避免无限滚动问题
    // 如果需要自动调整大小，可以通过 gridProps 覆盖
    autoResize: false,
    // 当使用 proxyConfig 时，keepSource 必须为 true
    // 这是 vxe-table 的要求，用于追踪和管理数据源
    keepSource: true,
    // 禁用表格的自动刷新列宽，避免表单展开/收起时的尺寸重新计算
    scrollX: {
      enabled: false,
    },
    scrollY: {
      enabled: false,
    },
    sortConfig: {
      multiple: true,
      ...(options.sortConfig
        ? {
            defaultSort: {
              field: options.sortConfig.field,
              order: options.sortConfig.order,
            },
          }
        : {}),
    },
    toolbarConfig: {
      enabled: true,
      refresh: true,
      zoom: true,
    },
    pagerConfig: {
      enabled: true, // 启用分页
      perfect: true, // 启用完美模式，确保分页器正常布局
      background: true, // 显示背景
      border: true, // 显示边框
      align: 'center', // 对齐方式

      // 分页布局，按顺序显示各个组件
      layouts: [
        'Total', // 总条数
        'Sizes', // 每页大小选择器
        'PrevJump', // 向前跳转
        'PrevPage', // 上一页
        'Number', // 页码按钮
        'NextPage', // 下一页
        'NextJump', // 向后跳转
        'Jump', // 跳转到指定页
      ],

      // 自定义图标（使用 Iconify 图标库，更美观现代）
      ...createPagerIcons(),

      // 每页大小选项
      pageSizes: [10, 20, 30, 50, 100],
      pageSize: options.pageSize || 10,

      // 显示页码按钮的数量（默认 7）
      pagerCount: 7,

      // 当只有一页时是否自动隐藏
      autoHidden: false,

      // 自定义样式类名
      className: 'mt-2 w-full',
    } as any,
    proxyConfig: {
      enabled: true,
      autoLoad: true,
      // 启用自动序号（根据分页计算），如果启用，VxeTable 会自动处理序列号
      // 如果这个选项不能满足需求，可以通过 seqConfig.seqMethod 自定义
      seq: false, // 我们使用自定义的 seqMethod，所以设置为 false
      ajax: {
        query: async ({ page }: any, formValues: any) => {
          try {
            const res = await options.api.getPage({
              ...formValues,
              pageNo: page.currentPage,
              pageSize: page.pageSize,
            });

            // 自动识别返回格式：
            // 1. 如果是 { code: 200, data: { records, total }, msg } 格式
            // 2. 如果是 PageResponse 格式（直接有 records 和 total 属性）
            let pageData: { records: any[]; total: number };

            if (res.code === 200 && res.data) {
              // 标准格式：{ code: 200, data: { records, total }, msg }
              pageData = res.data;
            } else if (res.records && typeof res.total === 'number') {
              // PageResponse 格式：直接返回 { records, total, ... }
              // requestClient 已经判断过业务编码，能返回说明业务编码是 'SUCCESS'
              pageData = {
                records: res.records || [],
                total: res.total || 0,
              };
            } else {
              // 其他格式视为错误
              message.error(res.msg || $t('common.queryFailed'));
              return {
                records: [],
                total: 0,
              };
            }

            // 检查是否需要自动检测树形结构
            if (
              !options.treeConfig &&
              pageData.records &&
              Array.isArray(pageData.records) &&
              pageData.records.length > 0
            ) {
              const firstItem = pageData.records[0];
              const parentFieldName = options.parentFieldName || 'parentId';

              // 使用指定的父级字段名检测
              if (parentFieldName in firstItem) {
                // eslint-disable-next-line no-console
                console.log(
                  `检测到数据中包含${parentFieldName}字段，建议在配置中添加 treeConfig: true 以启用树形结构`,
                );
              }
            }

            return pageData;
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('数据加载错误', error);
            message.error($t('common.queryFailed'));
            // 返回空数据结构，避免表格错误
            return {
              records: [],
              total: 0,
            };
          }
        },
      },
      response: {
        result: 'records',
        total: 'total',
      },
    },
    // 如果有列配置，使用 finalColumns
    ...(finalColumns.length > 0 ? { columns: finalColumns } : {}),
  };

  // 合并用户配置（深度合并，特别是 pagerConfig 等嵌套对象）
  // 先合并默认配置和用户配置的基础部分
  const mergedGridProps: Partial<VxeGridProps<T>> = mergeWithArrayOverride(
    {},
    defaultGridProps,
    options.gridProps || {},
  ) as Partial<VxeGridProps<T>>;

  // 特殊处理 pagerConfig：深度合并，确保用户配置不被覆盖
  if (options.gridProps?.pagerConfig) {
    mergedGridProps.pagerConfig = mergeWithArrayOverride(
      {},
      defaultGridProps.pagerConfig,
      options.gridProps.pagerConfig,
    ) as any;
  }

  // 如果用户通过 columns 函数提供了列配置，优先使用它
  if (finalColumns.length > 0) {
    mergedGridProps.columns = finalColumns;
  }

  // 事件处理
  const gridEvents: VxeGridListeners<T> = {
    // 监听分页变化事件，更新分页信息
    // pageChange 事件在页码变化和每页大小变化时都会触发
    pageChange: ({ currentPage, pageSize }: any) => {
      pagerInfoRef.value = {
        currentPage: currentPage || 1,
        pageSize: pageSize || options.pageSize || 10,
        enabled: true,
      };
    },
    // 可以在这里添加自定义事件处理
  } as VxeGridListeners<T>;

  // 处理表单选项：为每个字段添加 blur 和 clear 事件，实现自动搜索
  // 统一设置默认配置：隐藏搜索按钮，显示重置按钮，使用 blur 和 clear 事件自动搜索
  const processedFormOptions = (() => {
    if (!options.formOptions) return options.formOptions;

    const formOptions = structuredClone(options.formOptions); // 深拷贝

    // 统一设置默认配置（用户配置会覆盖这些默认值）
    const defaultFormOptions = {
      resetButtonOptions: {
        show: true, // 默认显示重置按钮
      },
      submitButtonOptions: {
        show: false, // 默认隐藏搜索按钮，使用 blur 和 clear 事件自动搜索
      },
      submitOnChange: false, // 默认禁用自动提交，使用 blur 和 clear 事件自动搜索
      submitOnEnter: false, // 默认禁用回车提交
    };

    // 合并默认配置和用户配置（用户配置优先）
    Object.assign(formOptions, {
      resetButtonOptions: mergeWithArrayOverride(
        {},
        defaultFormOptions.resetButtonOptions,
        formOptions.resetButtonOptions || {},
      ),
      submitButtonOptions: mergeWithArrayOverride(
        {},
        defaultFormOptions.submitButtonOptions,
        formOptions.submitButtonOptions || {},
      ),
      submitOnChange:
        formOptions.submitOnChange === undefined
          ? defaultFormOptions.submitOnChange
          : formOptions.submitOnChange,
      submitOnEnter:
        formOptions.submitOnEnter === undefined
          ? defaultFormOptions.submitOnEnter
          : formOptions.submitOnEnter,
    });

    // 创建自动搜索函数（使用闭包访问 gridApiRef）
    const createAutoSearchHandler = (
      originalHandler?: (...args: any[]) => any,
    ) => {
      return async (...args: any[]) => {
        // 执行原有的处理函数（如果有）
        if (originalHandler) {
          originalHandler(...args);
        }
        // 延迟执行，确保值已更新
        await nextTick();
        if (gridApiRef.value) {
          const formValues = await gridApiRef.value.formApi?.getValues();
          gridApiRef.value.reload(formValues);
        }
      };
    };

    // 为每个字段添加 blur 和 clear 事件处理
    if (formOptions.schema && Array.isArray(formOptions.schema)) {
      formOptions.schema = formOptions.schema.map((field: any) => {
        const fieldConfig = { ...field };
        const originalComponentProps = fieldConfig.componentProps || {};

        // 添加 blur 事件：光标离开时自动搜索
        fieldConfig.componentProps = {
          ...originalComponentProps,
          onBlur: createAutoSearchHandler(originalComponentProps.onBlur),
        };

        // 如果字段支持 allowClear，添加 clear 事件：清空时也触发搜索
        if (originalComponentProps.allowClear) {
          fieldConfig.componentProps.onClear = createAutoSearchHandler(
            originalComponentProps.onClear,
          );
        }

        return fieldConfig;
      });
    }

    return formOptions;
  })();

  // 初始化表格
  const [Grid, gridApi] = useVbenVxeGrid({
    tableTitle: options.tableTitle,
    gridOptions: mergedGridProps as any,
    formOptions: processedFormOptions,
    gridEvents,
  });

  // 存储 gridApi 引用
  gridApiRef.value = gridApi;

  // 初始化分页信息：从合并后的配置中获取
  const finalPagerConfig = mergedGridProps.pagerConfig as any;
  if (finalPagerConfig) {
    pagerInfoRef.value = {
      currentPage: finalPagerConfig.currentPage || 1,
      pageSize: finalPagerConfig.pageSize || options.pageSize || 10,
      enabled: finalPagerConfig.enabled !== false,
    };
  }

  return {
    Grid,
    api: gridApi,
    createStatusSwitch,
    createActionButtons,
    reload: () => gridApi.reload(),
    setLoading: (loading: boolean) => gridApi.setLoading(loading),
  };
}
