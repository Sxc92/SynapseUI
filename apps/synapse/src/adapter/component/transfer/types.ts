/**
 * Transfer 组件类型定义
 */

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}

export interface TransferCacheItem {
  data: TransferItem[];
  timestamp: number;
}

export interface TransferCache {
  get(key: string, cacheTime: number): TransferItem[] | null;
  set(key: string, data: TransferItem[]): void;
  clear(): void;
}

