<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';

import { Page } from '@vben/common-ui';

import SystemList from '../system/SystemList.vue';
import { ToolbarButtons } from '#/adapter/vxe-table/config';

import { useMenuTable } from './menuTable';

// 使用表格配置 Composable
// 表格高度会根据每页条数自动调整（在 grid.ts 中处理）
const { Grid, drawerForm, toolbarButtons, gridApi, setFieldValueAndSearch } =
  useMenuTable();

// 系统选择状态
const selectedSystemId = ref<string | undefined>(undefined);
// 用于标记组件是否已卸载，避免在组件卸载后执行异步操作
const isUnmounted = ref(false);

// 选择系统并触发搜索
const handleSystemSelect = async (systemId: string | undefined) => {
  // 如果组件已卸载，不执行任何操作
  if (isUnmounted.value) {
    return;
  }

  // 直接触发搜索，使用 gridApi 的统一方法设置字段值并触发搜索
  // 该方法内部会处理初始化等待和错误处理
  try {
    // 优先使用直接暴露的方法，如果不可用则使用 gridApi 上的方法
    const searchMethod =
      setFieldValueAndSearch || gridApi.value?.setFieldValueAndSearch;

    if (searchMethod && !isUnmounted.value) {
      await searchMethod('systemId', systemId);
    } else if (!isUnmounted.value) {
      console.warn('setFieldValueAndSearch 方法不可用');
    }
  } catch (error) {
    // 如果组件已卸载，忽略错误
    if (!isUnmounted.value) {
      console.error('触发搜索失败:', error);
    }
  }
};

// 组件卸载前标记为已卸载，避免异步操作在组件销毁后执行
onBeforeUnmount(() => {
  isUnmounted.value = true;
});
</script>

<template>
  <div class="page-wrapper">
    <Page auto-content-height>
      <div class="flex h-full gap-4">
        <!-- 左侧系统列表 -->
        <SystemList
          v-model="selectedSystemId"
          @select="handleSystemSelect"
        />

        <!-- 右侧表格区域 -->
      <div class="flex-1 min-w-0">
      <Grid>
        <template #toolbar-tools>
          <ToolbarButtons :buttons="toolbarButtons" />
        </template>
      </Grid>
        </div>
      </div>
    </Page>
    <!-- Drawer Form 组件 -->
    <drawerForm.Drawer />
  </div>
</template>

<style scoped>
/* 优化树形表格的缩进和视觉效果 */

/* 树形展开/折叠按钮样式优化 */
:deep(.vxe-tree--btn-wrapper) {
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 树形展开图标样式优化 */
:deep(.vxe-tree--btn) {
  color: #606266;
  transition: all 0.2s;
  font-size: 14px;
}

:deep(.vxe-tree--btn:hover) {
  color: #409eff;
}

/* 确保树形节点内容对齐 */
:deep(.vxe-tree-node) {
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* 优化树形节点的缩进，确保子节点有足够的缩进空间 */
:deep(.vxe-table .vxe-body--row .vxe-body--column .vxe-tree-node) {
  padding-left: 0;
}

/* 确保树形列的内容有足够的宽度 */
:deep(.vxe-table .vxe-body--column[col-id="name"]) {
  overflow: visible;
}

/* 优化树形节点的间距 */
:deep(.vxe-tree-node--content) {
  display: flex;
  align-items: center;
  flex: 1;
}

/* 确保表格行高足够，避免树形节点被压缩 */
:deep(.vxe-table .vxe-body--row) {
  min-height: 40px;
}

/* 确保整行都有缩进效果 - vxe-table 会自动在 treeNode 列添加缩进，我们需要确保其他列也跟随 */
/* vxe-table 的树形缩进是通过在 treeNode 列添加 padding-left 实现的 */
/* 我们通过 CSS 确保所有列都能正确显示缩进 */
:deep(.vxe-table .vxe-body--row .vxe-body--column) {
  /* 确保列内容正确对齐 */
  vertical-align: middle;
}

/* 优化序列号列的显示，确保层级序号清晰可见 */
:deep(.vxe-table .vxe-body--column[col-id="_seq"]) {
  font-weight: 500;
  text-align: center;
}

/* 强制操作列宽度 */
:deep(.vxe-table .vxe-header--column[col-id="_actions"]),
:deep(.vxe-table .vxe-body--column[col-id="_actions"]) {
  width: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
}
</style>
