import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:shield-account',
      keepAlive: true,
      order: 1,
      title: $t('menu.iam'),
    },
    name: 'IAM',
    path: '/iam',
    children: [
      // 用户与组织
      {
        meta: {
          icon: 'mdi:account-group',
          title: $t('menu.userAndOrg'),
        },
        name: 'UserAndOrg',
        path: '/iam/user-org',
        children: [
          {
            meta: {
              icon: 'mdi:account',
              title: $t('menu.user'),
            },
            name: 'UserManage',
            path: '/iam/user',
            component: () => import('#/views/iam/user/index.vue'),
          },
          {
            meta: {
              icon: 'mdi:sitemap',
              title: $t('menu.organization'),
            },
            name: 'OrganizationManage',
            path: '/iam/organization',
            component: () => import('#/views/iam/organization/index.vue'),
          },
          {
            meta: {
              icon: 'mdi:briefcase',
              title: $t('menu.position'),
            },
            name: 'PositionManage',
            path: '/iam/position',
            component: () => import('#/views/iam/position/index.vue'),
          },
        ],
      },
      // 权限配置
      {
        meta: {
          icon: 'mdi:cog',
          title: $t('menu.permissionConfig'),
        },
        name: 'PermissionConfig',
        path: '/iam/permission',
        children: [
          {
            meta: {
              icon: 'mdi:account-key',
              title: $t('menu.role'),
            },
            name: 'RoleManage',
            path: '/iam/role',
            component: () => import('#/views/iam/role/index.vue'),
          },
          {
            meta: {
              icon: 'mdi:menu',
              title: $t('menu.menu'),
            },
            name: 'MenuManage',
            path: '/iam/menu',
            component: () => import('#/views/iam/menu/index.vue'),
          },
          {
            meta: {
              icon: 'mdi:api',
              title: $t('menu.resource'),
            },
            name: 'ResourceManage',
            path: '/iam/resource',
            component: () => import('#/views/iam/resource/index.vue'),
          },
        ],
      },
      // 系统与应用
      {
        meta: {
          icon: 'mdi:application-cog',
          title: $t('menu.systemAndApp'),
        },
        name: 'SystemAndApp',
        path: '/iam/system-app',
        children: [
          {
            meta: {
              icon: 'mdi:server',
              title: $t('menu.system'),
            },
            name: 'SystemManage',
            path: '/iam/system',
            component: () => import('#/views/iam/system/index.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
