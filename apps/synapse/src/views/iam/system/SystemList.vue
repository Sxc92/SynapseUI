<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
} from '@vben-core/shadcn-ui';
import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { getAllSystems } from '#/api/iam/system';
import type { SystemApi } from '#/api/iam/system';

// 创建图标组件（使用 createIconifyIcon 创建）
const CheckCircleIcon = createIconifyIcon('mdi:check-circle');
const CloseCircleIcon = createIconifyIcon('mdi:close-circle');

/**
 * 系统列表组件 Props
 */
interface Props {
  /** 选中的系统 ID */
  modelValue?: string | undefined;
  /** 是否显示"全部"选项 */
  showAllOption?: boolean;
  /** 标题 */
  title?: string;
  /** 宽度 */
  width?: string;
}

/**
 * 系统列表组件 Emits
 */
interface Emits {
  (e: 'update:modelValue', value: string | undefined): void;
  (e: 'select', systemId: string | undefined): void;
}

const props = withDefaults(defineProps<Props>(), {
  showAllOption: false,
  title: undefined,
  width: '250px',
});

// 计算标题，如果未传入则使用国际化文本
const titleText = computed(() => props.title || $t('system.listTitle'));

const emit = defineEmits<Emits>();

// 系统列表相关状态
const systems = ref<SystemApi.System[]>([]);
const selectedSystemId = ref<string | undefined>(props.modelValue);
const loading = ref(false);
const isUnmounted = ref(false);

// 加载系统列表
const loadSystems = async () => {
  try {
    loading.value = true;
    const data = await getAllSystems();
    systems.value = data || [];
  } catch (error) {
    console.error('加载系统列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择系统
const handleSystemSelect = (systemId: string | undefined) => {
  if (isUnmounted.value) {
    return;
  }

  // 如果点击的是已选中的系统，则取消选中
  if (selectedSystemId.value === systemId) {
    selectedSystemId.value = undefined;
    systemId = undefined;
  } else {
    selectedSystemId.value = systemId;
  }

  // 触发事件
  emit('update:modelValue', systemId);
  emit('select', systemId);
};

// 监听外部传入的 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    selectedSystemId.value = newValue;
  },
);

// 组件挂载时加载系统列表
onMounted(() => {
  loadSystems();
});

// 组件卸载前标记为已卸载
onBeforeUnmount(() => {
  isUnmounted.value = true;
});
</script>

<template>
  <Card :style="{ width: props.width }" class="flex h-full flex-col shadow-sm">
    <CardHeader class="border-b border-border/40 pb-3 pt-4">
      <CardTitle class="text-base font-semibold">{{ titleText }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-1 overflow-hidden p-0">
      <ScrollArea class="h-full">
        <div class="p-1.5">
          <!-- 加载状态 -->
          <div
            v-if="loading"
            class="flex items-center justify-center py-12 text-sm text-muted-foreground"
          >
            <span>{{ $t('system.loading') }}</span>
          </div>
          <!-- 空状态 -->
          <div
            v-else-if="systems.length === 0"
            class="flex items-center justify-center py-12 text-sm text-muted-foreground"
          >
            <span>{{ $t('system.empty') }}</span>
          </div>
          <!-- 系统列表 -->
          <ul v-else class="w-full space-y-0.5" role="list">
            <!-- 系统列表项 -->
            <li
              v-for="system in systems"
              :key="system.id"
              :class="{
                'bg-primary/10 text-primary': selectedSystemId === system.id,
                'hover:bg-accent/50': selectedSystemId !== system.id,
              }"
              class="group relative cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
              @click="handleSystemSelect(system.id)"
            >
              <div class="flex items-center gap-3">
                <!-- 选中指示条 -->
                <div
                  v-if="selectedSystemId === system.id"
                  class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                />
                <!-- 状态图标 -->
                <div class="flex shrink-0 items-center">
                  <CheckCircleIcon
                    v-if="system.status"
                    :class="{
                      'text-green-600 dark:text-green-400':
                        selectedSystemId === system.id,
                      'text-green-500 dark:text-green-500':
                        selectedSystemId !== system.id,
                    }"
                    class="h-4 w-4 transition-colors"
                  />
                  <CloseCircleIcon
                    v-else
                    :class="{
                      'text-red-600 dark:text-red-400':
                        selectedSystemId === system.id,
                      'text-red-500 dark:text-red-500':
                        selectedSystemId !== system.id,
                    }"
                    class="h-4 w-4 transition-colors"
                  />
                </div>
                <!-- 系统名称 -->
                <span
                  :class="{
                    'font-semibold': selectedSystemId === system.id,
                    'font-normal': selectedSystemId !== system.id,
                  }"
                  class="relative flex-1 truncate text-sm"
                >
                  {{ system.name }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>

<style scoped></style>

