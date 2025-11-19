import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: 'Synapse Factory',
    defaultHomePath: '/dashboard/workspace', // 设置默认首页为工作台
  },
  logo: {
    enable: true,
    fit: 'contain',
    source: '/logo.svg',
    sourceDark: '/logo-dark.svg',
  },
  copyright: {
    companyName: 'Synapse Factory',
    companySiteLink: '#',
    date: '2024',
    enable: true,
    icp: '',
    icpLink: '',
    settingShow: true,
  },
});
