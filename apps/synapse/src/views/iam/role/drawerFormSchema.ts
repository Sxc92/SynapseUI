import type { RoleData } from './roleTable';

import type { DrawerFormMode } from '#/adapter/drawer-form';
import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '#/locales';

import { z } from '#/adapter/form';

/**
 * Drawer Form 表单配置
 * 现代化布局：使用 2 列布局，合理分组字段
 */
export function drawerFormSchema(
  mode: DrawerFormMode,
  _currentRow?: RoleData | null,
): VbenFormSchema[] {
  const baseSchema: VbenFormSchema[] = [
    // 第一行：角色编码
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('role.codePlaceholder'),
        rows: 4,
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'code',
      formItemClass: 'col-span-2',
      label: $t('role.code'),
      rules: mode !== 'view' ? z.string().min(1, { message: $t('role.codePlaceholder') }) : undefined,
    },
    // 第二行：角色描述（占满整行）
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('role.descriptionPlaceholder'),
        rows: 4,
        showCount: true,
        maxlength: 500,
        disabled: mode === 'view', // 详情模式下禁用编辑
      },
      fieldName: 'description',
      label: $t('role.description'),
      formItemClass: 'col-span-2', // 占满整行（2列布局中占2列）
    },
  ];

  // 仅在详情模式下显示状态字段
  if (mode === 'view') {
    baseSchema.push({
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        size:'large',
        unCheckedChildren: $t('common.disabled'),
        disabled: true, // 详情模式下只读
      } as any,
      fieldName: 'status',
      label: $t('common.status'),
    });
  }

  return baseSchema;
}

