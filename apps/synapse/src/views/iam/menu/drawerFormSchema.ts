import type { MenuData } from './types';

import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { getMenuTree } from '#/api/iam/menu';
import { getAllSystems } from '#/api/iam/system';

import { convertMenuListToTree } from './utils';

/**
 * Drawer Form 表单配置
 * 现代化布局：使用 2 列布局，合理分组字段
 */
export function drawerFormSchema(
  mode: DrawerFormMode,
  currentRow?: MenuData | null,
): VbenFormSchema[] {
  const baseSchema: VbenFormSchema[] = [
    // 第一行：系统选择（占满整行）
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllSystems,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择系统',
        allowClear: false,
      },
      fieldName: 'systemId',
      label: '所属系统',
      rules: z.string().min(1, { message: '请选择所属系统' }),
      formItemClass: 'col-span-2', // 占满整行（2列布局中占2列）
    },
    // 第二行：父菜单选择（占满整行）
    {
      component: 'ApiTreeSelect',
      componentProps: (values: any) => {
        const systemId = values?.systemId;
        const excludeId =
          mode === 'edit' && currentRow?.id ? currentRow.id : undefined;
        return {
          api: async () => {
            if (!systemId) {
              return [];
            }
            const menus = await getMenuTree(systemId);
            return convertMenuListToTree(menus, excludeId);
          },
          placeholder: '请选择父菜单（不选择则为顶级菜单）',
          allowClear: true,
          treeDefaultExpandAll: true,
          showSearch: true,
          treeNodeFilterProp: 'label',
        };
      },
      fieldName: 'parentId',
      label: '父菜单',
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第三行：菜单编码和菜单名称（2列布局）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入菜单编码',
      },
      fieldName: 'code',
      label: '菜单编码',
      rules: z.string().min(1, { message: '请输入菜单编码' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入菜单名称',
      },
      fieldName: 'name',
      label: '菜单名称',
      rules: z.string().min(1, { message: '请输入菜单名称' }),
    },
    // 第四行：图标选择（占满整行）
    {
      component: 'IconPicker',
      componentProps: {
        placeholder: '请选择图标',
      },
      fieldName: 'icon',
      label: '菜单图标',
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第五行：路由和组件（2列布局）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入路由路径，如：/system/menu',
      },
      fieldName: 'router',
      label: '路由路径',
      formItemClass: 'col-span-2', // 占满整行
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入组件路径，如：views/system/menu/index',
      },
      fieldName: 'component',
      label: '组件路径',
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第六行：状态和可见性（2列布局）
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '启用',
        unCheckedChildren: '禁用',
      } as any,
      fieldName: 'status',
      label: '菜单状态',
      defaultValue: true, // 新增时默认为启用
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '显示',
        unCheckedChildren: '隐藏',
      } as any,
      fieldName: 'visible',
      label: '是否可见',
      defaultValue: true, // 新增时默认为显示
    },
  ];

  return baseSchema;
}
