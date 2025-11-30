import type { MenuData } from './menuTable';

import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

import { getMenuTree } from '#/api/iam/menu';
import { getAllSystems } from '#/api/iam/system';

/**
 * Drawer Form 表单配置
 * 现代化布局：使用 2 列布局，合理分组字段
 * @param mode 表单模式
 * @param currentRow 当前行数据
 * @param isToolbarCreate 是否是工具栏新增（顶级菜单）的 ref
 */
export function drawerFormSchema(
  mode: DrawerFormMode,
  _currentRow?: MenuData | null,
  isToolbarCreate?: { value: boolean },
): VbenFormSchema[] {
  const baseSchema: VbenFormSchema[] = [
    // 第一行：系统选择（占满整行）
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllSystems,
        labelField: 'name',
        valueField: 'id',
        placeholder: $t('menu.selectSystemPlaceholder'),
        allowClear: false,
      },
      fieldName: 'systemId',
      label: $t('menus.system'),
      rules: z.string().min(1, { message: $t('menu.selectSystemPlaceholder') }),
      formItemClass: 'col-span-2', // 占满整行（2列布局中占2列）
    },
    // 第二行：父菜单选择（占满整行）
    {
      component: 'ApiTreeSelect',
      componentProps: (values: any) => {
        const systemId = values?.systemId;
        
        // 判断是否是工具栏新增（顶级菜单）
        // 如果是工具栏新增，父菜单字段应该禁用
        const isTopLevelMenu =
          mode === 'create' && isToolbarCreate?.value === true;
        
        return {
          api: async (params?: { systemId?: string }) => {
            const currentSystemId = params?.systemId || systemId;
            if (!currentSystemId || isTopLevelMenu) {
              return [];
            }
            // 不排除任何菜单，显示所有菜单（包括当前菜单）
            // 当前菜单会通过表单的初始值默认选中
            const menus = await getMenuTree(currentSystemId);
            // 注意：不需要在这里过滤，api-component 的 transformData 会自动过滤无效节点
            return menus || [];
          },
          // 将 systemId 作为 params 传递，这样 ApiComponent 才能监听到变化并重新调用 API
          params: {
            systemId: systemId || undefined,
          },
          // 立即加载数据，当 systemId 变化时自动调用 api
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          childrenField: 'children', // 指定 children 字段名，让 transformData 能够递归处理子节点
          placeholder: $t('menu.selectParentMenuPlaceholder'),
          allowClear: true,
          treeDefaultExpandAll: true,
          showSearch: true,
          treeNodeFilterProp: 'name',
          // 如果是工具栏新增（顶级菜单），禁用父菜单选择
          disabled: isTopLevelMenu,
        };
      },
      fieldName: 'parentId',
      label: $t('menu.parentMenu'),
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第三行：菜单编码和菜单名称（2列布局）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('menu.codePlaceholder'),
      },
      fieldName: 'code',
      label: $t('menu.code'),
      rules: z.string().min(1, { message: $t('menu.codePlaceholder') }),
      formItemClass: 'col-span-2', // 占满整行
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('menu.namePlaceholder'),
      },
      fieldName: 'name',
      label: $t('menu.name'),
      rules: z.string().min(1, { message: $t('menu.namePlaceholder') }),
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第四行：图标选择（占满整行）
    {
      component: 'IconPicker',
      componentProps: {
        placeholder: $t('menu.selectIconPlaceholder'),
      },
      fieldName: 'icon',
      label: $t('menu.icon'),
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第五行：路由和组件（2列布局）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('menu.routerPlaceholder'),
      },
      fieldName: 'router',
      label: $t('menu.router'),
      formItemClass: 'col-span-2', // 占满整行
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('menu.componentPlaceholder'),
      },
      fieldName: 'component',
      label: $t('menu.component'),
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第六行：状态和可见性（2列布局）
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        unCheckedChildren: $t('common.disabled'),
        disabled: true, // 详情模式下只读
      } as any,
      fieldName: 'status',
      label: $t('menu.status'),
      defaultValue: true, // 新增时默认为启用
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('menu.show'),
        unCheckedChildren: $t('menu.hide'),
        disabled: true, // 详情模式下只读
      } as any,
      fieldName: 'visible',
      label: $t('menu.visible'),
      defaultValue: true, // 新增时默认为显示
    },
  ];

  return baseSchema;
}
