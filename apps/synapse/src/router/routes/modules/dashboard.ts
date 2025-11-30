import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:view-dashboard',
      keepAlive: true,
      order: 0,
      title: $t('menus.dashboard'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        meta: {
          icon: 'mdi:briefcase-outline',
          title: $t('menus.workspace'),
        },
        name: 'Workspace',
        path: '/dashboard/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
      },
    ],
  },
];

export default routes;
