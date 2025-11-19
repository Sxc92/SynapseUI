import type { PageRequest, PageResponse } from '@vben/request';

import { fullResponseClient, requestClient } from '#/api/request';

import { GEOGRAPHIC_API_PREFIX, MDM_API_PREFIX } from './constants';

export namespace GeographicApi {
  /** 国家分页查询参数 */
  export interface CountryPage extends PageRequest {
    name?: string;
    code?: string;
    continent?: string;
  }

  /** 国家数据 */
  export interface Country {
    id: string;
    code: string;
    name: string;
    continent: string;
    population?: number;
    area?: number;
    capital?: string;
  }

  /** 国家分页查询返回值 */
  export type CountryPageResult = PageResponse<Country>;
}

/**
 * 获取国家分页数据
 * 直接返回 PageResponse 格式，表格组件会自动识别并处理
 * requestClient 已经判断过业务编码 code === 'SUCCESS'，如果成功才会返回数据
 */
export async function getPage(
  params: GeographicApi.CountryPage,
): Promise<GeographicApi.CountryPageResult> {
  return requestClient.post<GeographicApi.CountryPageResult>(
    `${MDM_API_PREFIX}/${GEOGRAPHIC_API_PREFIX}/country/page`,
    params,
  );
}

/**
 * 创建或更新国家
 * 如果 data 中包含 id，则为更新；否则为新增
 * 使用 fullResponseClient 返回完整的响应对象（包括 code 和 msg）
 */
export async function addOrModifyCountry(
  data: GeographicApi.Country | Partial<GeographicApi.Country>,
): Promise<{ code: number | string; data?: any; msg: string }> {
  // 使用 fullResponseClient 获取完整响应（包括 code 和 msg）
  // fullResponseClient 配置了 responseReturn: 'body'，返回完整的响应对象
  const response = await fullResponseClient.post<{
    code: number | string;
    data?: any;
    msg: string;
  }>(`${MDM_API_PREFIX}/${GEOGRAPHIC_API_PREFIX}/country/addOrModify`, data);

  // fullResponseClient 返回的是 AxiosResponse，需要提取 data
  return response;
}

/**
 * 获取国家详情
 * 使用 POST 请求，在 body 中传递 id
 * requestClient 配置了 responseReturn: 'data'，成功时返回 data 字段的值
 */
export async function getCountryDetail(
  id: string | { id: string },
): Promise<GeographicApi.Country> {
  // 如果传入的是字符串，转换为对象；如果已经是对象，直接使用
  const requestData = typeof id === 'string' ? { id } : id;
  return requestClient.post<GeographicApi.Country>(
    `${MDM_API_PREFIX}${GEOGRAPHIC_API_PREFIX}/country/detail`,
    requestData,
  );
}
