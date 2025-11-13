import { createGrid } from '#/adapter/vxe-table';
import { getPage } from '#/api/mdm/geographicApi';

import { gridConfig } from './gridConfig';

// 注意：formatNumber 是格式化器名称（字符串），不需要导入函数
// 在列配置中使用 formatter: 'formatNumber' 即可

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

/**
 * 模拟数据（已废弃，现在使用真实 API）
 * 保留用于测试或备用
 */
export const mockCountryData: CountryData[] = [
  {
    id: '1',
    code: 'CN',
    name: '中国',
    continent: '亚洲',
    population: 1_412_000_000,
    area: 9_596_961,
    capital: '北京',
  },
  {
    id: '2',
    code: 'US',
    name: '美国',
    continent: '北美洲',
    population: 331_900_000,
    area: 9_833_517,
    capital: '华盛顿',
  },
  {
    id: '3',
    code: 'IN',
    name: '印度',
    continent: '亚洲',
    population: 1_408_000_000,
    area: 3_287_263,
    capital: '新德里',
  },
  {
    id: '4',
    code: 'BR',
    name: '巴西',
    continent: '南美洲',
    population: 215_300_000,
    area: 8_514_877,
    capital: '巴西利亚',
  },
  {
    id: '5',
    code: 'RU',
    name: '俄罗斯',
    continent: '欧洲/亚洲',
    population: 146_200_000,
    area: 17_125_200,
    capital: '莫斯科',
  },
  {
    id: '6',
    code: 'JP',
    name: '日本',
    continent: '亚洲',
    population: 125_800_000,
    area: 377_975,
    capital: '东京',
  },
  {
    id: '7',
    code: 'DE',
    name: '德国',
    continent: '欧洲',
    population: 83_200_000,
    area: 357_022,
    capital: '柏林',
  },
  {
    id: '8',
    code: 'FR',
    name: '法国',
    continent: '欧洲',
    population: 67_800_000,
    area: 551_695,
    capital: '巴黎',
  },
  {
    id: '9',
    code: 'GB',
    name: '英国',
    continent: '欧洲',
    population: 67_500_000,
    area: 243_610,
    capital: '伦敦',
  },
  {
    id: '10',
    code: 'IT',
    name: '意大利',
    continent: '欧洲',
    population: 58_850_000,
    area: 301_340,
    capital: '罗马',
  },
  {
    id: '11',
    code: 'KR',
    name: '韩国',
    continent: '亚洲',
    population: 51_780_000,
    area: 100_210,
    capital: '首尔',
  },
  {
    id: '12',
    code: 'CA',
    name: '加拿大',
    continent: '北美洲',
    population: 38_250_000,
    area: 9_984_670,
    capital: '渥太华',
  },
  {
    id: '13',
    code: 'AU',
    name: '澳大利亚',
    continent: '大洋洲',
    population: 26_180_000,
    area: 7_692_024,
    capital: '堪培拉',
  },
  {
    id: '14',
    code: 'MX',
    name: '墨西哥',
    continent: '北美洲',
    population: 129_200_000,
    area: 1_964_375,
    capital: '墨西哥城',
  },
  {
    id: '15',
    code: 'ID',
    name: '印度尼西亚',
    continent: '亚洲',
    population: 275_800_000,
    area: 1_904_569,
    capital: '雅加达',
  },
  {
    id: '16',
    code: 'PK',
    name: '巴基斯坦',
    continent: '亚洲',
    population: 238_400_000,
    area: 881_912,
    capital: '伊斯兰堡',
  },
  {
    id: '17',
    code: 'BD',
    name: '孟加拉国',
    continent: '亚洲',
    population: 171_700_000,
    area: 147_570,
    capital: '达卡',
  },
  {
    id: '18',
    code: 'NG',
    name: '尼日利亚',
    continent: '非洲',
    population: 224_100_000,
    area: 923_768,
    capital: '阿布贾',
  },
  {
    id: '19',
    code: 'ZA',
    name: '南非',
    continent: '非洲',
    population: 62_000_000,
    area: 1_221_037,
    capital: '比勒陀利亚',
  },
  {
    id: '20',
    code: 'EG',
    name: '埃及',
    continent: '非洲',
    population: 109_300_000,
    area: 1_001_449,
    capital: '开罗',
  },
  {
    id: '21',
    code: 'AR',
    name: '阿根廷',
    continent: '南美洲',
    population: 46_230_000,
    area: 2_780_400,
    capital: '布宜诺斯艾利斯',
  },
  {
    id: '22',
    code: 'CL',
    name: '智利',
    continent: '南美洲',
    population: 19_520_000,
    area: 756_102,
    capital: '圣地亚哥',
  },
  {
    id: '23',
    code: 'TH',
    name: '泰国',
    continent: '亚洲',
    population: 71_600_000,
    area: 513_120,
    capital: '曼谷',
  },
  {
    id: '24',
    code: 'VN',
    name: '越南',
    continent: '亚洲',
    population: 98_200_000,
    area: 331_212,
    capital: '河内',
  },
  {
    id: '25',
    code: 'PH',
    name: '菲律宾',
    continent: '亚洲',
    population: 115_600_000,
    area: 300_000,
    capital: '马尼拉',
  },
  {
    id: '26',
    code: 'MY',
    name: '马来西亚',
    continent: '亚洲',
    population: 33_820_000,
    area: 330_803,
    capital: '吉隆坡',
  },
  {
    id: '27',
    code: 'SG',
    name: '新加坡',
    continent: '亚洲',
    population: 5_454_000,
    area: 728,
    capital: '新加坡',
  },
  {
    id: '28',
    code: 'NZ',
    name: '新西兰',
    continent: '大洋洲',
    population: 5_237_000,
    area: 268_021,
    capital: '惠灵顿',
  },
  {
    id: '29',
    code: 'NO',
    name: '挪威',
    continent: '欧洲',
    population: 5_457_000,
    area: 385_207,
    capital: '奥斯陆',
  },
  {
    id: '30',
    code: 'SE',
    name: '瑞典',
    continent: '欧洲',
    population: 10_500_000,
    area: 450_295,
    capital: '斯德哥尔摩',
  },
];

// /**
//  * 真实 API：分页查询
//  * 调用 geographicApi 中的 countryPage 接口
//  * 表单字段 name、code、continent 会直接传递给 API，无需额外映射
//  */
// async function getPage(
//   params: GeographicApi.CountryPage,
// ): Promise<{ code: number; data: { records: CountryData[]; total: number }; msg: string }> {
//   try {
//     // 直接调用真实 API，表单字段已经通过 fieldName 映射到 API 参数
//     // requestClient 已经判断过业务编码 code === 'SUCCESS'，如果成功才会返回数据
//     // 所以这里能正常返回说明业务编码已经是 'SUCCESS'，直接包装成表格组件期望的格式
//     const response = await countryPage(params);
//     // 根据 request.ts 的配置，responseReturn 为 'data'，所以返回的是 PageResponse<Country>
//     // 表格组件期望 HTTP 状态码 200 表示成功
//     return {
//       code: 200, // HTTP 状态码，表示请求成功
//       data: {
//         records: response.records || [],
//         total: response.total || 0,
//       },
//       msg: '查询成功',
//     };
//   } catch (error: any) {
//     console.error('国家分页查询失败:', error);
//     // 返回错误格式
//     return {
//       code: error?.code || -1,
//       data: {
//         records: [],
//         total: 0,
//       },
//       msg: error?.message || error?.msg || '查询失败',
//     };
//   }
// }

/**
 * 搜索表单配置
 */
export const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索国家名称...',
      },
      fieldName: 'name',
      label: '国家名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索国家代码...',
      },
      fieldName: 'code',
      label: '国家代码',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索大洲...',
      },
      fieldName: 'continent',
      label: '大洲',
    },
  ],
  // showCollapseButton: true,
  // 禁用 collapseTriggerResize 避免滚动问题
  collapseTriggerResize: false,
  // resetButtonOptions、submitButtonOptions、submitOnChange、submitOnEnter 已在 grid.ts 中统一处理
  // 如需自定义，可以在这里覆盖默认配置
};

/**
 * 国家表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useCountryTable() {
  // 使用 createGrid 创建表格实例
  const result = createGrid<CountryData>({
    tableTitle: '国家管理',
    id: 'country-grid',
    pageSize: 10,
    formOptions,
    api: {
      getPage,
    },
    // 使用 gridConfig.ts 中的配置
    gridProps: gridConfig,
    columns: () => [
      {
        type: 'seq',
        width: 60,
        title: '序号',
      },
      {
        field: 'code',
        title: '国家代码',
      },
      {
        field: 'name',
        title: '国家名称',
        sortable: true,
      },
      {
        field: 'continent',
        title: '大洲',
      },
      {
        field: 'population',
        title: '人口',
        sortable: true,
        // 使用全局格式化器
        formatter: 'formatNumber',
      },
      {
        field: 'area',
        title: '面积(km²)',
        sortable: true,
        // 使用全局格式化器
        formatter: 'formatNumber',
      },
      {
        field: 'capital',
        title: '首都',
      },
    ],
  });

  // 获取选中记录
  function getSelectedRows(): CountryData[] {
    const selected = result.api.getCheckboxRecords();
    // eslint-disable-next-line no-console
    console.log('选中记录:', selected);
    return selected;
  }

  return {
    // 表格组件
    Grid: result.Grid,
    // 表格 API
    gridApi: result.api,
    // 方法
    getSelectedRows,
    reload: result.reload,
    setLoading: result.setLoading,
  };
}
