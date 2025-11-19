import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Plus } from '@vben/icons';
import { message } from 'ant-design-vue';

import { createGrid } from '#/adapter/vxe-table';
import {
  createToolbarButtons,
  type ToolbarButtonConfig,
} from '#/adapter/vxe-table/config';
import { createDrawerForm } from '#/adapter/drawer-form';
import {
  addOrModifySystem,
  getSystemDetail,
  getPage,
  deleteSystem,
} from '#/api/iam/system';

import { gridConfig } from './gridConfig';
import type { SystemData } from './types';
import { z } from '#/adapter/form';
import { $t } from '@vben/locales';
import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

// 图标映射表：将配置中的图标名称映射到实际的图标组件
const iconMap: Record<string, any> = {
  Plus,
};

/**
 * 搜索表单配置
 */
export const formOptions = {
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
        placeholder: '搜索系统编码...',
      },
      fieldName: 'code',
      label: '系统编码',
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: '搜索系统名称...',
      },
      fieldName: 'name',
      label: '系统名称',
    },
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: '选择状态...',
        options: [
          { label: '启用', value: 'true' },
          { label: '禁用', value: 'false' },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  collapseTriggerResize: false,
};

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
        placeholder: '请输入系统编码',
      },
      fieldName: 'code',
      label: '系统编码',
      rules: z.string().min(1, { message: '请输入系统编码' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入系统名称',
      },
      fieldName: 'name',
      label: '系统名称',
      rules: z.string().min(1, { message: '请输入系统名称' }),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入排序',
        min: 0,
        style: { width: '100%' },
      },
      fieldName: 'sorted',
      label: '排序',
      rules: z.number().min(0, { message: '排序必须大于等于0' }),
    },
  ];

  // 在编辑和查看模式下添加状态字段（禁用）
  if (mode === 'edit' || mode === 'view') {
    baseSchema.push({
      component: 'Switch',
      componentProps: {
        checkedChildren: '启用',
        unCheckedChildren: '禁用',
        disabled: true, // 编辑和查看模式下禁用
      } as any,
      fieldName: 'status',
      label: '系统状态',
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

  // 先创建 Drawer Form 实例
  const drawerForm = createDrawerForm<SystemData>({
    title: {
      create: $t('add'),
      edit: '编辑系统',
      view: '查看系统详情',
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
    tableTitle: '系统管理',
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
        title: '序号',
      },
      {
        field: 'code',
        title: '系统编码',
      },
      {
        field: 'name',
        title: '系统名称',
        sortable: true,
      },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellStatusIcon',
          props: {
            statusMap: {
              'true': {
                icon: 'mdi:check-circle',
                color: '#52c41a',
                text: '启用',
              },
              'false': {
                icon: 'mdi:close-circle',
                color: '#ff4d4f',
                text: '禁用',
              },
            },
          },
        },
      },
      {
        field: 'sorted',
        title: '排序',
        sortable: true,
      },
      {
        field: '_actions',
        title: '操作',
        width: 250,
        fixed: 'right',
        cellRender: {
          name: 'CellActions',
          props: {
            actions: [
              {
                text: '查看',
                onClick: (row: SystemData) => {
                  drawerForm.openView(row);
                },
              },
              {
                text: '编辑',
                onClick: (row: SystemData) => {
                  drawerForm.openEdit(row);
                },
              },
              {
                text: '删除',
                danger: true,
                confirm: '确定要删除该系统吗？删除后无法恢复。',
                onClick: async (row: SystemData) => {
                  try {
                    if (gridApiRef.value) {
                      gridApiRef.value.setLoading(true);
                    }
                    const response = await deleteSystem(row.id);
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
  // 定义工具栏中需要显示的按钮配置
  const toolbarButtonsConfig: ToolbarButtonConfig[] = [
    {
      textKey: 'add',
      type: 'primary',
      icon: 'Plus',
      // 如果不需要权限检查，可以移除 accessCodes 或设置为 undefined
      // accessCodes: ['system:create'], // 需要权限检查时使用
    },
  ];

  // 创建工具栏按钮配置
  // 使用通用工厂函数处理按钮配置，绑定实际的事件处理器
  const toolbarButtons = createToolbarButtons({
    configs: toolbarButtonsConfig,
    hasAccessByCodes,
    iconMap,
    eventHandlers: {
      // 根据 textKey 绑定到对应的操作
      add: () => {
        drawerForm.openCreate();
      },
      // 可以在这里添加其他 textKey 的事件处理器
      // 例如：'export' -> () => exportData(), 'import' -> () => importData() 等
    },
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

