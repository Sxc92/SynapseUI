import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui/es/loading';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/antd';

import { useTitle } from '@vueuse/core';

import { $t, setupI18n } from '#/locales';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

async function bootstrap(namespace: string) {
  // 修复非被动事件监听器警告
  // 拦截 addEventListener 调用，自动为特定事件添加 passive 选项
  // 注意：仅在开发环境应用，生产环境通常不会显示警告
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ) {
      // 需要 passive 选项的事件类型（用于提升滚动性能）
      const passiveEvents = ['wheel', 'mousewheel', 'touchstart', 'touchmove'];

      if (passiveEvents.includes(type)) {
        const opts =
          typeof options === 'boolean' ? { capture: options } : options || {};
        // 如果选项中没有明确设置 passive，则默认设为 true
        // 如果显式设置为 false，则保持 false（允许阻止默认行为）
        if (opts.passive === undefined) {
          opts.passive = true;
        }
        return originalAddEventListener.call(this, type, listener, opts);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();

  // // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   zIndex: 1020,
  // });

  const app = createApp(App);

  // 配置 pinia-store（vxe-table 需要 preferences 已初始化）
  await initStores(app, { namespace });

  // 初始化 vxe-table（包括国际化配置，需要在 preferences 初始化后）
  await import('./adapter/vxe-table');

  // 注册v-loading指令
  registerLoadingDirective(app, {
    loading: 'loading', // 在这里可以自定义指令名称，也可以明确提供false表示不注册这个指令
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 配置路由及路由守卫
  app.use(router);

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
