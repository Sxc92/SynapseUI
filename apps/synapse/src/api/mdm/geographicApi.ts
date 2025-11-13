import type { PageRequest, PageResponse } from '@vben/request';

import { requestClient } from '#/api/request';

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
