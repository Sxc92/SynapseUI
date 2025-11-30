<script lang="ts" setup>
import { computed, unref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { VbenIcon } from '@vben-core/shadcn-ui';

import type { ProcessedToolbarButton } from '../config/toolbar-config';

const props = defineProps<{
  buttons: ProcessedToolbarButton[] | (() => ProcessedToolbarButton[]);
}>();

// 处理 buttons 可能是 ComputedRef 的情况
// Vue 模板会自动解包 ComputedRef，但为了确保兼容性，我们显式处理
const buttonsList = computed(() => {
  const value = typeof props.buttons === 'function' ? props.buttons() : props.buttons;
  const buttons = unref(value);
  return buttons;
});
</script>

<template>
  <VbenButton
    v-for="(button, index) in buttonsList"
    :key="index"
    :type="button.type || 'default'"
    :disabled="button.disabled()"
    @click="button.onClick"
  >
    <!-- 图标放在按钮内容前面 -->
    <template v-if="(button as any)._iconString">
      <VbenIcon
        :icon="(button as any)._iconString"
        class="mr-2 size-4"
      />
    </template>
    <component
      v-else-if="button.IconComponent"
      :is="button.IconComponent"
      class="mr-2 size-4"
    />
    {{ $t(button.textKey) }}
  </VbenButton>
</template>

