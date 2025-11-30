<script setup lang="ts">
import type { AnyPromiseFunction } from '@vben/types';
import type { CSSProperties, VNode } from 'vue';

import { computed, nextTick, ref, unref, watch } from 'vue';

import { LoaderCircle } from '@vben/icons';
import { Spin, Transfer as AntTransfer } from 'ant-design-vue';

import { cloneDeep, isEqual, isFunction } from '@vben/utils';

import { createCache, defaultFilterOption, extractData, generateCacheKey, transformData } from './utils';
import type { TransferItem } from './types';

// 定义 Props
interface Props {
  // ========== 数据源相关 ==========
  /** API 函数：返回 Promise<TransferItem[]> */
  api?: (params?: any) => Promise<TransferItem[] | Record<string, any>>;
  /** 静态数据源（当不使用 api 时） */
  dataSource?: TransferItem[];
  /** 传递给 api 的参数 */
  params?: Record<string, any>;
  /** 从 api 返回结果中提取数组的字段名（如 'data.list'） */
  resultField?: string;
  /** 是否立即调用 api（默认 true） */
  immediate?: boolean;
  /** 每次打开时都重新请求数据 */
  alwaysLoad?: boolean;
  /** API 请求前的钩子函数 */
  beforeFetch?: AnyPromiseFunction<any, any>;
  /** API 请求后的钩子函数 */
  afterFetch?: AnyPromiseFunction<any, any>;

  // ========== 缓存相关 ==========
  /** 是否启用缓存（默认 true） */
  enableCache?: boolean;
  /** 缓存 key 生成函数（基于 params） */
  cacheKey?: (params: any) => string;
  /** 缓存过期时间（毫秒），0 表示永不过期（默认 0） */
  cacheTime?: number;

  // ========== 字段映射相关 ==========
  /** key 字段名（默认 'key'） */
  keyField?: string;
  /** title 字段名（默认 'title'） */
  titleField?: string;
  /** description 字段名（默认 'description'） */
  descriptionField?: string;
  /** disabled 字段名（默认 'disabled'） */
  disabledField?: string;
  /** 是否将 key 从数字转为字符串 */
  numberToString?: boolean;

  // ========== 已选数据相关 ==========
  /** 已选中的 key 列表（右侧数据） */
  targetKeys?: string[];
  /** 默认已选中的 key 列表 */
  defaultTargetKeys?: string[];

  // ========== Loading 相关 ==========
  /** 外部控制的 loading（优先级高于内部） */
  loading?: boolean;
  /** 是否使用全局 loading（默认 true） */
  useGlobalLoading?: boolean;
  /** 全局 loading 的配置 */
  loadingConfig?: {
    tip?: string;
  };

  // ========== Transfer 原生 Props ==========
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索函数（自定义搜索逻辑） */
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  /** 左右两侧标题 */
  titles?: [string, string];
  /** 操作按钮文案 */
  operations?: string[];
  /** 列表样式 */
  listStyle?: (props: { direction: 'left' | 'right' }) => CSSProperties;
  /** 是否显示选择全部 */
  showSelectAll?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义渲染函数 */
  render?: (item: TransferItem) => VNode;
  /** 左侧列表底部渲染 */
  footer?: (props: { direction: 'left' }) => VNode;
  /** 右侧列表底部渲染 */
  rightFooter?: (props: { direction: 'right' }) => VNode;
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  alwaysLoad: false,
  enableCache: true,
  cacheTime: 0,
  keyField: 'key',
  titleField: 'title',
  descriptionField: 'description',
  disabledField: 'disabled',
  numberToString: false,
  useGlobalLoading: true,
  showSearch: false,
  showSelectAll: true,
  disabled: false,
});

const emit = defineEmits<{
  'update:targetKeys': [targetKeys: string[]];
  'change': [targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]];
  'search': [direction: 'left' | 'right', value: string];
  'scroll': [direction: 'left' | 'right', e: Event];
  'optionsChange': [options: TransferItem[]];
  'error': [error: any];
}>();

// 内部状态
const innerTargetKeys = ref<string[]>(props.defaultTargetKeys || []);
const refDataSource = ref<TransferItem[]>([]);
const innerLoading = ref(false);
const isFirstLoaded = ref(false);
const hasPendingRequest = ref(false);

// 缓存实例
const cache = createCache();

// 计算 targetKeys（支持 v-model）
const targetKeys = computed({
  get: () => props.targetKeys !== undefined ? props.targetKeys : innerTargetKeys.value,
  set: (value) => {
    innerTargetKeys.value = value;
    emit('update:targetKeys', value);
  },
});

// 计算 loading（外部控制优先）
const loading = computed(() => {
  return props.loading !== undefined ? props.loading : innerLoading.value;
});

// 计算数据源
const dataSource = computed(() => {
  return refDataSource.value.length > 0 ? refDataSource.value : (props.dataSource || []);
});

// 计算搜索函数
const filterOptionFn = computed(() => {
  if (props.filterOption && isFunction(props.filterOption)) {
    return props.filterOption;
  }
  if (props.showSearch) {
    return defaultFilterOption;
  }
  return undefined;
});

// 合并 params
const mergedParams = computed(() => {
  return {
    ...props.params,
  };
});

// 监听 params 变化，触发重新加载
watch(
  mergedParams,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) {
      return;
    }
    if (props.api && props.immediate) {
      fetchApi();
    }
  },
  { deep: true, immediate: false },
);

// 监听 targetKeys 变化（外部设置）
watch(
  () => props.targetKeys,
  (newKeys) => {
    if (newKeys !== undefined && !isEqual(newKeys, innerTargetKeys.value)) {
      innerTargetKeys.value = [...newKeys];
    }
  },
  { deep: true },
);

// API 数据加载
async function fetchApi() {
  const { api, beforeFetch, afterFetch, resultField, enableCache, cacheTime, cacheKey } = props;

  if (!api || !isFunction(api)) {
    return;
  }

  // 如果正在加载，标记有待处理的请求并返回
  if (innerLoading.value) {
    hasPendingRequest.value = true;
    return;
  }

  // 检查缓存
  if (enableCache) {
    const cacheKeyValue = generateCacheKey(unref(mergedParams), cacheKey);
    const cachedData = cache.get(cacheKeyValue, cacheTime || 0);
    if (cachedData) {
      refDataSource.value = cachedData;
      isFirstLoaded.value = true;
      emit('optionsChange', cachedData);
      return;
    }
  }

  refDataSource.value = [];
  try {
    innerLoading.value = true;

    // 全局 loading（如果启用）
    if (props.useGlobalLoading) {
      // 使用 Spin 组件包裹，显示全局 loading
      // 注意：这里使用 Spin 包裹整个组件，而不是使用全局服务
      // 因为 Vben 可能没有暴露全局 loading 服务
    }

    let finalParams = cloneDeep(unref(mergedParams));
    if (beforeFetch && isFunction(beforeFetch)) {
      finalParams = (await beforeFetch(finalParams)) || finalParams;
    }

    let res = await api(finalParams);

    if (afterFetch && isFunction(afterFetch)) {
      res = (await afterFetch(res)) || res;
    }

    isFirstLoaded.value = true;

    // 提取数据
    const rawData = extractData(res, resultField);

    // 转换数据
    const transformedData = transformData(rawData, {
      keyField: props.keyField,
      titleField: props.titleField,
      descriptionField: props.descriptionField,
      disabledField: props.disabledField,
      numberToString: props.numberToString,
    });

    refDataSource.value = transformedData;

    // 缓存数据
    if (enableCache) {
      const cacheKeyValue = generateCacheKey(unref(mergedParams), cacheKey);
      cache.set(cacheKeyValue, transformedData);
    }

    emit('optionsChange', transformedData);
  } catch (error) {
    console.error('Transfer: API 请求失败', error);
    // remote 错误已在 request 层处理，这里只触发错误事件
    emit('error', error);
    isFirstLoaded.value = false;
  } finally {
    innerLoading.value = false;

    // 如果有待处理的请求，立即触发新的请求
    if (hasPendingRequest.value) {
      hasPendingRequest.value = false;
      await nextTick();
      fetchApi();
    }
  }
}

// 处理选择变化
function handleChange(
  newTargetKeys: string[],
  direction: 'left' | 'right',
  moveKeys: string[],
) {
  targetKeys.value = newTargetKeys;
  emit('change', newTargetKeys, direction, moveKeys);
}

// 处理搜索
function handleSearch(direction: 'left' | 'right', value: string) {
  emit('search', direction, value);
}

// 处理滚动
function handleScroll(direction: 'left' | 'right', e: Event) {
  emit('scroll', direction, e);
}

// 初始化：如果 immediate 为 true 且有 api，立即加载
if (props.immediate && props.api) {
  fetchApi();
}

// 暴露方法
const transferRef = ref();
defineExpose({
  /** 获取所有选项数据 */
  getOptions: () => unref(dataSource),
  /** 获取当前选中的 keys */
  getTargetKeys: () => unref(targetKeys),
  /** 设置选中的 keys */
  setTargetKeys: (keys: string[]) => {
    targetKeys.value = keys;
  },
  /** 获取左侧数据源 */
  getDataSource: () => unref(dataSource),
  /** 获取右侧已选数据 */
  getTargetDataSource: () => {
    const keys = unref(targetKeys);
    return unref(dataSource).filter(item => keys.includes(item.key));
  },
  /** 更新 API 参数（已废弃，请直接修改 params prop） */
  updateParam: (_newParams: Record<string, any>) => {
    // 注意：这里需要触发重新加载，但 params 是 props，不能直接修改
    // 业务方应该通过修改 props.params 来触发
    console.warn('Transfer: updateParam 已废弃，请直接修改 params prop');
  },
  /** 手动触发数据加载 */
  reload: async () => {
    await fetchApi();
  },
  /** 获取 Transfer 组件实例 */
  getTransferRef: () => transferRef.value,
});
</script>

<template>
  <Spin :spinning="loading && useGlobalLoading" :tip="loadingConfig?.tip">
    <AntTransfer
      ref="transferRef"
      v-model:target-keys="targetKeys"
      :data-source="dataSource"
      :show-search="showSearch"
      :filter-option="filterOptionFn as any"
      :titles="titles"
      :operations="operations"
      :list-style="listStyle"
      :show-select-all="showSelectAll"
      :disabled="disabled"
      :render="render as any"
      :footer="footer"
      :right-footer="rightFooter"
      @change="handleChange"
      @search="handleSearch"
      @scroll="handleScroll"
    >
      <template v-if="loading && !useGlobalLoading" #notFoundContent>
        <div class="flex items-center justify-center py-4">
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          <span>加载中...</span>
        </div>
      </template>
    </AntTransfer>
  </Spin>
</template>

