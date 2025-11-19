<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { useUserTable } from './useUserTable';

// 使用表格配置 Composable
// 表格高度会根据每页条数自动调整（在 grid.ts 中处理）
const { Grid } = useUserTable();
</script>

<template>
  <div class="page-wrapper">
    <Page auto-content-height>
      <Grid />
    </Page>
  </div>
</template>

<style scoped></style>
