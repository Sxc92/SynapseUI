<script setup lang="ts">
import { computed } from 'vue';
import { useVModel } from '@vueuse/core';
import { X } from '@vben/icons';
import { cn } from '../utils';

interface Props {
  /** 输入值 */
  modelValue?: string | number;
  /** 默认值 */
  defaultValue?: string | number;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示清除按钮 */
  allowClear?: boolean;
  /** 自定义类名 */
  class?: any;
  /** onChange 事件处理器（用于表单系统） */
  onChange?: (value: string | number) => void;
  /** onClear 事件处理器（用于清除按钮） */
  onClear?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  allowClear: false,
  disabled: false,
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
  (e: 'clear'): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
});

// 是否显示清除按钮
const showClear = computed(() => {
  return props.allowClear && modelValue.value !== undefined && modelValue.value !== null && modelValue.value !== '';
});

// 处理清除
function handleClear() {
  modelValue.value = '';
  emits('change', '');
  emits('clear');
  // 调用 onClear prop（如果存在）
  if (props.onClear) {
    props.onClear();
  }
}

// 处理输入变化
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const newValue = target.value;
  modelValue.value = newValue;
  emits('change', newValue);
  // 调用 onChange prop（如果存在）- 这是表单系统需要的
  if (props.onChange) {
    props.onChange(newValue);
  }
}
</script>

<template>
  <div class="relative w-full">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="
        cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
          allowClear && 'pr-8',
          props.class,
        )
      "
      @input="handleInput"
    />
    <!-- 清除按钮 -->
    <button
      v-if="showClear"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      @click="handleClear"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">清除</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
input {
  --ring: var(--primary);
}
</style>

