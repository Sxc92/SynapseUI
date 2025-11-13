import type { HttpResponse } from '../request-client/types';

/**
 * 分页请求参数
 * 通用分页查询参数接口
 */
export interface PageRequest {
  /**
   * 当前页码，从 1 开始
   */
  pageNo: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * 排序字段（可选）
   */
  sortField?: string;

  /**
   * 排序方向：'asc' | 'desc'（可选）
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 * 通用分页查询响应数据结构
 */
export interface PageResponse<T = any> {
  /**
   * 数据列表
   */
  records: T[];

  /**
   * 总记录数
   */
  total: number;

  /**
   * 当前页码（可选，某些后端可能返回）
   */
  currentPage?: number;

  /**
   * 每页大小（可选，某些后端可能返回）
   */
  pageSize?: number;

  /**
   * 总页数（可选，某些后端可能返回）
   */
  totalPages?: number;
}

/**
 * 分页请求参数（兼容其他命名方式）
 * 某些后端可能使用不同的字段名
 */
export interface PageRequestAlias {
  /**
   * 当前页码，从 1 开始
   * 别名：currentPage, page, pageNum
   */
  pageNo?: number;
  currentPage?: number;
  page?: number;
  pageNum?: number;

  /**
   * 每页大小
   * 别名：size, limit, pageSize
   */
  pageSize?: number;
  size?: number;
  limit?: number;

  /**
   * 排序字段（可选）
   */
  sortField?: string;
  orderBy?: string;
  sortBy?: string;

  /**
   * 排序方向：'asc' | 'desc'（可选）
   */
  sortOrder?: 'asc' | 'desc';
  order?: 'asc' | 'desc';
}

/**
 * 分页响应数据（兼容其他命名方式）
 * 某些后端可能使用不同的字段名
 */
export interface PageResponseAlias<T = any> {
  /**
   * 数据列表
   * 别名：list, items, data, rows
   */
  records?: T[];
  list?: T[];
  items?: T[];
  data?: T[];
  rows?: T[];

  /**
   * 总记录数
   * 别名：totalCount, totalRecords
   */
  total?: number;
  totalCount?: number;
  totalRecords?: number;

  /**
   * 当前页码（可选）
   */
  currentPage?: number;
  pageNo?: number;
  page?: number;

  /**
   * 每页大小（可选）
   */
  pageSize?: number;
  size?: number;

  /**
   * 总页数（可选）
   */
  totalPages?: number;
  pages?: number;
}

/**
 * 带分页的 HTTP 响应
 * 结合 HttpResponse 和 PageResponse 的完整响应格式
 * 兼容现有的 HttpResponse 类型结构
 */
export type PageHttpResponse<T = any> = HttpResponse<PageResponse<T>>;

/**
 * 分页查询参数类型工具
 * 用于扩展基础查询参数，添加分页字段
 *
 * @example
 * ```ts
 * interface UserQuery {
 *   name?: string;
 *   age?: number;
 * }
 *
 * type UserPageQuery = PaginatedRequest<UserQuery>;
 * // 结果: { name?: string; age?: number; pageNo: number; pageSize: number; ... }
 * ```
 */
export type PaginatedRequest<
  T extends Record<string, any> = Record<string, any>,
> = PageRequest & T;

/**
 * 分页查询参数类型工具（兼容别名）
 * 用于扩展基础查询参数，添加分页字段（支持多种命名方式）
 *
 * @example
 * ```ts
 * interface UserQuery {
 *   name?: string;
 * }
 *
 * type UserPageQuery = PaginatedRequestAlias<UserQuery>;
 * // 可以使用 pageNo 或 currentPage 或 page
 * ```
 */
export type PaginatedRequestAlias<
  T extends Record<string, any> = Record<string, any>,
> = PageRequestAlias & T;
