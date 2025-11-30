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
    const formValues = getFormValues();

    const mergedValues = {
      /**
       * 开启toolbarConfig.refresh功能
       * 点击刷新按钮 这里的值为PointerEvent 会携带错误参数
       */
      // 先使用 formValues 作为基础值
      ...formValues,
      // 然后使用 customValues 覆盖，确保传入的自定义值（如自动搜索时的最新值）优先
      // 这样当自动搜索时传入的最新表单值可以覆盖 getLatestSubmissionValues() 中可能过时的值
      ...(customValues instanceof PointerEvent ? {} : customValues),
    };

    const data = await configFn(params, mergedValues, ...args);
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
