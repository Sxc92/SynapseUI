<script setup lang="ts">
import { ref } from 'vue';

import { Empty, Input } from 'ant-design-vue';
import { Card, CardContent, CardHeader } from '@vben-core/shadcn-ui';

import { $t } from '#/locales';

import type { MenuNode } from './types';
import MenuItem from './MenuItem.vue';

interface Props {
  menus: MenuNode[];
  selectedMenuId: string | null;
  selectedMenuIds: Set<string>;
  expandedMenuIds: Set<string>;
  searchKeyword: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedMenuId': [menuId: string | null];
  'update:searchKeyword': [keyword: string];
  'toggle-expand': [menuId: string];
  'toggle-menu': [menuId: string, selected: boolean];
}>();

const searchInputRef = ref();

function handleSearch(value: string) {
  emit('update:searchKeyword', value);
  
  // 如果有关键词，自动展开匹配的菜单
  if (value.trim()) {
    const keyword = value.toLowerCase();
    for (const menu of props.menus) {
      if (menu.name.toLowerCase().includes(keyword)) {
        emit('toggle-expand', menu.menuId);
      }
    }
  }
}

function selectMenu(menu: MenuNode) {
  emit('update:selectedMenuId', menu.menuId);
}

function toggleExpand(menuId: string) {
  emit('toggle-expand', menuId);
}

function handleToggleMenu(menuId: string, selected: boolean) {
  emit('toggle-menu', menuId, selected);
}
</script>

<template>
  <Card class="flex h-full w-[350px] shrink-0 flex-col">
    <CardHeader class="border-b p-3">
      <Input
        ref="searchInputRef"
        :value="searchKeyword"
        :placeholder="$t('role.searchMenuPlaceholder')"
        allow-clear
        @update:value="handleSearch"
      >
        <template #prefix>
          <img
            class="h-4 w-4 text-muted-foreground"
            src="/icons/search.svg"
            alt=""
          />
        </template>
      </Input>
    </CardHeader>

    <CardContent class="flex-1 overflow-y-auto p-2">
      <Empty
        v-if="menus.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="searchKeyword ? $t('role.noMenuFound') : $t('role.pleaseSelectSystem')"
        class="py-8"
      />
      <div v-else class="space-y-1.5">
        <MenuItem
          v-for="menu in menus"
          :key="menu.id"
          :menu="menu"
          :level="0"
          :selected-menu-id="selectedMenuId"
          :selected-menu-ids="selectedMenuIds"
          :expanded-menu-ids="expandedMenuIds"
          @select="selectMenu"
          @toggle-menu="handleToggleMenu"
          @toggle-expand="toggleExpand"
        />
      </div>
    </CardContent>
  </Card>
</template>
