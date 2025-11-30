import type { RoleData } from './roleTable';

import { ref } from 'vue';

import { useAccess } from '@vben/access';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';
import { createStandardActions } from '#/adapter/vxe-table/grid';

import { addOrModifyRole, deleteRole } from '#/api/iam/role';

/**
 * Drawer Form 实例类型
 */
type DrawerFormInstance = {
  openCreate: () => void;
  openEdit: (row: RoleData) => void;
  openView: (row: RoleData) => void;
};

/**
 * 权限分配抽屉实例类型
 */
type PermissionDrawerInstance = {
  openPermissionDrawer: (row: RoleData) => void;
};

/**
 * 权限检查函数类型
 */
type PermissionChecker = (codes: string[]) => boolean;

/**
 * 状态配置类型：支持完整配置或仅文案配置
 */
type StatusConfig = {
  color?: string;
  icon?: string;
  text: string;
};

/**
 * 创建可点击的状态字段配置
 * @param field 字段名
 * @param statusMap 状态映射配置（支持完整配置或仅文案配置，如果只提供文案，会自动使用默认颜色和图标）
 * @param permissionKey 权限标识（可选，如果未提供则默认允许）
 * @param successMessage 成功提示消息
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 */
function createClickableStatusColumn(
  field: string,
  statusMap: Record<string, StatusConfig>,
  permissionKey: string | undefined,
  successMessage: string | undefined,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
) {
  // 权限检查工具
  const { hasAccessByCodes } = useAccess();

  // 默认颜色和图标配置
  const defaultConfig = {
    true: {
      color: '#52c41a',
      icon: 'mdi:check-circle',
    },
    false: {
      color: '#ff4d4f',
      icon: 'mdi:close-circle',
    },
  };

  // 处理 statusMap：如果只提供了 text，自动填充默认的 color 和 icon
  const processedStatusMap: Record<string, { color: string; icon: string; text: string }> = {};
  for (const [key, config] of Object.entries(statusMap)) {
    const defaultCfg = defaultConfig[key as 'true' | 'false'];
    processedStatusMap[key] = {
      color: config.color || defaultCfg?.color || '#666',
      icon: config.icon || defaultCfg?.icon || 'mdi:circle',
      text: config.text,
    };
  }

  return {
    field,
    title: $t('common.status'),
    cellRender: {
      name: 'CellStatusIcon',
      props: {
        statusMap: processedStatusMap,
        hasPermission: (_row: RoleData) => {
          // 如果未配置权限标识，默认允许操作
          if (!permissionKey) {
            return true;
          }
          // 使用权限码检查用户是否有权限
          return hasAccessByCodes([permissionKey]);
        },
        onClick: async (
          row: RoleData,
          fieldName: string,
          newValue: boolean,
        ) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await addOrModifyRole({
              id: row.id,
              [fieldName]: newValue,
            } as any);
              message.success(successMessage || $t('role.statusUpdateSuccess'));
              (row as any)[fieldName] = newValue;
              if (reloadRef.value) {
                reloadRef.value();
            }
          } catch (error) {
            // 错误信息已由拦截器统一处理并显示
            message.error($t('role.statusUpdateFailed'));
            console.error(error);
          } finally {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(false);
            }
          }
        },
      },
    },
  };
}

/**
 * 创建角色表格的操作列 actions 配置
 * 使用统一的 createStandardActions 方法处理国际化、权限检查和消息提示
 * @param drawerForm Drawer Form 实例
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 * @param permissionDrawer 权限分配弹窗实例
 */
function createRoleActions(
  drawerForm: DrawerFormInstance,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
  permissionDrawer?: PermissionDrawerInstance,
) {
  const standardActions = createStandardActions<RoleData>(
    [
      {
        action: 'view',
        accessCodes: ['role::view'], // 使用双冒号格式，与后端返回的格式一致
        onClick: (row: RoleData) => {
          drawerForm.openView(row);
        },
        noPermissionKey: 'role.noPermissionToView',
      },
      {
        action: 'edit',
        accessCodes: ['role::edit'], // 使用双冒号格式，与后端返回的格式一致
        onClick: (row: RoleData) => {
          drawerForm.openEdit(row);
        },
        noPermissionKey: 'role.noPermissionToEdit',
      },
      {
        action: 'delete',
        accessCodes: ['role::delete'], // 使用双冒号格式，与后端返回的格式一致
        confirmKey: 'common.confirmDelete',
        onClick: async (row: RoleData) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await deleteRole(row.id);
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
        noPermissionKey: 'role.noPermissionToDelete',
      },
    ],
    {
      hasAccessByCodes,
      message,
      gridApi: () => gridApiRef.value,
      reload: () => reloadRef.value || undefined,
    },
  );

  // 如果有权限分配抽屉，添加权限分配按钮
  if (permissionDrawer) {
    const hasPermission = hasAccessByCodes(['role::assign']); // 使用双冒号格式，与后端返回的格式一致
    standardActions.push({
      text: $t('role.assignPermission'),
      icon: 'mdi:key-variant',
      type: 'primary',
      danger: false,
      disabled: !hasPermission,
      confirm: undefined,
      onClick: (row: RoleData) => {
        if (!hasAccessByCodes(['role::assign'])) { // 使用双冒号格式，与后端返回的格式一致
          message.warning($t('role.noPermissionToAssign'));
          return;
        }
        permissionDrawer.openPermissionDrawer(row);
      },
    });
  }

  return standardActions;
}

/**
 * 创建表格列配置
 * @param drawerForm Drawer Form 实例
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 * @param permissionDrawer 权限分配弹窗实例
 */
export function createColumns(
  drawerForm: DrawerFormInstance,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
  permissionDrawer?: PermissionDrawerInstance,
) {
  return [
    {
      type: 'seq',
      title: $t('common.serialNumber'),
    },
    {
      field: 'code',
      title: $t('role.code'),
      sortable: true,
    },
    {
      field: 'description',
      title: $t('role.description'),
      showOverflow: 'tooltip',
    },
    // 状态字段：可点击切换启用/禁用
    createClickableStatusColumn(
      'status',
      {
        true: {
          text: $t('common.enabled'),
        },
        false: {
          text: $t('common.disabled'),
        },
      },
      'role::status:update', // 使用双冒号格式，与后端返回的格式一致
      $t('common.statusUpdateSuccess'),
      gridApiRef,
      reloadRef,
    ),
    {
      field: '_actions',
      title: $t('common.actions'),
      fixed: 'right',
      cellRender: {
        name: 'CellActions',
        props: {
          // 使用 text 类型，更现代化的样式
          mode: 'dropdown',
          actions: createRoleActions(
            drawerForm,
            gridApiRef,
            reloadRef,
            hasAccessByCodes,
            permissionDrawer,
          ),
        },
      },
    },
  ];
}

