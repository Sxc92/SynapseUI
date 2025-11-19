import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:view-dashboard',
      keepAlive: true,
      order: 0,
      title: $t('menu.dashboard'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        meta: {
          icon: 'mdi:briefcase-outline',
          title: $t('menu.workspace'),
        },
        name: 'Workspace',
        path: '/dashboard/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
      },
    ],
  },
];

export default routes;

