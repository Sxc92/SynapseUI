<script setup lang="ts">
import type { Dayjs } from 'dayjs';

import { computed, ref, watch } from 'vue';

import { useI18n } from '@vben/locales';

import { useVModel } from '@vueuse/core';
import { DatePicker as AntDatePicker } from 'ant-design-vue';

import { cn } from '../utils';
import { formatDate, getDefaultDateFormat } from './utils';

type DateValue = Date | Dayjs | null | string | undefined;
type RangeValue = [DateValue, DateValue] | null;

interface Props {
  /** 输入值（单个日期） */
  modelValue?: DateValue;
  /** 默认值 */
  defaultValue?: DateValue;
  /** 日期格式，默认根据语言环境自动选择 */
  format?: string;
  /** 语言环境，默认从系统获取 */
  locale?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  class?: any;
  /** 是否显示时间 */
  showTime?: boolean;
  /** 是否显示今天按钮 */
  showToday?: boolean;
  /** 是否显示现在按钮（当 showTime 为 true 时） */
  showNow?: boolean;
  /** 日期范围模式 */
  range?: boolean;
  /** 范围选择时的值 */
  rangeValue?: RangeValue;
  /** 范围选择时的占位符 */
  rangePlaceholder?: [string, string];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showTime: false,
  showToday: true,
  showNow: true,
  range: false,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: DateValue): void;
  (e: 'update:rangeValue', value: RangeValue): void;
  (e: 'change', value: DateValue | RangeValue): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
}>();

const { locale: i18nLocale } = useI18n();
const currentLocale = computed(
  () => props.locale || i18nLocale.value || 'zh-CN',
);
const dateFormat = computed(
  () =>
    props.format || getDefaultDateFormat(currentLocale.value, props.showTime),
);

// 单个日期值
const singleValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
});

// 范围日期值
const rangeValueModel = useVModel(props, 'rangeValue', emits, {
  passive: true,
});

// 显示值（格式化后的字符串）
const displayValue = ref<string>('');

// 初始化显示值
function initDisplayValue() {
  if (props.range) {
    // 范围模式
    const range = rangeValueModel.value;
    if (range && range[0] && range[1]) {
      const start = formatDate(range[0], dateFormat.value, currentLocale.value);
      const end = formatDate(range[1], dateFormat.value, currentLocale.value);
      displayValue.value = `${start} ~ ${end}`;
    } else {
      displayValue.value = '';
    }
  } else {
    // 单个日期模式
    displayValue.value = singleValue.value
      ? formatDate(singleValue.value, dateFormat.value, currentLocale.value)
      : '';
  }
}

// 监听值变化
watch(() => singleValue.value, initDisplayValue, { immediate: true });
watch(() => rangeValueModel.value, initDisplayValue, { immediate: true });
watch(() => [dateFormat.value, currentLocale.value], initDisplayValue);

// 处理日期选择（单个）
function handleSingleChange(value: Dayjs | string, _dateString: string) {
  // v-model:value 会自动更新 singleValue，这里只需要触发 change 事件
  const date = typeof value === 'string' ? null : value;
  emits('change', date);
}

// 处理日期范围选择
function handleRangeChange(
  value: [Dayjs, Dayjs] | [string, string] | null,
  _dateString: [string, string],
) {
  // v-model:value 会自动更新 rangeValueModel，这里只需要触发 change 事件
  if (!value) {
    emits('change', null);
    return;
  }
  const dates: [Dayjs | null, Dayjs | null] = [
    typeof value[0] === 'string' ? null : value[0],
    typeof value[1] === 'string' ? null : value[1],
  ];
  emits('change', dates);
}

// Ant Design Vue DatePicker 的配置
const datePickerProps = computed(() => {
  const baseProps: any = {
    format: dateFormat.value,
    placeholder: props.range ? props.rangePlaceholder : props.placeholder,
    disabled: props.disabled,
    showToday: props.showToday,
    class: props.class,
  };

  if (props.showTime) {
    baseProps.showTime = {
      format: 'HH:mm:ss',
    };
    baseProps.showNow = props.showNow;
  }

  return baseProps;
});
</script>

<template>
  <AntDatePicker
    v-if="!range"
    v-model:value="singleValue"
    v-bind="datePickerProps"
    :class="cn('w-full', props.class)"
    @change="handleSingleChange"
  />
  <AntDatePicker.RangePicker
    v-else
    v-model:value="rangeValueModel"
    v-bind="datePickerProps"
    :class="cn('w-full', props.class)"
    @change="handleRangeChange"
  />
</template>
