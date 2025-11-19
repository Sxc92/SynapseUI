import type { MenuData } from './types';

import type { ToolbarButtonConfig } from '#/adapter/vxe-table/config';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Plus } from '@vben/icons';

import { createDrawerForm } from '#/adapter/drawer-form';
import { createGrid } from '#/adapter/vxe-table';
import { createToolbarButtons } from '#/adapter/vxe-table/config';
import { addOrModifyMenu, getMenuDetail, getMenuPage } from '#/api/iam/menu';

import { createColumns } from './columns';
import { drawerFormSchema } from './drawerFormSchema';
import { formOptions } from './formOptions';
import { gridConfig } from './gridConfig';

// 图标映射表：将配置中的图标名称映射到实际的图标组件
const iconMap: Record<string, any> = {
  Plus,
};

/**
 * 菜单表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useMenuTable() {
  // 使用 ref 存储 reload 函数和 API，避免循环依赖
  const reloadRef = ref<(() => void) | null>(null);
  const gridApiRef = ref<any>(null);

  // 权限检查工具
  const { hasAccessByCodes } = useAccess();

  // 先创建 Drawer Form 实例
  const drawerForm = createDrawerForm<MenuData>({
    title: {
      create: '新增菜单',
      edit: '编辑菜单',
      view: '查看菜单详情',
    },
    formSchema: drawerFormSchema,
    api: {
      create: (data: any) => {
        // 确保不包含 id，明确是新增
        const { id, ...createData } = data as any;
        return addOrModifyMenu(createData);
      },
      update: (id: any, data: any) => {
        // 包含 id，明确是更新
        return addOrModifyMenu({ ...data, id });
      },
      getDetail: (id: any) => {
        // POST 请求，在 body 中传递 id
        // 如果传入的是字符串，直接传递；如果是对象，提取 id 字段
        const requestId = typeof id === 'string' ? id : id?.id || id;
        return getMenuDetail(requestId);
      },
    },
    width: 800, // 更宽的抽屉，适应 2 列布局
    placement: 'right',
    wrapperClass: 'grid-cols-2', // 2 列布局，更现代化
    onSuccess: () => {
      // 提交成功后刷新表格
      if (reloadRef.value) {
        reloadRef.value();
      }
    },
  });

  // 使用 createGrid 创建表格实例
  const result = createGrid<MenuData>({
    tableTitle: '菜单管理',
    id: 'menu-grid',
    pageSize: 10,
    formOptions,
    api: {
      getPage: getMenuPage,
    },
    // 使用 gridConfig.ts 中的配置
    gridProps: gridConfig,
    columns: () =>
      createColumns(drawerForm, gridApiRef, reloadRef, hasAccessByCodes),
  });

  // 存储 reload 函数和 API
  reloadRef.value = result.reload;
  gridApiRef.value = result.api;

  // 获取选中记录
  function getSelectedRows(): MenuData[] {
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
      // accessCodes: ['menu:create'], // 需要权限检查时使用
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
