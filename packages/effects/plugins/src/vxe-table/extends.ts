import type { VxeGridProps, VxeUIExport } from 'vxe-table';

import type { Recordable } from '@vben/types';

import type { VxeGridApi } from './api';

import { formatDate, formatDateTime, isFunction } from '@vben/utils';

export function extendProxyOptions(
  api: VxeGridApi,
  options: VxeGridProps,
  getFormValues: () => Recordable<any>,
) {
  [
    'query',
    'querySuccess',
    'queryError',
    'queryAll',
    'queryAllSuccess',
    'queryAllError',
  ].forEach((key) => {
    extendProxyOption(key, api, options, getFormValues);
  });
}

function extendProxyOption(
  key: string,
  api: VxeGridApi,
  options: VxeGridProps,
  getFormValues: () => Recordable<any>,
) {
  const { proxyConfig } = options;
  const configFn = (proxyConfig?.ajax as Recordable<any>)?.[key];
  if (!isFunction(configFn)) {
    return options;
  }

  const wrapperFn = async (
    params: Recordable<any>,
    customValues: Recordable<any>,
    ...args: Recordable<any>[]
  ) => {
    console.log(`[extendProxyOptions.${key}] 1. 包装函数被调用:`);
    console.log(`  - params:`, params);
    console.log(`  - customValues:`, customValues);
    console.log(`  - customValues 类型:`, typeof customValues, Array.isArray(customValues));
    console.log(`  - customValues 是 PointerEvent:`, customValues instanceof PointerEvent);
    
    const formValues = getFormValues();
    console.log(`[extendProxyOptions.${key}] 2. getFormValues() 返回的值:`, formValues);
    console.log(`[extendProxyOptions.${key}] 3. formValues 类型:`, typeof formValues, Array.isArray(formValues));
    console.log(`[extendProxyOptions.${key}] 4. formValues 键:`, formValues ? Object.keys(formValues) : 'null/undefined');
    
    const mergedValues = {
      /**
       * 开启toolbarConfig.refresh功能
       * 点击刷新按钮 这里的值为PointerEvent 会携带错误参数
       */
      ...(customValues instanceof PointerEvent ? {} : customValues),
      ...formValues,
    };
    console.log(`[extendProxyOptions.${key}] 5. 合并后的值:`, mergedValues);
    console.log(`[extendProxyOptions.${key}] 6. 合并后的值键:`, Object.keys(mergedValues));
    
    const data = await configFn(
      params,
      mergedValues,
      ...args,
    );
    console.log(`[extendProxyOptions.${key}] 7. configFn 执行完成`);
    return data;
  };
  api.setState({
    gridOptions: {
      proxyConfig: {
        ajax: {
          [key]: wrapperFn,
        },
      },
    },
  });
}

export function extendsDefaultFormatter(vxeUI: VxeUIExport) {
  vxeUI.formats.add('formatDate', {
    tableCellFormatMethod({ cellValue }) {
      return formatDate(cellValue);
    },
  });

  vxeUI.formats.add('formatDateTime', {
    tableCellFormatMethod({ cellValue }) {
      return formatDateTime(cellValue);
    },
  });
}
