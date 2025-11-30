import type { ResourceData } from './resourceTable';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '#/locales';

import { getAllSystems } from '#/api/iam/system';
import { getMenuTree } from '#/api/iam/menu';

/**
 * 资源表格的 gridProps 配置
 *
 * 这里定义了表格的所有自定义配置项
 * 可以通过 gridProps 传入任何 VxeGridProps 支持的配置
 */
export const gridConfig: Partial<VxeGridProps<ResourceData>> = {
  // 自定义边框样式: 'full' | 'outer' | 'inner' | 'none'
  border: 'full',
  // 自定义尺寸: 'large' | 'medium' | 'small' | 'mini'
  size: 'large',
  // 自定义复选框配置
  checkboxConfig: {
    highlight: true,
    trigger: 'default',
  },
  // 自定义筛选配置
  filterConfig: {
    remote: false,
    showIcon: true,
  },

  // 自定义工具栏配置
  toolbarConfig: {
    enabled: true,
    refresh: true,
    zoom: true,
    custom: true,
  },

  // 自定义排序配置
  sortConfig: {
    multiple: true,
    trigger: 'default',
  },
  // 其他常用配置示例：
  autoResize: false, // 自动调整大小（禁用以避免频繁重排）
  columnConfig: {
    resizable: true, // 允许手动调整列宽
  },
  rowConfig: {
    isHover: true, // 行悬停效果
    resizable: false, // 禁用行高调整，避免频繁重排
  },
};

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
        placeholder: $t('resource.selectSystemPlaceholder'),
        allowClear: true,
        'onUpdate:value': (value: string | undefined) => {
          console.log('[tableConfig] 系统选择变化:', {
            value,
            timestamp: new Date().toISOString(),
          });
        },
      },
      fieldName: 'systemId',
      label: $t('resource.system'),
      // 标记为级联字段，当此字段变化时，form-search.ts 会自动清空依赖字段
      cascadeClear: ['menuId'],
    },
    {
      component: 'ApiTreeSelect',
      componentProps: (values: any) => {
        console.log('[tableConfig] ========== ApiTreeSelect componentProps 被调用 ==========', {
          values,
          valuesStringified: JSON.stringify(values),
          timestamp: new Date().toISOString(),
        });
        
        const systemId = values?.systemId;
        console.log('[tableConfig] 提取的 systemId:', {
          systemId,
          type: typeof systemId,
          isUndefined: systemId === undefined,
          isNull: systemId === null,
          isEmptyString: systemId === '',
        });
        
        // 判断是否应该禁用菜单选择器
        const shouldDisable = !systemId;
        console.log('[tableConfig] shouldDisable:', shouldDisable);
        
        // 创建 params 对象，确保每次都是新对象（避免引用相同导致 watch 不触发）
        // 重要：如果 systemId 存在，必须包含在 params 中；如果不存在，也要明确设置为 undefined
        // 这样 ApiComponent 的 watch 才能正确检测到变化
        const paramsValue = systemId 
          ? { systemId } 
          : { systemId: undefined };
        
        console.log('[tableConfig] 创建的 params 对象:', {
          paramsValue,
          paramsStringified: JSON.stringify(paramsValue),
          systemId,
          hasSystemId: !!systemId,
        });
        
        const componentProps = {
          api: async (params?: { systemId?: string }) => {
            console.log('[tableConfig] ========== 菜单 API 被调用 ==========', {
              params,
              paramsStringified: JSON.stringify(params),
              systemIdFromValues: systemId,
              systemIdFromParams: params?.systemId,
              timestamp: new Date().toISOString(),
            });
            
            // 从 params 或 values 中获取最新的 systemId
            // 优先使用 params 中的 systemId（这是 ApiComponent 传递的最新值）
            const currentSystemId = params?.systemId ?? systemId;
            console.log('[tableConfig] currentSystemId 最终值:', {
              currentSystemId,
              source: params?.systemId !== undefined ? 'from params' : 'from values',
              paramsSystemId: params?.systemId,
              valuesSystemId: systemId,
            });
            
            if (!currentSystemId) {
              console.log('[tableConfig] ⚠️ 没有 systemId，返回空数组');
              return [];
            }
            
            try {
              console.log('[tableConfig] ✅ 开始调用 getMenuTree，systemId:', currentSystemId);
              const startTime = Date.now();
              const menus = await getMenuTree(currentSystemId);
              const endTime = Date.now();
              console.log('[tableConfig] ✅ getMenuTree 返回结果:', {
                menus,
                menuCount: Array.isArray(menus) ? menus.length : 'not an array',
                duration: `${endTime - startTime}ms`,
                timestamp: new Date().toISOString(),
              });
              // 注意：不需要在这里过滤，api-component 的 transformData 会自动过滤无效节点
              return menus || [];
            } catch (error) {
              console.error('[tableConfig] ❌ getMenuTree 调用失败:', {
                error,
                errorMessage: error instanceof Error ? error.message : String(error),
                systemId: currentSystemId,
              });
              throw error;
            }
          },
          // 将 systemId 作为 params 传递，这样 ApiComponent 才能监听到变化并重新调用 API
          // 重要：确保 params 对象在 systemId 变化时确实变化（通过创建新对象实现）
          params: paramsValue,
          // 立即加载数据，当 systemId 变化时自动调用 api
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          childrenField: 'children', // 指定 children 字段名，让 transformData 能够递归处理子节点
          placeholder: shouldDisable 
            ? $t('resource.selectSystemPlaceholder')
            : $t('resource.selectMenuPlaceholder'),
          allowClear: true,
          // 当未选择系统时，禁用菜单选择器
          disabled: shouldDisable,
          treeDefaultExpandAll: true,
          showSearch: true,
          treeNodeFilterProp: 'name',
        };
        
        console.log('[tableConfig] 返回的 componentProps 摘要:', {
          params: componentProps.params,
          paramsStringified: JSON.stringify(componentProps.params),
          immediate: componentProps.immediate,
          disabled: componentProps.disabled,
          hasApi: typeof componentProps.api === 'function',
          placeholder: componentProps.placeholder,
        });
        console.log('[tableConfig] ========== componentProps 调用结束 ==========\n');
        
        return componentProps;
      },
      fieldName: 'menuId',
      label: $t('resource.menu'),
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('resource.searchCodePlaceholder'),
      },
      fieldName: 'code',
      label: $t('resource.code'),
    },
    {
      component: 'SynapseInput',
      componentProps: {
        allowClear: true,
        placeholder: $t('resource.searchNamePlaceholder'),
      },
      fieldName: 'name',
      label: $t('resource.name'),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        allowClear: true,
        placeholder: $t('resource.selectTypePlaceholder'),
        options: [
          { label: $t('resource.typeApi'), value: 'API' },
          { label: $t('resource.typeFunction'), value: 'BUTTON' },
        ],
      },
      fieldName: 'type',
      label: $t('resource.type'),
    }
  ],
  collapseTriggerResize: false,
});

