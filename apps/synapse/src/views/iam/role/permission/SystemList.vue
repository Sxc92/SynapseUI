<script setup lang="ts">
import { List, Empty, Switch } from 'ant-design-vue';

import { $t } from '#/locales';

import type { SystemNode } from './types';
import { useSystemListStyle } from './composables';

interface Props {
  systems: SystemNode[];
  selectedSystemId: string | null; // 当前激活的系统（用于显示菜单）
  selectedSystemIds: Set<string>; // 选中的系统ID集合（用于权限分配）
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedSystemId': [systemId: string | null];
  'toggle-system': [systemId: string, selected: boolean];
}>();

const { ns, itemClass, itemActiveClass } = useSystemListStyle();

function selectSystem(systemId: string) {
  emit('update:selectedSystemId', systemId);
}

function toggleSystem(systemId: string, checked: boolean) {
  emit('toggle-system', systemId, checked);
}
</script>

<template>
  <div :class="[ns.b(), 'h-full w-[280px] shrink-0 rounded-lg border border-border bg-muted/30']">
    <div class="p-3">
      <h3 class="mb-2 text-sm font-semibold text-foreground">{{ $t('role.systemList') }}</h3>
    </div>
    <List
      v-if="systems.length > 0"
      :bordered="false"
      :data-source="systems"
      class="flex-1 overflow-y-auto px-2"
    >
      <template #renderItem="{ item }">
        <List.Item
          :class="[
            itemClass,
            {
              'bg-primary text-primary-foreground hover:bg-primary/90': props.selectedSystemId === item.systemId,
              'bg-background hover:bg-accent/50': props.selectedSystemId !== item.systemId,
              [itemActiveClass]: props.selectedSystemId === item.systemId,
            },
          ]"
          class="cursor-pointer mb-2 border border-border rounded"
          @click="selectSystem(item.systemId)"
        >
          <span class="flex-1">{{ item.name }}</span>
          <template #actions>
            <div @click.stop>
              <Switch
                :checked="selectedSystemIds.has(item.systemId)"
                @update:checked="(checked: any) => toggleSystem(item.systemId, !!checked)"
              />
            </div>
          </template>
        </List.Item>
      </template>
    </List>
    <Empty
      v-else
      :image="Empty.PRESENTED_IMAGE_SIMPLE"
      :description="$t('role.noSystem')"
      class="py-8"
    />
  </div>
</template>

