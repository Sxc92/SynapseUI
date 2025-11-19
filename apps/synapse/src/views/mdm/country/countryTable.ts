import type { CountryData } from './types';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { createDrawerForm } from '#/adapter/drawer-form';
import { z } from '#/adapter/form';
import { createGrid } from '#/adapter/vxe-table';
import {
  addOrModifyCountry,
  getCountryDetail,
  getPage,
} from '#/api/mdm/geographicApi';

import { gridConfig } from './gridConfig';
// 注意：formatNumber 是格式化器名称（字符串），不需要导入函数
// 在列配置中使用 formatter: 'formatNumber' 即可

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
  collapseTriggerResize: false,
};

/**
 * Drawer Form 表单配置
 */
const drawerFormSchema = [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入国家代码',
    },
    fieldName: 'code',
    label: '国家代码',
    rules: z.string().min(1, { message: '请输入国家代码' }),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入国家名称',
    },
    fieldName: 'name',
    label: '国家名称',
    rules: z.string().min(1, { message: '请输入国家名称' }),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入大洲',
    },
    fieldName: 'continent',
    label: '大洲',
    rules: z.string().min(1, { message: '请输入大洲' }),
  },
  {
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入人口',
      min: 0,
      style: { width: '100%' },
    },
    fieldName: 'population',
    label: '人口',
  },
  {
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入面积(km²)',
      min: 0,
      style: { width: '100%' },
    },
    fieldName: 'area',
    label: '面积(km²)',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入首都',
    },
    fieldName: 'capital',
    label: '首都',
  },
];

/**
 * 国家表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useCountryTable() {
  // 使用 ref 存储 reload 函数，避免循环依赖
  const reloadRef = ref<(() => void) | null>(null);

  // 先创建 Drawer Form 实例
  const drawerForm = createDrawerForm<CountryData>({
    title: {
      create: $t('add'),
      edit: '编辑国家',
      view: '查看国家详情',
    },
    formSchema: drawerFormSchema,
    api: {
      create: (data: any) => {
        // 确保不包含 id，明确是新增
        const { id, ...createData } = data as any;
        return addOrModifyCountry(createData);
      },
      update: (id: any, data: any) => {
        // 包含 id，明确是更新
        return addOrModifyCountry({ ...data, id });
      },
      getDetail: (id: any) => {
        // POST 请求，在 body 中传递 id
        // 如果传入的是字符串，直接传递；如果是对象，提取 id 字段
        const requestId = typeof id === 'string' ? id : id?.id || id;
        return getCountryDetail(requestId);
      },
    },
    width: 600,
    placement: 'right',
    onSuccess: () => {
      // 提交成功后刷新表格
      if (reloadRef.value) {
        reloadRef.value();
      }
    },
  });

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
      {
        field: '_actions',
        title: '操作',
        width: 200,
        fixed: 'right',
        cellRender: {
          name: 'CellActions',
          props: {
            actions: [
              {
                text: '查看',
                onClick: (row: CountryData) => {
                  drawerForm.openView(row);
                },
              },
              {
                text: '编辑',
                onClick: (row: CountryData) => {
                  drawerForm.openEdit(row);
                },
              },
            ],
          },
        },
      },
    ],
  });

  // 存储 reload 函数
  reloadRef.value = result.reload;

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
    // Drawer Form
    drawerForm,
    // 方法
    getSelectedRows,
    reload: result.reload,
    setLoading: result.setLoading,
  };
}
