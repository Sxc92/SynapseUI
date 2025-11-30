import { ref } from 'vue';

import { useAccess } from '@vben/access';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';

import { addOrModifyUser } from '#/api/iam/user';
import { createGrid } from '#/adapter/vxe-table';
import { getUserPage } from '#/api/iam/user';

import { gridConfig } from './tableConfig';

/**
 * 用户数据接口
 * 与 API 返回的 User 类型兼容
 */
export interface UserData {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 搜索表单配置
 * 使用函数形式返回配置，避免函数被 structuredClone 处理
 */
export const formOptions = () => ({
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('user.usernamePlaceholder'),
      },
      fieldName: 'username',
      label: $t('user.username'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('user.emailPlaceholder'),
      },
      fieldName: 'email',
      label: $t('user.email'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('user.phonePlaceholder'),
      },
      fieldName: 'phone',
      label: $t('user.phone'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: $t('common.selectStatusPlaceholder'),
        options: [
          { label: $t('common.enabled'), value: 'active' },
          { label: $t('common.disabled'), value: 'inactive' },
        ],
      },
      fieldName: 'status',
      label: $t('common.status'),
    },
  ],
  collapseTriggerResize: false,
});

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
  const defaultConfig = {
    true: {
      color: '#52c41a',
      icon: 'mdi:check-circle',
    },
    false: {
      color: '#ff4d4f',
      icon: 'mdi:close-circle',
    },
  };

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
    title: $t('common.status'),
    cellRender: {
      name: 'CellStatusIcon',
      props: {
        statusMap: processedStatusMap,
        hasPermission: (_row: UserData) => {
          // 如果未配置权限标识，默认允许操作
          if (!permissionKey) {
            return true;
          }
          // 使用权限码检查用户是否有权限
          return hasAccessByCodes([permissionKey]);
        },
        onClick: async (
          row: UserData,
          fieldName: string,
          newValue: boolean,
        ) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            await addOrModifyUser({
              id: row.id,
              [fieldName]: newValue,
            } as any);
              message.success(successMessage || $t('common.success'));
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
 * 用户表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useUserTable() {
  // 使用 ref 存储 reload 函数和 API，避免循环依赖
  const reloadRef = ref<(() => void) | null>(null);
  const gridApiRef = ref<any>(null);

  // 使用 createGrid 创建表格实例
  const result = createGrid<UserData>({
    tableTitle: $t('user.management'),
    id: 'user-grid',
    pageSize: 10,
    formOptions,
    api: {
      getPage: getUserPage,
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
        field: 'account',
        title: $t('user.account'),
        sortable: true,
      },
      {
        field: 'realName',
        title: $t('user.realName'),
      },
      {
        field: 'email',
        title: $t('user.email'),
        sortable: true,
      },
      {
        field: 'mobile',
        title: $t('user.mobile'),
      },
      // 状态字段：可点击切换启用/禁用
      createClickableStatusColumn(
        'enabled',
        {
          true: {
            text: $t('common.enabled'),
          },
          false: {
            text: $t('common.disabled'),
          },
        },
        'user:status:update',
        $t('common.success'),
        gridApiRef,
        reloadRef,
      ),
      {
        field: 'createTime',
        title: $t('common.createTime'),
        sortable: true,
        formatter: 'formatDate',
      },
      {
        field: 'updateTime',
        title: $t('common.updateTime'),
        sortable: true,
        formatter: 'formatDate',
      },
    ],
  });

  // 存储 reload 函数和 API
  reloadRef.value = result.reload;
  gridApiRef.value = result.api;

  // 获取选中记录
  function getSelectedRows(): UserData[] {
    const selected = result.api.getCheckboxRecords();
    // eslint-disable-next-line no-console
    console.log('选中记录:', selected);
    return selected;
  }

  return {
    // 表格组件
    Grid: result.Grid,
    // 表格 API
    gridApi: result.api,
    // 方法
    getSelectedRows,
    reload: result.reload,
    setLoading: result.setLoading,
  };
}
