/**
 * 国家数据接口
 * 与 API 返回的 Country 类型兼容
 */
export interface CountryData {
  id: string;
  code: string;
  name: string;
  continent: string;
  population?: number;
  area?: number;
  capital?: string;
}

