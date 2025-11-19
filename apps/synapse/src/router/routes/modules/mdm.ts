import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 2,
      title: $t('menu.mdm'),
    },
    name: 'Mdm',
    path: '/mdm',
    children: [
      {
        meta: {
          title: $t('menu.country'),
        },
        name: 'CountryManage',
        path: '/mdm/country',
        component: () => import('#/views/mdm/country/index.vue'),
      },
    ],
  },
];

export default routes;
