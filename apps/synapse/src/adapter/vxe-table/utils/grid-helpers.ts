import { h, type Ref } from 'vue';

import { Button, message, Modal, Popconfirm, Switch } from 'ant-design-vue';

import { $t } from '#/locales';

import type { GridOptions } from '../types/grid';

/**
 * 创建状态开关函数
 * @param options 表格配置选项
 * @param gridApiRef 表格 API 的响应式引用
 * @returns 状态开关创建函数
 */
export function createStatusSwitchFactory<T = any>(
  options: GridOptions<T>,
  gridApiRef: Ref<any>,
) {
  return (row: T, field = 'status') => {
    if (!options.api.enable) return null;

    return h(Switch, {
      checked: (row as any)[field],
      checkedChildren: $t('common.enabled'),
      unCheckedChildren: $t('common.disabled'),
      onChange: (checked: any) => {
        const isChecked = checked === true || checked === 'true';
        Modal.confirm({
          title: isChecked
            ? $t('common.confirmEnable')
            : $t('common.confirmDisabled'),
          icon: h('span', { class: 'anticon anticon-exclamation-circle' }),
          okText: $t('common.confirm'),
          onOk: async () => {
            try {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(true);
              }
              const result = await (
                options.api.enable as (id: any) => Promise<any>
              )((row as any).id);
              if (result.code === 200) {
                message.success(result.msg || $t('common.success'));
                if (gridApiRef.value) {
                  gridApiRef.value.reload();
                }
              } else {
                message.error(result.msg || $t('common.error'));
              }
            } catch (error) {
              console.error(error);
              message.error($t('common.error'));
            } finally {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(false);
              }
            }
          },
          onCancel: () => {},
        });
      },
    });
  };
}

/**
 * 创建操作按钮函数
 * @param options 表格配置选项
 * @param gridApiRef 表格 API 的响应式引用
 * @returns 操作按钮创建函数
 */
export function createActionButtonsFactory<T = any>(
  options: GridOptions<T>,
  gridApiRef: Ref<any>,
) {
  return (row: T) => {
    if (!options.api.remove) return null;

    return h(
      Popconfirm,
      {
        title: $t('common.confirmDelete'),
        icon: h('span', { class: 'anticon anticon-exclamation-circle' }),
        onConfirm: async () => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            const result = await (
              options.api.remove as (ids: any[]) => Promise<any>
            )([(row as any).id]);
            if (result.code === 200) {
              message.success($t('common.deleteSuccess'));
              if (gridApiRef.value) {
                gridApiRef.value.reload();
              }
            } else {
              message.error(result.msg || $t('common.deleteFailed'));
            }
          } catch (error) {
            message.error($t('common.deleteFailed'));
            console.error(error);
          } finally {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(false);
            }
          }
        },
      },
      {
        default: () =>
          h(Button, { type: 'link', danger: true }, () => $t('common.delete')),
      },
    );
  };
}

