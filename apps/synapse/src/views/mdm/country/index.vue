<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { VbenButton } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { useCountryTable } from './countryTable';
import { $t } from '@vben/locales';
// 使用表格配置 Composable
// 表格高度会根据每页条数自动调整（在 grid.ts 中处理）
const { Grid, drawerForm } = useCountryTable();
</script>

<template>
  <div class="page-wrapper">
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <VbenButton type="primary" @click="drawerForm.openCreate">
            <template #icon>
              <Plus class="size-4" />
            </template>
            {{$t('add')}}
          </VbenButton>
        </template>
      </Grid>
    </Page>
    <!-- Drawer Form 组件 -->
    <drawerForm.Drawer />
  </div>
</template>

<style scoped></style>
