import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

/**
 * 系统数据接口
 */
export interface SystemData {
  id: string;
  code: string;
  name: string;
  status: boolean;
  sorted: number;
}

import { ref } from 'vue';

import { useAccess } from '@vben/access';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';

import { createDrawerForm } from '#/adapter/drawer-form';
import { z } from '#/adapter/form';
import { createGrid, createStandardActions } from '#/adapter/vxe-table';
import { createToolbarButtonsSimple } from '#/adapter/vxe-table/config';
import {
  addOrModifySystem,
  deleteSystem,
  getPage,
  getSystemDetail,
} from '#/api/iam/system';

import { gridConfig } from './tableConfig';

// 图标映射表：用于自定义按钮的图标组件映射（可选）
const iconMap: Record<string, any> = {};

/**
 * 搜索表单配置
 * 使用函数形式返回配置，避免函数被 structuredClone 处理
 */
export const formOptions = () => ({
  collapsed: false,
  // 显示搜索按钮（手动触发搜索）
  submitButtonOptions: {
    show: true,
  },
  // 显示重置按钮（清除所有搜索条件）
  resetButtonOptions: {
    show: true,
  },
  schema: [
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('system.searchCodePlaceholder'),
      },
      fieldName: 'code',
      label: $t('system.code'),
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('system.searchNamePlaceholder'),
      },
      fieldName: 'name',
      label: $t('system.name'),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: $t('common.selectStatusPlaceholder'),
        options: [
          { label: $t('common.enabled'), value: 'true' },
          { label: $t('common.disabled'), value: 'false' },
        ],
      },
      fieldName: 'status',
      label: $t('common.status'),
    },
  ],
  collapseTriggerResize: false,
});

/**
 * Drawer Form 表单配置
 * 根据模式动态配置字段：
 * - 新增模式：不显示状态字段
 * - 编辑和查看模式：显示状态字段但禁用
 */
const drawerFormSchema = (mode: DrawerFormMode): VbenFormSchema[] => {
  const baseSchema: VbenFormSchema[] = [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('system.codePlaceholder'),
      },
      fieldName: 'code',
      label: $t('system.code'),
      rules: z.string().min(1, { message: $t('system.codePlaceholder') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('system.namePlaceholder'),
      },
      fieldName: 'name',
      label: $t('system.name'),
      rules: z.string().min(1, { message: $t('system.namePlaceholder') }),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: $t('system.sortedPlaceholder'),
        min: 0,
        style: { width: '100%' },
      },
      fieldName: 'sorted',
      label: $t('system.sorted'),
      rules: z.number().min(0, { message: $t('system.sortedPlaceholder') }),
    },
  ];

  // 在编辑和查看模式下添加状态字段（禁用）
  if (mode === 'edit' || mode === 'view') {
    baseSchema.push({
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        unCheckedChildren: $t('common.disabled'),
        disabled: true, // 编辑和查看模式下禁用
      } as any,
      fieldName: 'status',
      label: $t('system.systemStatus'),
    } as VbenFormSchema);
  }

  return baseSchema;
};

/**
 * 系统表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useSystemTable() {
  // 使用 ref 存储 reload 函数和 API，避免循环依赖
  const reloadRef = ref<(() => void) | null>(null);
  const gridApiRef = ref<any>(null);

  // 权限检查工具
  const { hasAccessByCodes } = useAccess();

  /**
   * 创建系统表格的操作列 actions 配置
   * 使用统一的 createStandardActions 方法处理国际化、权限检查和消息提示
   */
  function createSystemActions() {
    return createStandardActions<SystemData>(
      [
        {
          action: 'view',
          accessCodes: ['system:view'],
          onClick: (row: SystemData) => {
            drawerForm.openView(row);
          },
          noPermissionKey: 'system.noPermissionToView',
        },
        {
          action: 'edit',
          accessCodes: [''],
          onClick: (row: SystemData) => {
            drawerForm.openEdit(row);
          },
          noPermissionKey: 'system.noPermissionToEdit',
        },
        {
          action: 'delete',
          accessCodes: [''],
          confirmKey: 'common.confirmDelete',
          onClick: async (row: SystemData) => {
            try {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(true);
              }
              await deleteSystem(row.id);
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
          noPermissionKey: 'system.noPermissionToDelete',
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

  // 先创建 Drawer Form 实例
  const drawerForm = createDrawerForm<SystemData>({
    title: {
      create: $t('system.create'),
      edit: $t('system.edit'),
      view: $t('system.view'),
    },
    formSchema: drawerFormSchema,
    api: {
      create: (data: any) => {
        // 确保不包含 id，明确是新增
        const { id, ...createData } = data as any;
        return addOrModifySystem(createData);
      },
      update: (id: any, data: any) => {
        // 包含 id，明确是更新
        return addOrModifySystem({ ...data, id });
      },
      getDetail: (id: any) => {
        // POST 请求，在 body 中传递 id
        // 如果传入的是字符串，直接传递；如果是对象，提取 id 字段
        const requestId = typeof id === 'string' ? id : id?.id || id;
        return getSystemDetail(requestId);
      },
    },
    width: 600,
    placement: 'right',
    wrapperClass: 'grid-cols-1', // 单列布局，每个字段单独一行
    onSuccess: () => {
      // 提交成功后刷新表格
      if (reloadRef.value) {
        reloadRef.value();
      }
    },
  });

  // 使用 createGrid 创建表格实例
  const result = createGrid<SystemData>({
    tableTitle: $t('menus.system'),
    id: 'system-grid',
    pageSize: 10,
    formOptions,
    api: {
      getPage,
    },
    // 使用 gridConfig.ts 中的配置
    gridProps: gridConfig,
    columns: () => [
      {
        type: 'seq',
        width: 60,
        title: $t('common.serialNumber'),
      },
      {
        field: 'code',
        title: $t('system.code'),
      },
      {
        field: 'name',
        title: $t('system.name'),
        sortable: true,
      },
      {
        field: 'status',
        title: $t('common.status'),
        cellRender: {
          name: 'CellStatusIcon',
          props: {
            statusMap: {
              true: {
                icon: 'mdi:check-circle',
                color: '#52c41a',
                text: $t('common.enabled'),
              },
              false: {
                icon: 'mdi:close-circle',
                color: '#ff4d4f',
                text: $t('common.disabled'),
              },
            },
          },
        },
      },
      {
        field: 'sorted',
        title: $t('system.sorted'),
        sortable: true,
      },
      {
        field: '_actions',
        title: $t('common.actions'),
        width: 250,
        fixed: 'right',
        cellRender: {
          name: 'CellActions',
          props: {
            actions: createSystemActions(),
          },
        },
      },
    ],
  });

  // 存储 reload 函数和 API
  reloadRef.value = result.reload;
  gridApiRef.value = result.api;

  // 获取选中记录
  function getSelectedRows(): SystemData[] {
    const selected = result.api.getCheckboxRecords();
    // eslint-disable-next-line no-console
    console.log('选中记录:', selected);
    return selected;
  }

  // 工具栏按钮配置
  // 使用简化的配置方式，支持默认新增按钮和自定义按钮
  const toolbarButtons = createToolbarButtonsSimple({
    hasAccessByCodes,
    iconMap,
    addButton: {
      accessCodes: ['system:create'],
      action: () => {
        drawerForm.openCreate();
      },
    },
    // 可以在这里添加其他自定义按钮
    // customButtons: [
    //   {
    //     textKey: 'common.export',
    //     type: 'default',
    //     icon: 'Download',
    //     onClick: () => exportData(),
    //   },
    // ],
  });

  return {
    // 表格组件
    Grid: result.Grid,
    // 表格 API
    gridApi: result.api,
    // Drawer Form
    drawerForm,
    // 工具栏按钮配置（响应式）
    toolbarButtons,
    // 方法
    getSelectedRows,
    reload: result.reload,
    setLoading: result.setLoading,
  };
}
