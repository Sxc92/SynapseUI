import type { ResourceData } from './resourceTable';

import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { getAllSystems } from '#/api/iam/system';
import { getMenuTree } from '#/api/iam/menu';

import { $t } from '#/locales';

/**
 * Drawer Form 表单配置
 * 现代化布局：使用 2 列布局，合理分组字段
 */
export function drawerFormSchema(
  mode: DrawerFormMode,
  _currentRow?: ResourceData | null,
): VbenFormSchema[] {
  const baseSchema: VbenFormSchema[] = [
    // 第一行：系统选择（占满整行）
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllSystems,
        labelField: 'name',
        valueField: 'id',
        placeholder: $t('resource.selectSystemPlaceholder'),
        allowClear: false,
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'systemId',
      label: $t('resource.system'),
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.selectSystemPlaceholder') })
          : undefined,
      formItemClass: 'col-span-2', // 占满整行（2列布局中占2列）
    },
    // 第二行：类型选择（占满整行）
    {
      component: 'VbenSelect',
      componentProps: {
        placeholder: $t('resource.selectTypePlaceholder'),
        allowClear: false,
        disabled: mode === 'view', // 详情模式下禁用编辑
        options: [
          { label: $t('resource.typeApi'), value: 'API' },
          { label: $t('resource.typeFunction'), value: 'BUTTON' },
        ],
      },
      fieldName: 'type',
      label: $t('resource.type'),
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.selectTypePlaceholder') })
          : undefined,
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第三行：菜单选择（必选，占满整行）
    {
      component: 'ApiTreeSelect',
      componentProps: (values: any) => {
        const systemId = values?.systemId;
        // 只要选择了系统，就可以查询菜单接口
        const shouldQueryMenu = !!systemId;
        
        return {
          api: async (params?: { systemId?: string }) => {
            // 从 params 或 values 中获取最新的 systemId
            const currentSystemId = params?.systemId || systemId;
            
            // 如果未选择系统，返回空数组
            if (!currentSystemId) {
              return [];
            }
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
          placeholder: shouldQueryMenu 
            ? $t('resource.selectMenuPlaceholder')
            : $t('resource.selectSystemPlaceholder'),
          allowClear: false, // 必选，不允许清空
          treeDefaultExpandAll: true,
          showSearch: true,
          treeNodeFilterProp: 'name',
          disabled: mode === 'view' || !shouldQueryMenu, // 详情模式下禁用编辑，或未选择系统时禁用
        };
      },
      fieldName: 'menuId',
      label: $t('resource.menu'),
      // 菜单始终必选（除了 view 模式）
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.selectMenuPlaceholder') })
          : undefined,
      dependencies: mode !== 'view' ? {
        triggerFields: ['systemId'], // 当 systemId 字段变化时，重新渲染组件
      } : undefined,
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第四行：编码和名称（2列布局）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('resource.codePlaceholder'),
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'code',
      label: $t('resource.code'),
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.codePlaceholder') })
          : undefined,
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('resource.namePlaceholder'),
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'name',
      label: $t('resource.name'),
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.namePlaceholder') })
          : undefined,
    },
    // 第五行：描述（占满整行）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('resource.descriptionPlaceholder'),
        rows: 4,
        showCount: true,
        maxlength: 500,
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'description',
      label: $t('resource.description'),
      formItemClass: 'col-span-2', // 占满整行
    },
    // 第六行：权限编码（占满整行）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('resource.permissionsPlaceholder'),
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'permissions',
      label: $t('resource.permissions'),
      rules:
        mode !== 'view'
          ? z.string().min(1, { message: $t('resource.permissionsRequired') })
          : undefined,
      formItemClass: 'col-span-2', // 占满整行
    },
  ];
  return baseSchema;
}

