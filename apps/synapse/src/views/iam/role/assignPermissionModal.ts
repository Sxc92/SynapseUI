import type { RoleData } from './roleTable';

import { defineComponent, h, ref, unref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';

import PermissionPanelLayout from './permission/PermissionPanelLayout.vue';

/**
 * 权限分配弹窗 Hook
 */
export function usePermissionModal() {
  const isOpen = ref(false);
  const currentRole = ref<RoleData | null>(null);
  const loading = ref(false);
  const panelLayoutRef = ref<InstanceType<typeof PermissionPanelLayout> | null>(null);

  // 创建弹窗实例
  // 通过 class 参数设置宽度，覆盖默认的 w-[520px]
  // 通过 contentClass 设置内容区域固定高度和滚动
  const [VbenModal, modalApi] = useVbenModal({
    title: $t('role.assignPermission'),
    description: '',
    loading: unref(loading),
    isOpen: unref(isOpen),
    centered: false,
    fullscreen: false,
    fullscreenButton: true,
    draggable: true,
    appendToMain: true,
    // 设置弹窗宽度为 1200px，适合三栏布局
    class: '!max-w-[1200px] !w-[1200px]',
    // 设置内容区域固定高度，超出部分滚动
    contentClass: '!h-[650px] !overflow-y-auto',
    // 禁用打开时自动聚焦，避免意外触发确认按钮
    openAutoFocus: false,
    onOpenChange: (open: boolean) => {
      if (!open) {
        close();
      }
    },
    destroyOnClose: true,
    footer: true,
    confirmText: $t('common.confirm'),
    cancelText: $t('common.cancel'),
    showCancelButton: true,
    onConfirm: async () => {
      console.log('[assignPermissionModal] onConfirm 被调用');
      if (panelLayoutRef.value && typeof panelLayoutRef.value.savePermissions === 'function') {
        console.log('[assignPermissionModal] 调用 savePermissions');
        await panelLayoutRef.value.savePermissions();
      } else {
        console.warn('[assignPermissionModal] panelLayoutRef 不存在或 savePermissions 不是函数');
      }
    },
  });

  // 打开权限分配弹窗
  async function openPermissionDrawer(role: RoleData) {
    currentRole.value = role;
    isOpen.value = true;
    modalApi.open();
  }

  // 关闭弹窗
  function close() {
    isOpen.value = false;
    modalApi.close();
    currentRole.value = null;
    if (panelLayoutRef.value) {
      panelLayoutRef.value.resetState();
    }
  }

  // 创建弹窗组件
  const Modal = defineComponent({
    name: 'PermissionModal',
    setup() {
      return () => {
        if (!VbenModal) {
          return null;
        }

        // 在渲染函数内部创建 slot 内容，确保依赖追踪正确
        const defaultSlot = () => {
        if (!currentRole.value) {
          return null;
        }

        return h(PermissionPanelLayout, {
          ref: (el: any) => {
            panelLayoutRef.value = el;
      },
          roleId: currentRole.value.id,
          onSuccess: () => {
            close();
          },
          onError: (error: any) => {
            console.error('权限分配失败:', error);
          },
        });
      };

        return h(VbenModal, {}, { default: defaultSlot });
      };
    },
  });

  return {
    openPermissionDrawer,
    close,
    Modal,
  };
}
