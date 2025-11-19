import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { useAccess } from '@vben/access';

import { addOrModifyMenu } from '#/api/iam/menu';

import type { MenuData } from './types';

/**
 * 创建可点击的状态字段配置
 * @param field 字段名
 * @param statusMap 状态映射配置
 * @param permissionKey 权限标识（可选，如果未提供则默认允许）
 * @param successMessage 成功提示消息
 * @param gridApiRef 表格 API 引用
 * @param reloadRef 刷新函数引用
 */
export function createClickableStatusColumn(
  field: string,
  statusMap: Record<string, { icon: string; color: string; text: string }>,
  permissionKey: string | undefined,
  successMessage: string | undefined,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
) {
  // 权限检查工具
  const { hasAccessByCodes } = useAccess();

  return {
    field,
    title: field === 'status' ? '状态' : '可见性',
    cellRender: {
      name: 'CellStatusIcon',
      props: {
        statusMap,
        hasPermission: (_row: MenuData) => {
          // 如果未配置权限标识，默认允许操作
          if (!permissionKey) {
            return true;
          }
          // 使用权限码检查用户是否有权限
          return hasAccessByCodes([permissionKey]);
        },
        onClick: async (row: MenuData, fieldName: string, newValue: boolean) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            const response = await addOrModifyMenu({
              id: row.id,
              [fieldName]: newValue,
            } as any);
            if (response.code === 200 || response.code === 'SUCCESS') {
              message.success(successMessage || `${field === 'status' ? '状态' : '可见性'}更新成功`);
              (row as any)[fieldName] = newValue;
              if (reloadRef.value) {
                reloadRef.value();
              }
            } else {
              message.error(response.msg || `${field === 'status' ? '状态' : '可见性'}更新失败`);
            }
          } catch (error) {
            message.error(`${field === 'status' ? '状态' : '可见性'}更新失败`);
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

