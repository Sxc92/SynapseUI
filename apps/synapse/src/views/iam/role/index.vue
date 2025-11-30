<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { ToolbarButtons } from '#/adapter/vxe-table/config';

import { useRoleTable } from './roleTable';

// 使用表格配置 Composable
// 表格高度会根据每页条数自动调整（在 grid.ts 中处理）
const { Grid, drawerForm, permissionDrawer, toolbarButtons } = useRoleTable();
</script>

<template>
  <div class="page-wrapper">
    <Page auto-content-height>
      <Grid>
        <template #toolbar-tools>
          <ToolbarButtons :buttons="toolbarButtons" />
        </template>
      </Grid>
    </Page>
    <!-- Drawer Form 组件 -->
    <drawerForm.Drawer />
    <!-- 权限分配弹窗 -->
    <permissionDrawer.Modal />
  </div>
</template>

<style scoped></style>
