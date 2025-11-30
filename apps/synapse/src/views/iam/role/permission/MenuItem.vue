<script setup lang="ts">
import { computed } from 'vue';

import { Switch } from 'ant-design-vue';

import type { MenuNode } from './types';

interface Props {
  menu: MenuNode;
  level?: number;
  selectedMenuId: string | null;
  selectedMenuIds: Set<string>;
  expandedMenuIds: Set<string>;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
});

const emit = defineEmits<{
  select: [menu: MenuNode];
  'toggle-menu': [menuId: string, selected: boolean];
  'toggle-expand': [menuId: string];
}>();

const isSelected = computed(() => props.selectedMenuIds.has(props.menu.menuId));
const isExpanded = computed(() => props.expandedMenuIds.has(props.menu.menuId));
const hasChildren = computed(() => props.menu.children && props.menu.children.length > 0);
const indent = computed(() => props.level * 20);
const isActive = computed(() => props.selectedMenuId === props.menu.menuId);

function handleSelect() {
  emit('select', props.menu);
}

function handleToggleMenu(checked: any) {
  emit('toggle-menu', props.menu.menuId, !!checked);
}

function handleToggleExpand(event: Event) {
  event.stopPropagation();
  emit('toggle-expand', props.menu.menuId);
}
</script>

<template>
  <div class="menu-item">
    <div
      :class="[
        'flex items-center gap-2 rounded-md px-2 py-1.5 transition-all cursor-pointer',
        {
          'bg-primary/10 border border-primary shadow-sm hover:bg-primary/15': isActive,
          'bg-muted/30 border border-transparent hover:bg-muted/50': isSelected && !isActive,
          'hover:bg-accent/50': !isSelected && !isActive,
        },
      ]"
      :style="{ paddingLeft: `${12 + indent}px` }"
      @click="handleSelect"
    >
      <button
        v-if="hasChildren"
        class="flex-shrink-0 rounded p-0.5 hover:bg-accent transition-colors"
        @click.stop="handleToggleExpand"
      >
        <img
          :class="['h-3.5 w-3.5 transition-transform', { 'rotate-90': isExpanded }]"
          src="/icons/chevron-right.svg"
          alt=""
        />
      </button>
      <span
        :class="[
          'flex-1 text-sm font-medium',
          {
            'text-primary': isActive,
            'text-foreground': isSelected && !isActive,
            'text-muted-foreground': !isSelected && !isActive,
          },
        ]"
      >
        {{ menu.name }}
      </span>
      <div @click.stop>
        <Switch
          :checked="isSelected"
          size="small"
          class="flex-shrink-0"
          @update:checked="handleToggleMenu"
      />
      </div>
    </div>
    <div v-if="hasChildren && isExpanded" class="ml-4 border-l-2 border-border/50 pl-2 mt-1">
      <MenuItem
        v-for="child in menu.children"
        :key="child.id"
        :menu="child"
        :level="level + 1"
        :selected-menu-id="selectedMenuId"
        :selected-menu-ids="selectedMenuIds"
        :expanded-menu-ids="expandedMenuIds"
        @select="$emit('select', $event)"
        @toggle-menu="(menuId, selected) => $emit('toggle-menu', menuId, selected)"
        @toggle-expand="$emit('toggle-expand', $event)"
      />
    </div>
  </div>
</template>

