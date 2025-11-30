<script setup lang="ts">
import { computed } from 'vue';

import { Button, Empty, List, Space, Switch, Tag } from 'ant-design-vue';
import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import { $t } from '#/locales';

import type { ResourceNode } from './types';
import { useResourcePanelStyle } from './composables';

interface Props {
  menuName?: string;
  resources: ResourceNode[];
  selectedResourceIds: Set<string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'toggle-resource': [resourceId: string, selected: boolean];
  'select-all': [];
  'deselect-all': [];
}>();

const buttonResources = computed(() => {
  return props.resources.filter((r) => r.type === 'BUTTON');
});

const apiResources = computed(() => {
  return props.resources.filter((r) => r.type === 'API');
});

function toggleResource(resource: ResourceNode) {
  const isSelected = props.selectedResourceIds.has(resource.id);
  emit('toggle-resource', resource.id, !isSelected);
}

function selectAll() {
  emit('select-all');
}

function deselectAll() {
  emit('deselect-all');
}

const allSelected = computed(() => {
  return (
    props.resources.length > 0 &&
    props.resources.every((r) => props.selectedResourceIds.has(r.id))
  );
});

// 创建一个 computed，返回资源选中状态的映射（类似 MenuItem 的方式）
const resourceCheckedMap = computed(() => {
  // 访问 size 确保响应式追踪
  void props.selectedResourceIds.size;
  void props.resources.length;
  
  const map: Record<string, boolean> = {};
  for (const resource of props.resources) {
    map[resource.id] = props.selectedResourceIds.has(resource.id);
  }
  
  console.log('[ResourcePanel] resourceCheckedMap computed:', map);
  return map;
});

const { resourceItemClass } = useResourcePanelStyle();
</script>

<template>
  <Card class="flex h-full min-w-0 flex-1 flex-col">
    <CardHeader class="border-b">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-base">{{ menuName || $t('role.pleaseSelectMenu') }}</CardTitle>
          <p v-if="menuName" class="mt-1 text-sm text-muted-foreground">
            {{ $t('role.totalPermissions', [resources.length]) }}
          </p>
        </div>
        <Button
          v-if="resources.length > 0"
          type="link"
          size="small"
          @click="allSelected ? deselectAll() : selectAll()"
        >
          {{ allSelected ? $t('role.deselectAll') : $t('role.selectAll') }}
        </Button>
      </div>
    </CardHeader>

    <CardContent class="flex-1 overflow-y-auto">
      <Empty
        v-if="!menuName"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="$t('role.pleaseSelectMenu')"
        class="flex h-full items-center justify-center"
      />
      <Empty
        v-else-if="resources.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="$t('role.noPermissionConfig')"
        class="flex h-full items-center justify-center"
      />

      <Space v-else direction="vertical" :size="20" class="w-full">
        <!-- 功能点权限 -->
        <div v-if="buttonResources.length > 0">
          <h4 class="mb-3 text-sm font-medium text-foreground">{{ $t('role.buttonPermission') }}</h4>
          <List :bordered="false" :data-source="buttonResources">
            <template #renderItem="{ item, index }">
              <List.Item
                :class="[
                  resourceItemClass,
                  'mb-2',
                ]"
                :style="{
                  borderBottom: index < buttonResources.length - 1 ? '1px solid hsl(var(--border) / 0.5) !important' : '1px solid hsl(var(--border)) !important',
                }"
              >
                <div class="flex w-full items-center justify-between">
                <Space>
                  <Tag color="blue">{{ item.type }}</Tag>
                  <span class="text-sm">{{ item.name }}</span>
                  <span v-if="item.code" class="text-muted-foreground text-xs">
                    ({{ item.code }})
                  </span>
                </Space>
                  <div @click.stop class="flex-shrink-0">
                  <Switch
                      :checked="resourceCheckedMap[item.id] || false"
                      @update:checked="(checked: any) => {
                        console.log(`[ResourcePanel] Switch update:checked ${item.id} = ${checked}`);
                        toggleResource(item);
                      }"
                  />
                  </div>
                </div>
              </List.Item>
            </template>
          </List>
        </div>

        <!-- API 权限 -->
        <div v-if="apiResources.length > 0">
          <h4 class="mb-3 text-sm font-medium text-foreground">{{ $t('role.apiPermission') }}</h4>
          <List :bordered="false" :data-source="apiResources">
            <template #renderItem="{ item, index }">
              <List.Item
                :class="[
                  resourceItemClass,
                  'mb-2',
                ]"
                :style="{
                  borderBottom: index < apiResources.length - 1 ? '1px solid hsl(var(--border) / 0.5) !important' : '1px solid hsl(var(--border)) !important',
                }"
              >
                <div class="flex w-full items-center justify-between">
                <Space>
                  <Tag color="green">{{ item.type }}</Tag>
                  <span class="text-sm font-mono">{{ item.name }}</span>
                  <span v-if="item.code" class="text-muted-foreground text-xs">
                    ({{ item.code }})
                  </span>
                </Space>
                  <div @click.stop class="flex-shrink-0">
                  <Switch
                      :checked="resourceCheckedMap[item.id] || false"
                      @update:checked="(checked: any) => {
                        console.log(`[ResourcePanel] Switch update:checked ${item.id} = ${checked}`);
                        toggleResource(item);
                      }"
                  />
                  </div>
                </div>
              </List.Item>
            </template>
          </List>
        </div>
      </Space>
    </CardContent>
  </Card>
</template>

