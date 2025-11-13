import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Mdm',
    path: '/mdm',
    children: [
      {
        meta: {
          title: $t('demos.country'),
        },
        name: 'CountryDemos',
        path: '/demos/country',
        component: () => import('#/views/mdm/country/index.vue'),
      },
    ],
  },
];

export default routes;
