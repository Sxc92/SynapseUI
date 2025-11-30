
/**
 * 菜单数据接口
 */
export interface MenuData {
  id: string;
  systemId: string;
  parentId?: string;
  code: string;
  name: string;
  icon?: string;
  router?: string;
  component?: string;
  visible: boolean;
  status: boolean;
  // 树形结构支持：子菜单列表
  children?: MenuData[];
}

import { nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';

import { createDrawerForm } from '#/adapter/drawer-form';
import { createGrid } from '#/adapter/vxe-table';
import { createToolbarButtonsSimple } from '#/adapter/vxe-table/config';
import {
  addOrModifyMenu,
  getMenuDetail,
  getMenuTreePage,
} from '#/api/iam/menu';

import { createColumns } from './columns';
import { drawerFormSchema } from './drawerFormSchema';
import { formOptions, gridConfig } from './tableConfig';
import { $t } from '@vben/locales';

// 图标映射表：用于自定义按钮的图标组件映射（可选）
const iconMap: Record<string, any> = {};

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
  
  // 标记是否是工具栏新增（顶级菜单）
  const isToolbarCreate = ref(false);

  // 权限检查工具
  const { hasAccessByCodes } = useAccess();

  // 先创建 Drawer Form 实例
  const drawerForm = createDrawerForm<MenuData>({
    title: {
      create: $t('menu.create'),
      edit: $t('menu.edit'),
      view: $t('menu.view'),
    },
    formSchema: (mode, currentRow) =>
      drawerFormSchema(mode, currentRow, isToolbarCreate),
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

  // 包装 openCreate 函数，支持传入初始值（用于新增下级菜单）
  const openCreateWithInitialValues = async (initialValues?: {
    parentId?: string;
    systemId?: string;
  }) => {
    // 判断是否是工具栏新增（没有 parentId）
    isToolbarCreate.value = !initialValues?.parentId;
    
    drawerForm.openCreate();
    // 等待表单初始化完成
    await nextTick();
    
      const formApi = drawerForm.getFormApi();
      if (formApi && initialValues) {
      // 如果是行内新增（有 parentId），只需要设置 parentId
      // parentId 会触发父菜单字段的显示，并且父菜单字段会可用
      if (initialValues.parentId) {
        // 如果有 systemId，先设置 systemId，等待树数据加载
        if (initialValues.systemId) {
          formApi.setFieldValue('systemId', initialValues.systemId);
          // 等待 ApiTreeSelect 的树数据加载完成（需要多个 tick）
          await nextTick();
          await nextTick();
          // 额外等待一段时间，确保树数据已加载
          await new Promise((resolve) => setTimeout(resolve, 100));
      }
        // 然后设置 parentId（此时树数据应该已经加载完成）
        formApi.setFieldValue('parentId', initialValues.parentId);
      } else if (initialValues.systemId) {
        // 如果是工具栏新增（没有 parentId），只设置 systemId
        // 父菜单字段会自动禁用（通过 drawerFormSchema 中的逻辑判断）
        formApi.setFieldValue('systemId', initialValues.systemId);
      }
    }
  };

  // 使用 createGrid 创建表格实例
  const result = createGrid<MenuData>({
    tableTitle: $t('menus.menu'),
    id: 'menu-grid',
    pageSize: 10,
    formOptions,
    api: {
      getPage: getMenuTreePage, // 使用树形分页接口
    },
    // 启用树形结构配置
    // 注意：后端返回的数据已经是树形结构（包含 children 数组），所以 transform 应该设置为 false
    treeConfig: {
      parentField: 'parentId',
      rowField: 'id',
      children: 'children', // 子节点字段名
      expandAll: false, // 默认折叠
      indent: 20, // 缩进 20px
      transform: false, // 数据已经是树形结构，不需要转换
    },
    // 使用 gridConfig.ts 中的配置
    gridProps: gridConfig,
    columns: () =>
      createColumns(
        drawerForm,
        openCreateWithInitialValues,
        gridApiRef,
        reloadRef,
        hasAccessByCodes,
      ),
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
  // 工具栏按钮配置
  // 使用简化的配置方式，支持默认新增按钮和自定义按钮
  const toolbarButtons = createToolbarButtonsSimple({
    hasAccessByCodes,
    iconMap,
    addButton: {
      accessCodes: ['menu:create'],
      action: () => {
        openCreateWithInitialValues();
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
    // 表格 API（包含 setFieldValueAndSearch 方法）
    gridApi: result.api,
    // Drawer Form
    drawerForm,
    // 工具栏按钮配置（响应式）
    toolbarButtons,
    // 方法
    getSelectedRows,
    reload: result.reload,
    setLoading: result.setLoading,
    // 直接暴露 setFieldValueAndSearch 方法，确保可以访问
    setFieldValueAndSearch: result.setFieldValueAndSearch,
  };
}
