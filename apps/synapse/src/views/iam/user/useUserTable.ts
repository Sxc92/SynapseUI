import { createGrid } from '#/adapter/vxe-table';
import { getUserPage } from '#/api/iam/user';

import { gridConfig } from './gridConfig';

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
 */
export const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索用户名...',
      },
      fieldName: 'username',
      label: '用户名',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索邮箱...',
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '搜索手机号...',
      },
      fieldName: 'phone',
      label: '手机号',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '选择状态...',
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  collapseTriggerResize: false,
};

/**
 * 用户表格配置 Composable
 *
 * 使用 createGrid 工厂函数创建表格实例
 *
 * @returns 表格组件和 API
 */
export function useUserTable() {
  // 使用 createGrid 创建表格实例
  const result = createGrid<UserData>({
    tableTitle: '用户管理',
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
        title: '序号',
      },
      {
        field: 'account',
        title: '用户名',
        sortable: true,
      },
      {
        field: 'realName',
        title: '昵称',
      },
      {
        field: 'email',
        title: '邮箱',
        sortable: true,
      },
      {
        field: 'mobile',
        title: '手机号',
      },
      {
        field: 'enabled',
        title: '状态',
        cellRender: {
          name: 'CellStatusIcon',
          props: {
            statusMap: {
              true: {
                icon: 'mdi:check-circle',
                color: '#52c41a',
                text: '启用',
              },
              false: {
                icon: 'mdi:close-circle',
                color: '#ff4d4f',
                text: '禁用',
              },
            },
          },
        },
      },
      {
        field: 'createTime',
        title: '创建时间',
        sortable: true,
        formatter: 'formatDate',
      },
      {
        field: 'updateTime',
        title: '更新时间',
        sortable: true,
        formatter: 'formatDate',
      },
    ],
  });

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
