<script lang="ts" setup>
import { watch } from 'vue';

import { CircleX } from '@vben-core/icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';

interface Props {
  allowClear?: boolean;
  class?: any;
  /** onChange 事件处理器（用于表单系统） */
  onChange?: (value: string | undefined) => void;
  /** onClear 事件处理器（用于清除按钮） */
  onClear?: () => void;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  allowClear: false,
});

const emits = defineEmits<{
  (e: 'clear'): void;
}>();

const modelValue = defineModel<string>();

// 监听 modelValue 变化，触发 onChange
watch(
  () => modelValue.value,
  (newValue) => {
    if (props.onChange) {
      props.onChange(newValue);
    }
  },
);

function handleClear() {
  modelValue.value = undefined;
  emits('clear');
  // 调用 onClear prop（如果存在）
  if (props.onClear) {
    props.onClear();
  }
}
</script>
<template>
  <Select v-model="modelValue">
    <SelectTrigger :class="props.class" class="flex w-full items-center">
      <SelectValue class="flex-auto text-left" :placeholder="placeholder" />
      <CircleX
        @pointerdown.stop
        @click.stop.prevent="handleClear"
        v-if="allowClear && modelValue"
        data-clear-button
        class="mr-1 size-4 cursor-pointer opacity-50 hover:opacity-100"
      />
    </SelectTrigger>
    <SelectContent>
      <template v-for="item in options" :key="item.value">
        <SelectItem :value="item.value"> {{ item.label }} </SelectItem>
      </template>
    </SelectContent>
  </Select>
</template>

<style lang="scss" scoped>
button[role='combobox'][data-placeholder] {
  color: hsl(var(--muted-foreground));
}

button {
  --ring: var(--primary);
}
</style>
