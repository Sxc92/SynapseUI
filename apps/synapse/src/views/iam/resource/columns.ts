import type { ResourceData } from './resourceTable';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';
import { createStandardActions } from '#/adapter/vxe-table/grid';

import { deleteResource } from '#/api/iam/resource';


/**
 * Drawer Form 实例类型
 */
type DrawerFormInstance = {
  openCreate: () => void;
  openEdit: (row: ResourceData) => void;
  openView: (row: ResourceData) => void;
};

/**
 * 权限检查函数类型
 */
type PermissionChecker = (codes: string[]) => boolean;

/**
 * 创建资源表格的操作列 actions 配置
 * 使用统一的 createStandardActions 方法处理国际化、权限检查和消息提示
 * @param drawerForm Drawer Form 实例
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 */
function createResourceActions(
  drawerForm: DrawerFormInstance,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
) {
  return createStandardActions<ResourceData>(
    [
      {
        action: 'view',
        accessCodes: [''],
        onClick: (row: ResourceData) => {
          drawerForm.openView(row);
        },
        noPermissionKey: 'resource.noPermissionToView',
      },
      {
        action: 'edit',
        accessCodes: [''],
        onClick: (row: ResourceData) => {
          drawerForm.openEdit(row);
        },
        noPermissionKey: 'resource.noPermissionToEdit',
      },
      {
        action: 'delete',
        accessCodes: ['resource:delete'],
        confirmKey: 'common.confirmDelete',
        onClick: async (row: ResourceData) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await deleteResource(row.id);
              message.success($t('common.deleteSuccess'));
              if (reloadRef.value) {
                reloadRef.value();
            }
          } catch (error) {
            // 错误信息已由拦截器统一处理并显示
            console.error(error);
          } finally {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(false);
            }
          }
        },
        noPermissionKey: 'resource.noPermissionToDelete',
      },
    ],
    {
      hasAccessByCodes,
      message,
      gridApi: () => gridApiRef.value,
      reload: () => reloadRef.value || undefined,
    },
  );
}

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
      title: $t('common.serialNumber'),
    },
    {
      field: 'systemName',
      title: $t('resource.system'),
      showOverflow: 'tooltip',
    },
    {
      field: 'menuName',
      title: $t('resource.menu'),
      showOverflow: 'tooltip',
    },
    {
      field: 'code',
      title: $t('resource.code'),
      sortable: true,
    },
    {
      field: 'name',
      title: $t('resource.name'),
      sortable: true,
    },
    {
      field: 'type',
      title: $t('resource.type'),
      formatter: ({ cellValue }: any) => {
        return cellValue === 'API'
          ? $t('resource.typeApi')
          : cellValue === 'BUTTON'
            ? $t('resource.typeFunction')
            : cellValue;
      },
    },
    {
      field: 'description',
      title: $t('resource.description'),
      showOverflow: 'tooltip',
    },
    {
      field: 'permissions',
      title: $t('resource.permissions'),
      showOverflow: 'tooltip',
    },
    {
      field: '_actions',
      title: $t('resource.actions'),
      fixed: 'right',
      cellRender: {
        name: 'CellActions',
        props: {
          // 使用 text 类型，更现代化的样式
          actions: createResourceActions(
            drawerForm,
            gridApiRef,
            reloadRef,
            hasAccessByCodes,
          ),
        },
      },
    },
  ];
}

