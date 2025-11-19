<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';

import { useSystemTable } from './systemTable';
import { $t } from '@vben/locales';

// 使用表格配置 Composable
// 表格高度会根据每页条数自动调整（在 grid.ts 中处理）
const { Grid, drawerForm, toolbarButtons } = useSystemTable();
</script>

<template>
  <div class="page-wrapper">
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <VbenButton
            v-for="(button, index) in toolbarButtons"
            :key="index"
            :type="button.type || 'default'"
            :disabled="button.disabled()"
            @click="button.onClick"
          >
            <template v-if="button.IconComponent" #icon>
              <component :is="button.IconComponent" class="size-4" />
            </template>
            {{ $t(button.textKey) }}
          </VbenButton>
        </template>
      </Grid>
    </Page>
    <!-- Drawer Form 组件 -->
    <drawerForm.Drawer />
  </div>
</template>

<style scoped></style>

