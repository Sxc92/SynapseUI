import type { MenuData } from './menuTable';

import { ref } from 'vue';

import { useAccess } from '@vben/access';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';
import { createStandardActions } from '#/adapter/vxe-table/grid';

import { addOrModifyMenu, deleteMenu } from '#/api/iam/menu';

/**
 * Drawer Form 实例类型
 */
type DrawerFormInstance = {
  openCreate: () => void;
  openEdit: (row: MenuData) => void;
  openView: (row: MenuData) => void;
};

/**
 * 带初始值的新增函数类型
 */
type OpenCreateWithInitialValues = (initialValues?: {
  parentId?: string;
  systemId?: string;
}) => void;

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
  // status 字段的默认配置（启用/禁用）
  const statusDefaultConfig = {
    true: {
      color: '#52c41a',
      icon: 'mdi:check-circle',
    },
    false: {
      color: '#ff4d4f',
      icon: 'mdi:close-circle',
    },
  };

  // visible 字段的默认配置（显示/隐藏）
  const visibleDefaultConfig = {
    true: {
      color: '#1890ff',
      icon: 'mdi:eye',
    },
    false: {
      color: '#8c8c8c',
      icon: 'mdi:eye-off',
    },
  };

  // 根据字段名选择默认配置
  const defaultConfig = field === 'visible' ? visibleDefaultConfig : statusDefaultConfig;

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
    title: field === 'status' ? $t('common.status') : $t('menu.visible'),
    width: 100,
    cellRender: {
      name: 'CellStatusIcon',
      props: {
        statusMap: processedStatusMap,
        hasPermission: (_row: MenuData) => {
          // 如果未配置权限标识，默认允许操作
          if (!permissionKey) {
            return true;
          }
          // 使用权限码检查用户是否有权限
          return hasAccessByCodes([permissionKey]);
        },
        onClick: async (
          row: MenuData,
          fieldName: string,
          newValue: boolean,
        ) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await addOrModifyMenu({
              id: row.id,
              [fieldName]: newValue,
            } as any);
              message.success(
                successMessage ||
                  (field === 'status'
                    ? $t('menu.statusUpdateSuccess')
                    : $t('menu.visibleUpdateSuccess')),
              );
              (row as any)[fieldName] = newValue;
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
      },
    },
  };
}

/**
 * 创建菜单表格的操作列 actions 配置
 * 使用统一的 createStandardActions 方法处理国际化、权限检查和消息提示
 * @param drawerForm Drawer Form 实例
 * @param openCreateWithInitialValues 带初始值的新增函数
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 */
function createMenuActions(
  drawerForm: DrawerFormInstance,
  openCreateWithInitialValues: OpenCreateWithInitialValues,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
) {
  return createStandardActions<MenuData>(
    [
      {
        action: 'addChild', // 自定义操作
        textKey: 'menu.addChild',
        icon: 'mdi:plus-outline',
        type: 'primary',
        accessCodes: [''],
        onClick: (row: MenuData) => {
          // 打开新增表单，自动填充 parentId 和 systemId
          openCreateWithInitialValues({
            parentId: row.id,
            systemId: row.systemId,
          });
        },
        noPermissionKey: 'menu.noPermissionToAddChild',
      },
      {
        action: 'view',
        accessCodes: ['menu:view'],
        onClick: (row: MenuData) => {
          drawerForm.openView(row);
        },
        noPermissionKey: 'menu.noPermissionToView',
      },
      {
        action: 'edit',
        accessCodes: [''],
        onClick: (row: MenuData) => {
          drawerForm.openEdit(row);
        },
        noPermissionKey: 'menu.noPermissionToEdit',
      },
      {
        action: 'delete',
        accessCodes: [''],
        confirmKey: 'common.confirmDelete',
        onClick: async (row: MenuData) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await deleteMenu(row.id);
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
        noPermissionKey: 'menu.noPermissionToDelete',
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
 * @param openCreateWithInitialValues 带初始值的新增函数
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 * @param hasAccessByCodes 权限检查函数
 */
export function createColumns(
  drawerForm: DrawerFormInstance,
  openCreateWithInitialValues: OpenCreateWithInitialValues,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
) {
  return [
    {
      field: '_seq', // 不使用 type: 'seq'，使用普通列
      title: $t('common.serialNumber'),
      cellRender: {
        name: 'CellTreeSeq', // 使用自定义的树形序列号渲染器
      },
      treeNode: true, // 启用树形节点显示，树形结构显示在名称列
    },
    {
      field: 'code',
      title: $t('menu.code'),
      width: 150,
    },
    {
      field: 'name',
      title: $t('menu.name'),
      sortable: true,
    },
    {
      field: 'icon',
      title: $t('menu.icon'),
      cellRender: {
        name: 'CellIcon',
        props: {
          iconField: 'icon',
        },
      },
    },
    {
      field: 'router',
      title: $t('menu.router'),
      showOverflow: 'tooltip',
    },
    {
      field: 'component',
      title: $t('menu.component'),
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
      'menu:status:update',
      $t('menu.statusUpdateSuccess'),
      gridApiRef,
      reloadRef,
    ),
    // 可见性字段：可点击切换显示/隐藏
    createClickableStatusColumn(
      'visible',
      {
        true: {
          text: $t('menu.show'),
        },
        false: {
          text: $t('menu.hide'),
        },
      },
      'menu:visible:update',
      $t('menu.visibleUpdateSuccess'),
      gridApiRef,
      reloadRef,
    ),
    {
      field: '_actions',
      title: $t('common.actions'),
      fixed: 'right',
      width: 60,
      minWidth: 60,
      resizable: false,
      cellRender: {
        name: 'CellActions',
        props: {
          mode: 'dropdown',
          // dropdownText: $t('common.actions'),
          // dropdownIcon: 'mdi:dots-vertical',
          actions: createMenuActions(
            drawerForm,
            openCreateWithInitialValues,
            gridApiRef,
            reloadRef,
            hasAccessByCodes,
          ),
        },
      },
    },
  ];
}
