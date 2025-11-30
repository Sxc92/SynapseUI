import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { mergeWithArrayOverride } from '@vben/utils';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import type {
  ApiMethods,
  GridInstance,
  GridOptions,
  StandardActionConfig,
} from './types/grid';
import { normalizeTreeConfig } from './utils/tree-config';
import { createStatusSwitchFactory, createActionButtonsFactory } from './utils/grid-helpers';
import { processFormOptions, createSetFieldValueAndSearch } from './utils/form-search';
import { createDefaultGridProps } from './utils/default-config';
import { createStandardActions } from './utils/actions';
import type { PagerInfo } from './utils/pager';

// 重新导出类型和函数，保持向后兼容
export type { ApiMethods, GridInstance, GridOptions, StandardActionConfig };
export { createStandardActions };

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
  const pagerInfoRef = ref<PagerInfo>({
    currentPage: 1,
    pageSize: options.pageSize || 10,
    enabled: true,
  });

  // 处理树形配置
  const treeConfigOptions = normalizeTreeConfig(options.treeConfig);

  // 创建状态开关函数（在初始化 grid 之前创建，避免循环依赖）
  const createStatusSwitch = createStatusSwitchFactory(options, gridApiRef);

  // 创建操作按钮函数（在初始化 grid 之前创建，避免循环依赖）
  const createActionButtons = createActionButtonsFactory(options, gridApiRef);

  // 处理列配置：如果提供了 columns 函数，则调用它；否则使用 gridProps.columns
  let finalColumns: any[] = [];
  if (typeof options.columns === 'function') {
    // 使用函数方式，传入 helper 函数
    finalColumns = options.columns({ createStatusSwitch, createActionButtons });
  } else if (options.gridProps?.columns) {
    // 使用用户提供的列配置
    finalColumns = options.gridProps.columns;
  }

  // 创建默认表格配置
  const defaultGridProps = createDefaultGridProps(
    options,
    pagerInfoRef,
    treeConfigOptions,
  );

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

  // 特殊处理 treeConfig：如果用户没有在 gridProps 中明确设置 treeConfig，则使用默认的 treeConfig
  // 这样可以确保树形配置不会被意外覆盖
  if (treeConfigOptions && !options.gridProps?.treeConfig) {
    mergedGridProps.treeConfig = defaultGridProps.treeConfig as any;
    // 调试信息：确保 treeConfig 正确设置
    // eslint-disable-next-line no-console
    console.log('树形配置已设置:', mergedGridProps.treeConfig);
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

  // 处理表单选项：为每个字段添加输入和清除事件，实现自动搜索
  const processedFormOptions = processFormOptions(
    options.formOptions,
    gridApiRef,
  );

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

  // 设置字段值并触发搜索的方法（用于外部触发的搜索，如侧边栏选择等）
  const setFieldValueAndSearch = createSetFieldValueAndSearch(gridApi);

  // 将 setFieldValueAndSearch 方法添加到 gridApi 对象中，方便通过 gridApi 访问
  if (gridApi && typeof gridApi === 'object') {
    (gridApi as any).setFieldValueAndSearch = setFieldValueAndSearch;
  }

  return {
    Grid,
    api: gridApi,
    createStatusSwitch,
    createActionButtons,
    reload: () => gridApi.reload(),
    setLoading: (loading: boolean) => gridApi.setLoading(loading),
    setFieldValueAndSearch,
  };
}
