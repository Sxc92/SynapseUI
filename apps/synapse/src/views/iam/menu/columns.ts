import type { MenuData } from './types';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { deleteMenu } from '#/api/iam/menu';

import { createClickableStatusColumn } from './statusColumn';

/**
 * Drawer Form 实例类型
 */
type DrawerFormInstance = {
  openCreate: () => void;
  openEdit: (row: MenuData) => void;
  openView: (row: MenuData) => void;
};

/**
 * 权限检查函数类型
 */
type PermissionChecker = (codes: string[]) => boolean;

/**
 * 创建表格列配置
 * @param drawerForm Drawer Form 实例
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 */
export function createColumns(
  drawerForm: DrawerFormInstance,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
) {
  return [
    {
      type: 'seq',
      width: 60,
      title: '序号',
    },
    {
      field: 'code',
      title: '菜单编码',
    },
    {
      field: 'name',
      title: '菜单名称',
      sortable: true,
    },
    {
      field: 'icon',
      title: '图标',
      cellRender: {
        name: 'CellIcon',
        props: {
          iconField: 'icon',
        },
      },
    },
    {
      field: 'router',
      title: '路由路径',
      showOverflow: 'tooltip',
    },
    {
      field: 'component',
      title: '组件路径',
      showOverflow: 'tooltip',
    },
    // 状态字段：可点击切换启用/禁用
    createClickableStatusColumn(
      'status',
      {
        true: {
          icon: 'mdi:check-circle',
          color: '#52c41a',
          text: '启用',
        },
        false: {
          icon: 'mdi:close-circle',
          color: '#ff4d4f',
          text: '禁用',
        },
      },
      'menu:status:update',
      '状态更新成功',
      gridApiRef,
      reloadRef,
    ),
    // 可见性字段：可点击切换显示/隐藏
    createClickableStatusColumn(
      'visible',
      {
        true: {
          icon: 'mdi:eye',
          color: '#1890ff',
          text: '显示',
        },
        false: {
          icon: 'mdi:eye-off',
          color: '#8c8c8c',
          text: '隐藏',
        },
      },
      'menu:visible:update',
      '可见性更新成功',
      gridApiRef,
      reloadRef,
    ),
    {
      field: '_actions',
      title: '操作',
      fixed: 'right',
      cellRender: {
        name: 'CellActions',
        props: {
          actions: [
            {
              text: '查看',
              // 权限控制：检查是否有查看权限
              disabled: !hasAccessByCodes(['menu:view']),
              onClick: (row: MenuData) => {
                // 再次检查权限（防止权限在渲染后发生变化）
                if (!hasAccessByCodes(['menu:view'])) {
                  message.warning('无权限查看菜单详情');
                  return;
                }
                drawerForm.openView(row);
              },
            },
            {
              text: '编辑',
              // 权限控制：检查是否有编辑权限
              disabled: !hasAccessByCodes(['menu:edit']),
              onClick: (row: MenuData) => {
                // 再次检查权限（防止权限在渲染后发生变化）
                if (!hasAccessByCodes(['menu:edit'])) {
                  message.warning('无权限编辑菜单');
                  return;
                }
                drawerForm.openEdit(row);
              },
            },
            {
              text: '删除',
              danger: true,
              confirm: '确定要删除该菜单吗？删除后无法恢复。',
              // 权限控制：检查是否有删除权限
              disabled: !hasAccessByCodes(['menu:delete']),
              onClick: async (row: MenuData) => {
                // 再次检查权限（防止权限在渲染后发生变化）
                if (!hasAccessByCodes(['menu:delete'])) {
                  message.warning('无权限删除菜单');
                  return;
                }
                try {
                  if (gridApiRef.value) {
                    gridApiRef.value.setLoading(true);
                  }
                  const response = await deleteMenu(row.id);
                  if (response.code === 200 || response.code === 'SUCCESS') {
                    message.success('删除成功');
                    if (reloadRef.value) {
                      reloadRef.value();
                    }
                  } else {
                    message.error(response.msg || '删除失败');
                  }
                } catch (error) {
                  message.error('删除失败');
                  console.error(error);
                } finally {
                  if (gridApiRef.value) {
                    gridApiRef.value.setLoading(false);
                  }
                }
              },
            },
          ],
        },
      },
    },
  ];
}
