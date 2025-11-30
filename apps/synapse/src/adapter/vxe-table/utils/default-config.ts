import type { VxeGridProps } from '#/adapter/vxe-table';
import { message } from 'ant-design-vue';

import { $t } from '#/locales';

import type { GridOptions } from '../types/grid';
import type { TreeConfigOptions } from './tree-config';
import { createPagerIcons } from './pager';
import { createSeqConfig } from './pager';

/**
 * 创建默认表格配置
 * @param options 表格配置选项
 * @param pagerInfoRef 分页信息的响应式引用
 * @param treeConfigOptions 树形配置选项
 * @returns 默认表格配置
 */
export function createDefaultGridProps<T = any>(
  options: GridOptions<T>,
  pagerInfoRef: any,
  treeConfigOptions: TreeConfigOptions | null,
): Partial<VxeGridProps<T>> {
  return {
    id: options.id || `grid-${Date.now()}`,
    border: true,
    round: true,
    loading: false,
    height: 'auto',
    minHeight: 300, // 设置最小高度
    showHeaderOverflow: true,
    // 树形结构不支持 stripe，所以当启用树形结构时禁用 stripe
    stripe: !treeConfigOptions, // 如果有树形配置，禁用斑马纹
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
    // 只传递 vxe-table 需要的字段，移除 parentField、rowField 和 indent
    ...(treeConfigOptions
      ? {
          treeConfig: {
            childrenField: treeConfigOptions.childrenField,
            expandAll: treeConfigOptions.expandAll,
            transform: treeConfigOptions.transform,
            showIcon: true, // 显示树形展开/折叠图标
            // indent 通过 CSS 控制，不是 vxe-table 的配置项
          },
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
      remote: true, // 启用远程排序，排序时自动触发请求
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
      autoHidden: true,

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
        query: createProxyQuery(options),
      },
      response: {
        result: 'records',
        total: 'total',
      },
    },
  };
}

/**
 * 创建代理查询函数
 * @param options 表格配置选项
 * @returns 代理查询函数
 */
function createProxyQuery<T = any>(options: GridOptions<T>) {
  return async ({ page, sorts }: any, formValues: any) => {
    try {
      // 处理表单值：将字符串 'true'/'false' 转换为布尔值
      // formValues 可能来自 extendProxyOptions 的合并，确保使用最新的值
      const processedFormValues = formValues ? { ...formValues } : {};

      // 遍历表单值，将字符串 'true'/'false' 转换为布尔值
      for (const key in processedFormValues) {
        const value = processedFormValues[key];
        if (value === 'true') {
          processedFormValues[key] = true;
        } else if (value === 'false') {
          processedFormValues[key] = false;
        }
      }

      // 处理排序参数，转换为后端要求的 orderByList 格式
      const sortParams: any = {};
      
      // 使用 vxe-table 提供的 sorts 参数（包含所有排序字段的数组）
      if (sorts && Array.isArray(sorts) && sorts.length > 0) {
        const orderByList: Array<{ field: string; direction: string }> = [];
        sorts.forEach((sortItem: any) => {
          // sorts 数组中的每个元素包含 property 和 order
          const field = sortItem.property || sortItem.field;
          const order = sortItem.order;
          if (field && order) {
            orderByList.push({
              field: field,
              direction: order.toUpperCase(), // 'asc' -> 'ASC', 'desc' -> 'DESC'
            });
          }
        });
        
        if (orderByList.length > 0) {
          sortParams.orderByList = orderByList;
        }
      }

      const requestParams = {
        ...processedFormValues,
        pageNo: page.currentPage,
        pageSize: page.pageSize,
        ...sortParams, // 添加排序参数
      };

      const res = await options.api.getPage(requestParams);

      // requestClient 已经提取了 data 字段，res 直接就是 { records: [], total: 0 } 格式
        // requestClient 已经判断过业务编码，能返回说明业务编码是 'SUCCESS'
      const pageData: { records: any[]; total: number } = {
        records: res?.records || [],
        total: res?.total || 0,
      };

      return pageData;
    } catch (error) {
      console.error('数据加载错误', error);
      message.error($t('common.queryFailed'));
      // 返回空数据结构，避免表格错误
      return {
        records: [],
        total: 0,
      };
    }
  };
}

