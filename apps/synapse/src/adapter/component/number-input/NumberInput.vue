<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useI18n } from '@vben/locales';

import { useVModel } from '@vueuse/core';

import { cn } from '../utils';
import {
  formatNumber,
  parseFormattedNumber,
  validateNumberRange,
} from './utils';

interface Props {
  /** 输入值 */
  modelValue?: number | string;
  /** 默认值 */
  defaultValue?: number | string;
  /** 小数位数 */
  precision?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 语言环境，默认从系统获取 */
  locale?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  class?: any;
  /** 货币符号前缀 */
  prefix?: string;
  /** 货币符号后缀 */
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  precision: undefined,
  disabled: false,
  prefix: '',
  suffix: '',
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: number | string): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
  (e: 'change', value: number | string): void;
}>();

const { locale: i18nLocale } = useI18n();
const currentLocale = computed(
  () => props.locale || i18nLocale.value || 'zh-CN',
);

// 内部输入值（显示格式化后的值）
const displayValue = ref<string>('');
// 是否正在输入（避免格式化干扰输入）
const isComposing = ref(false);

// 实际值（纯数字）
const actualValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
});

// 初始化显示值
function initDisplayValue() {
  if (
    actualValue.value === null ||
    actualValue.value === undefined ||
    actualValue.value === ''
  ) {
    displayValue.value = '';
    return;
  }

  const numValue =
    typeof actualValue.value === 'string'
      ? Number.parseFloat(actualValue.value)
      : actualValue.value;

  if (Number.isNaN(numValue)) {
    displayValue.value = String(actualValue.value);
  } else {
    const formatted = formatNumber(
      numValue,
      currentLocale.value,
      props.precision,
    );
    displayValue.value = props.prefix + formatted + props.suffix;
  }
}

// 初始化
watch(() => actualValue.value, initDisplayValue, { immediate: true });
watch(() => [props.prefix, props.suffix, props.precision], initDisplayValue);

// 处理输入
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  let inputValue = target.value;

  // 如果有前缀/后缀，需要移除它们
  if (props.prefix && inputValue.startsWith(props.prefix)) {
    inputValue = inputValue.slice(props.prefix.length);
  }
  if (props.suffix && inputValue.endsWith(props.suffix)) {
    inputValue = inputValue.slice(0, -props.suffix.length);
  }

  // 如果正在输入，直接更新显示值（不格式化）
  if (isComposing.value) {
    displayValue.value = props.prefix + inputValue + props.suffix;
    return;
  }

  // 解析为纯数字
  const parsed = parseFormattedNumber(inputValue);

  if (parsed === '' || parsed === '-') {
    displayValue.value = props.prefix + parsed + props.suffix;
    return;
  }

  const numValue = Number.parseFloat(parsed);

  if (Number.isNaN(numValue)) {
    // 无效数字，保持输入（允许用户继续输入）
    displayValue.value = props.prefix + inputValue + props.suffix;
  } else {
    // 验证范围
    if (validateNumberRange(numValue, props.min, props.max)) {
      // 格式化显示
      const formatted = formatNumber(
        numValue,
        currentLocale.value,
        props.precision,
      );
      displayValue.value = props.prefix + formatted + props.suffix;
      // 更新实际值
      actualValue.value =
        props.precision === undefined
          ? numValue
          : Number.parseFloat(numValue.toFixed(props.precision));
    } else {
      // 超出范围，恢复之前的值
      initDisplayValue();
    }
  }
}

// 处理失去焦点
function handleBlur(event: Event) {
  isComposing.value = false;
  const target = event.target as HTMLInputElement;
  let inputValue = target.value;

  // 移除前缀/后缀
  if (props.prefix && inputValue.startsWith(props.prefix)) {
    inputValue = inputValue.slice(props.prefix.length);
  }
  if (props.suffix && inputValue.endsWith(props.suffix)) {
    inputValue = inputValue.slice(0, -props.suffix.length);
  }

  const parsed = parseFormattedNumber(inputValue);

  if (parsed === '' || parsed === '-') {
    actualValue.value = '';
    displayValue.value = '';
    emits('blur');
    emits('change', '');
    return;
  }

  const numValue = Number.parseFloat(parsed);

  if (Number.isNaN(numValue)) {
    // 无效数字，恢复之前的值
    initDisplayValue();
  } else {
    // 应用范围限制
    let finalValue = numValue;
    if (props.min !== undefined && finalValue < props.min) {
      finalValue = props.min;
    }
    if (props.max !== undefined && finalValue > props.max) {
      finalValue = props.max;
    }

    // 应用精度
    if (props.precision !== undefined) {
      finalValue = Number.parseFloat(finalValue.toFixed(props.precision));
    }

    // 格式化并更新
    const formatted = formatNumber(
      finalValue,
      currentLocale.value,
      props.precision,
    );
    displayValue.value = props.prefix + formatted + props.suffix;
    actualValue.value = finalValue;
    emits('change', finalValue);
  }

  emits('blur');
}

// 处理获得焦点
function handleFocus(_event: Event) {
  isComposing.value = true;
  emits('focus');
}

// 处理组合输入（中文输入法等）
function handleCompositionStart() {
  isComposing.value = true;
}

function handleCompositionEnd(event: Event) {
  isComposing.value = false;
  handleInput(event);
}
</script>

<template>
  <input
    :value="displayValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    type="text"
    inputmode="decimal"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  />
</template>

<style lang="scss" scoped>
input {
  --ring: var(--primary);
}
</style>
