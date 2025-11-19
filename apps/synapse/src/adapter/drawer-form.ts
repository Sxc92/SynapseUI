import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from './form';

import { computed, defineComponent, h, reactive, ref, unref, watch } from 'vue';

import { useVbenForm } from './form';
import { $t } from '#/locales';
import { message } from 'ant-design-vue';

import { useVbenDrawer } from '@vben/common-ui';

/**
 * 操作模式
 */
export type DrawerFormMode = 'create' | 'edit' | 'view';

/**
 * API 方法接口
 */
export interface DrawerFormApiMethods {
  /** 创建数据 */
  create?: (data: Recordable<any>) => Promise<any>;
  /** 更新数据 */
  update?: (id: any, data: Recordable<any>) => Promise<any>;
  /** 获取详情 */
  getDetail?: (data: Recordable<any>) => Promise<any>;
}

/**
 * Drawer Form 配置选项
 */
export interface DrawerFormOptions<T = any> {
  /** 抽屉标题配置 */
  title?: {
    /** 新增标题 */
    create?: string;
    /** 修改标题 */
    edit?: string;
    /** 查看标题 */
    view?: string;
  };
  /** 表单配置 */
  formSchema: VbenFormSchema[] | ((mode: DrawerFormMode, row?: T) => VbenFormSchema[]);
  /** API 方法 */
  api: DrawerFormApiMethods;
  /** 抽屉宽度 */
  width?: string | number;
  /** 抽屉位置 */
  placement?: 'left' | 'right' | 'top' | 'bottom';
  /** 提交成功后的回调 */
  onSuccess?: (mode: DrawerFormMode, data: Recordable<any>) => void;
  /** 提交失败后的回调 */
  onError?: (error: any) => void;
  /** 关闭前的回调 */
  onBeforeClose?: () => boolean | Promise<boolean>;
  /** 是否在关闭时销毁抽屉 */
  destroyOnClose?: boolean;
  /** 表单栅格布局类名，默认为 'grid-cols-2' */
  wrapperClass?: string;
}

/**
 * Drawer Form 实例接口
 */
export interface DrawerFormInstance {
  /** 打开新增抽屉 */
  openCreate: () => void;
  /** 打开修改抽屉 */
  openEdit: (row: Recordable<any>) => void;
  /** 打开查看详情抽屉 */
  openView: (row: Recordable<any>) => void;
  /** 关闭抽屉 */
  close: () => void;
  /** 获取表单 API */
  getFormApi: () => any;
  /** 获取抽屉 API */
  getDrawerApi: () => any;
  /** 抽屉组件 */
  Drawer: any;
}

/**
 * 创建 Drawer Form 工厂函数
 * @param options 配置选项
 * @returns Drawer Form 实例
 */
export function createDrawerForm<T = any>(
  options: DrawerFormOptions<T>,
): DrawerFormInstance {
  if (!options) {
    throw new Error('Options must be provided');
  }

  // 当前模式
  const mode = ref<DrawerFormMode>('create');
  // 当前行数据
  const currentRow = ref<Recordable<any> | null>(null);
  // 是否正在加载
  const loading = ref(false);
  // 是否显示抽屉
  const open = ref(false);

  // 计算抽屉标题
  const drawerTitle = computed(() => {
    const titles = options.title || {};
    switch (mode.value) {
      case 'create':
        return titles.create || $t('confirm');
      case 'edit':
        return titles.edit || $t('common.edit');
      case 'view':
        return titles.view || $t('common.view');
      default:
        return '';
    }
  });

  // 计算表单配置
  const formSchema = computed(() => {
    let schema: any[];
    if (typeof options.formSchema === 'function') {
      schema = options.formSchema(mode.value, currentRow.value as T);
    } else {
      schema = options.formSchema;
    }
    
    // 在查看模式下，为所有字段添加 disabled 属性
    if (mode.value === 'view') {
      return schema.map((field: any) => {
        const newField = { ...field };
        // 处理 componentProps（可能是对象或函数）
        if (typeof newField.componentProps === 'function') {
          // 如果是函数，包装它以确保返回 disabled
          const originalProps = newField.componentProps;
          newField.componentProps = (...args: any[]) => {
            const props = originalProps(...args);
            return {
              ...props,
              disabled: true,
            };
          };
        } else {
          // 如果是对象，直接添加 disabled
          newField.componentProps = {
            ...newField.componentProps,
            disabled: true,
          };
        }
        return newField;
      });
    }
    
    return schema;
  });

  // 创建表单实例
  const [Form, formApi] = useVbenForm(
    reactive({
      commonConfig: {
        componentProps: {
          class: 'w-full',
        },
        // 设置标签宽度，水平布局时标签和输入框在同一行
        labelWidth: 100,
        // 标签后显示冒号
        colon: true,
      },
      // 使用水平布局：标签和输入框在同一行，更紧凑美观
      layout: 'horizontal',
      // 使用栅格布局，支持字段并排显示（默认2列布局，可通过 wrapperClass 自定义）
      wrapperClass: options.wrapperClass || 'grid-cols-2',
      schema: formSchema,
      showDefaultActions: false,
      // 紧凑模式，减少表单项之间的间距
      compact: true,
    }),
  );

  // 处理表单提交
  async function handleSubmit() {
    if (mode.value === 'view') {
      return;
    }

    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values = await formApi.getValues();
    loading.value = true; // 显示遮罩

    try {
      let result: any;

      if (mode.value === 'create' && options.api.create) {
        result = await options.api.create(values);
      } else if (mode.value === 'edit' && options.api.update && currentRow.value) {
        result = await options.api.update(currentRow.value.id, values);
      } else {
        throw new Error('API method not provided');
      }

      // 判断是否成功：null 或 false 表示失败，true 表示成功
      // 如果返回的是响应对象，提取 msg 和 data
      let isSuccess = false;
      let msg = '';

      if (typeof result === 'object' && result !== null) {
        // 如果是响应对象，提取 msg
        msg = result.msg || '';
        // 判断成功：data === true 表示成功，data === false 或 null 表示失败
        isSuccess = result.data === true;
      } else {
        // 如果是基本类型：true 成功，null/false 失败
        isSuccess = result === true;
        msg = '';
      }
      if (isSuccess) {
        message.success(msg || $t('common.success'));
        options.onSuccess?.(mode.value, values);
        close();
      } else {
        message.error(msg || $t('common.error'));
        options.onError?.(result);
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || $t('common.error');
      message.error(errorMsg);
      options.onError?.(error);
    } finally {
      loading.value = false; // 隐藏遮罩
    }
  }

  // 加载详情数据
  async function loadDetail(id: any) {
    if (!options.api.getDetail) {
      return;
    }

    loading.value = true;
    try {
      const result = await options.api.getDetail(id);
      
      // 只需要判断是否为空，如果不为空就是需要返回的数据
      if (!result) {
        message.error($t('common.queryFailed'));
        return;
      }
      
      // 如果返回的是整个响应对象，提取 data 字段
      const data = typeof result === 'object' && result.code !== undefined && result.data
        ? result.data
        : result;
      
      // 设置表单值
      if (data && typeof data === 'object') {
        formApi.setValues(data);
        currentRow.value = data;
      } else {
        message.error($t('common.queryFailed'));
      }
    } catch (error: any) {
      console.error('加载详情失败:', error);
      message.error(error?.message || $t('common.queryFailed'));
    } finally {
      loading.value = false;
    }
  }

  // 打开新增抽屉
  function openCreate() {
    mode.value = 'create';
    currentRow.value = null;
    formApi.resetForm();
    open.value = true;
    drawerApi.open();
  }

  // 打开修改抽屉
  async function openEdit(row: Recordable<any>) {
    mode.value = 'edit';
    currentRow.value = row;
    formApi.resetForm();
    open.value = true;
    drawerApi.open();

    // 如果有详情 API，加载最新数据
    if (options.api.getDetail && row?.id) {
      await loadDetail(row.id);
    } else {
      // 否则使用传入的行数据
      formApi.setValues(row);
    }
  }

  // 打开查看详情抽屉
  async function openView(row: Recordable<any>) {
    mode.value = 'view';
    currentRow.value = row;
    formApi.resetForm();
    open.value = true;
    drawerApi.open();

    // 如果有详情 API，加载最新数据
    if (options.api.getDetail && row?.id) {
      await loadDetail(row.id);
    } else {
      // 否则使用传入的行数据
      formApi.setValues(row);
    }
  }

  // 关闭抽屉
  async function close() {
    if (options.onBeforeClose) {
      const canClose = await options.onBeforeClose();
      if (canClose === false) {
        return;
      }
    }
    open.value = false;
    drawerApi.close();
    formApi.resetForm();
    currentRow.value = null;
  }

  // 创建抽屉实例
  const [Drawer, drawerApi] = useVbenDrawer({
    title: unref(drawerTitle),
    placement: options.placement || 'right',
    loading: unref(loading),
    isOpen: unref(open),
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) {
        close();
      } else {
        open.value = isOpen;
      }
    },
    destroyOnClose: options.destroyOnClose ?? true,
    footer: mode.value !== 'view',
    confirmText: mode.value === 'create' ? $t('confirm') : mode.value === 'edit' ? $t('common.save') : $t('common.confirm'),
    onConfirm: handleSubmit,
    cancelText: $t('common.cancel'),
    showCancelButton: mode.value !== 'view',
  });

  // 设置抽屉宽度（如果支持）
  if (options.width) {
    drawerApi.setState({ width: options.width } as any);
  }

  // 监听模式变化，更新抽屉状态
  watch(
    [mode, loading, open],
    () => {
      drawerApi.setState({
        title: unref(drawerTitle),
        loading: unref(loading),
        isOpen: unref(open),
        footer: mode.value !== 'view',
        confirmText: mode.value === 'create' ? $t('confirm') : mode.value === 'edit' ? $t('common.save') : $t('common.confirm'),
        showCancelButton: mode.value !== 'view',
      });
    },
    { immediate: true },
  );

  // 注意：查看模式的禁用逻辑已经在 formSchema computed 中处理
  // 这里不再需要额外的 watch，因为 computed 会自动响应 mode 的变化

  // 创建抽屉内容组件
  const DrawerContent = defineComponent({
    name: 'DrawerFormContent',
    setup() {
      return () => h(Form);
    },
  });

  return {
    openCreate,
    openEdit,
    openView,
    close,
    getFormApi: () => formApi,
    getDrawerApi: () => drawerApi,
    Drawer: defineComponent({
      name: 'DrawerForm',
      setup() {
        return () =>
          h(Drawer, {}, {
            default: () => h(DrawerContent),
          });
      },
    }),
  };
}

