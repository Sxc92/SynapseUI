import type { Ref } from 'vue';

/**
 * 创建分页图标配置
 * VxeTable 的分页图标配置只接受 CSS 类名字符串
 * 我们使用自定义的 CSS 类名，然后通过 CSS 样式覆盖为 Iconify 图标
 * @returns 分页图标配置对象
 */
export function createPagerIcons() {
  // 使用自定义 CSS 类名，这些类名会在 CSS 中映射到 Iconify 图标
  // 通过 CSS 的方式实现图标替换，保持与 VxeTable 的兼容性
  return {
    iconHomePage: 'vxe-icon-pager-first-lucide', // 首页：将通过 CSS 显示为 Lucide 图标
    iconPrevJump: 'vxe-icon-pager-prev-jump-lucide', // 向前跳转：双左箭头
    iconPrevPage: 'vxe-icon-pager-prev-lucide', // 上一页：单左箭头
    iconNextPage: 'vxe-icon-pager-next-lucide', // 下一页：单右箭头
    iconNextJump: 'vxe-icon-pager-next-jump-lucide', // 向后跳转：双右箭头
    iconEndPage: 'vxe-icon-pager-last-lucide', // 末页：将通过 CSS 显示为 Lucide 图标
    iconJumpMore: 'vxe-icon-pager-more-lucide', // 更多：水平省略号
  };
}

/**
 * 分页信息类型
 */
export interface PagerInfo {
  currentPage: number;
  enabled: boolean;
  pageSize: number;
}

/**
 * 创建序列号配置
 * @param pagerInfoRef 分页信息的响应式引用
 * @param defaultPageSize 默认每页大小
 * @returns 序列号配置对象
 */
export function createSeqConfig(
  pagerInfoRef: Ref<PagerInfo>,
  defaultPageSize: number = 10,
) {
  return {
    // 自定义序列号计算方法
    // 根据分页配置自动处理：如果启用分页，会根据当前页和每页大小计算；否则使用行索引+1
    seqMethod: ({ rowIndex }: any) => {
      // 使用闭包访问分页信息
      const pagerInfo = pagerInfoRef.value;

      // 检查是否启用了分页
      if (pagerInfo && pagerInfo.enabled) {
        const currentPage = pagerInfo.currentPage || 1;
        const pageSize = pagerInfo.pageSize || defaultPageSize;
        // 根据当前页和每页大小计算序列号
        // 例如：第1页显示 1-10，第2页显示 11-20
        return (currentPage - 1) * pageSize + rowIndex + 1;
      }

      // 如果没有分页配置，直接使用行索引+1（从1开始）
      return rowIndex + 1;
    },
  };
}

