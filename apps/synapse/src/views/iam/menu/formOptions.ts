import { getAllSystems } from '#/api/iam/system';

/**
 * 搜索表单配置
 * 使用函数形式返回配置，避免函数被 structuredClone 处理
 */
export const formOptions = () => ({
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
      component: 'ApiSelect',
      componentProps: {
        api: getAllSystems,
        labelField: 'name',
        valueField: 'id',
        placeholder: '选择系统...',
        allowClear: true,
        // 确保 ApiSelect 支持自动搜索：onChange 事件会在 grid.ts 中自动添加
        // 这里显式声明 onChange 以确保事件正确传递
      },
      fieldName: 'systemId',
      label: '系统',
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: '搜索菜单编码...',
      },
      fieldName: 'code',
      label: '菜单编码',
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: '搜索菜单名称...',
      },
      fieldName: 'name',
      label: '菜单名称',
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: '搜索路由...',
      },
      fieldName: 'router',
      label: '路由',
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: '搜索组件...',
      },
      fieldName: 'component',
      label: '组件',
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
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: '选择可见性...',
        options: [
          { label: '显示', value: 'true' },
          { label: '隐藏', value: 'false' },
        ],
      },
      fieldName: 'visible',
      label: '可见性',
    },
  ],
  collapseTriggerResize: false,
});
