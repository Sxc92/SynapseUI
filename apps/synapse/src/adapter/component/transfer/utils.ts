/**
 * Transfer 组件工具函数
 */

import { cloneDeep, get, isFunction } from '@vben/utils';

import type { TransferCache, TransferCacheItem, TransferItem } from './types';

/**
 * 数据转换：将业务数据转换为 TransferItem 格式
 */
export function transformData(
  rawData: any[],
  config: {
    keyField: string;
    titleField: string;
    descriptionField?: string;
    disabledField?: string;
    numberToString: boolean;
  },
): TransferItem[] {
  if (!Array.isArray(rawData)) {
    console.warn('Transfer: 数据源不是数组');
    return [];
  }

  const {
    keyField,
    titleField,
    descriptionField,
    disabledField,
    numberToString,
  } = config;

  return rawData
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      try {
        const key = get(item, keyField);
        // 过滤掉 key 为 undefined、null 或空字符串的项
        if (key == null || key === '' || (typeof key === 'string' && key.trim() === '')) {
          return null;
        }

        const transformedItem: TransferItem = {
          key: numberToString ? `${key}` : key,
          title: get(item, titleField) || '',
          ...cloneDeep(item), // 保留原始数据
        };

        // 设置 description（如果存在）
        if (descriptionField) {
          const description = get(item, descriptionField);
          if (description !== undefined) {
            transformedItem.description = description;
          }
        }

        // 设置 disabled（如果存在）
        if (disabledField) {
          const disabled = get(item, disabledField);
          if (disabled !== undefined) {
            transformedItem.disabled = Boolean(disabled);
          }
        }

        return transformedItem;
      } catch (error) {
        console.warn('Transfer: 数据项转换失败', item, error);
        return null;
      }
    })
    .filter((item): item is TransferItem => item !== null);
}

/**
 * 生成缓存 key
 */
export function generateCacheKey(
  params: any,
  customKeyFn?: (params: any) => string,
): string {
  if (customKeyFn && isFunction(customKeyFn)) {
    return customKeyFn(params);
  }
  // 默认使用 JSON.stringify，但需要处理函数、undefined 等特殊情况
  try {
    return JSON.stringify(params, (_key, value) => {
      if (typeof value === 'function' || value === undefined) {
        return '[Function]';
      }
      return value;
    });
  } catch (error) {
    // 如果序列化失败，使用 toString
    return String(params);
  }
}

/**
 * 创建缓存实例
 */
export function createCache(): TransferCache {
  const cache = new Map<string, TransferCacheItem>();

  return {
    get(key: string, cacheTime: number): TransferItem[] | null {
      const cached = cache.get(key);
      if (!cached) {
        return null;
      }

      // 检查是否过期
      if (cacheTime > 0 && Date.now() - cached.timestamp > cacheTime) {
        cache.delete(key);
        return null;
      }

      return cloneDeep(cached.data); // 返回深拷贝，避免引用问题
    },

    set(key: string, data: TransferItem[]): void {
      cache.set(key, {
        data: cloneDeep(data), // 深拷贝存储
        timestamp: Date.now(),
      });
    },

    clear(): void {
      cache.clear();
    },
  };
}

/**
 * 默认搜索过滤函数
 */
export function defaultFilterOption(
  inputValue: string,
  item: TransferItem,
): boolean {
  if (!inputValue) {
    return true;
  }

  const searchText = inputValue.toLowerCase();
  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();

  return title.includes(searchText) || description.includes(searchText);
}

/**
 * 提取数据：从 API 返回结果中提取数组
 */
export function extractData(
  result: any,
  resultField?: string,
): any[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (resultField && typeof result === 'object' && result !== null) {
    const fieldValue = get(result, resultField);
    if (Array.isArray(fieldValue)) {
      return fieldValue;
    }
  }

  return [];
}

