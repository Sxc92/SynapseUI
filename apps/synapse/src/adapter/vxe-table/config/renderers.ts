import type { VxeUIExport } from 'vxe-table';

import { h } from 'vue';

import {
  Badge,
  Button,
  Image,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

/**
 * 注册所有自定义渲染器
 */
export function registerRenderers(vxeUI: VxeUIExport) {
  // ========== CellImage - 图片渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellImage' }
   * 或: cellRender: { name: 'CellImage', props: { width: 50, height: 50, preview: true } }
   */
  vxeUI.renderer.add('CellImage', {
    renderTableDefault(_renderOpts: any, params?: any) {
      if (!params) return '';
      const { column, row } = params;
      const imageUrl = row[column.field];
      const {
        width = 40,
        height = 40,
        preview = true,
        fallback,
      } = _renderOpts.props || {};

      return h(Image, {
        src: imageUrl,
        width,
        height,
        preview: preview || undefined,
        fallback:
          fallback ||
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN',
      });
    },
  });

  // ========== CellLink - 链接渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellLink', props: { text: '点击查看', href: '#' } }
   */
  vxeUI.renderer.add('CellLink', {
    renderTableDefault(renderOpts: any, params?: any) {
      const { props } = renderOpts;
      const { text, href, target = '_blank', onClick } = props || {};

      if (!params) return text || '';

      return h(
        Button,
        {
          size: 'small',
          type: 'link',
          href,
          target,
          onClick: onClick
            ? (e: Event) => {
                e.preventDefault();
                onClick(params.row, params.column);
              }
            : undefined,
        },
        { default: () => text || params.row[params.column.field] },
      );
    },
  });

  // ========== CellTag - 标签渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellTag', props: { color: 'success' } }
   * 支持颜色映射: cellRender: { name: 'CellTag', props: { colorMap: { 'active': 'success', 'inactive': 'error' } } }
   */
  vxeUI.renderer.add('CellTag', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const { color, colorMap, closable = false, onClose } = props || {};

      // 如果提供了颜色映射，根据值查找颜色
      let tagColor = color;
      if (colorMap && cellValue) {
        tagColor = colorMap[cellValue] || color;
      }

      return h(
        Tag,
        {
          color: tagColor,
          closable,
          onClose: onClose
            ? (e: Event) => {
                e.preventDefault();
                onClose(row, column);
              }
            : undefined,
        },
        { default: () => cellValue },
      );
    },
  });

  // ========== CellStatus - 状态渲染器（带徽标） ==========
  /**
   * 使用方式: cellRender: { name: 'CellStatus', props: { statusMap: { 'active': { text: '启用', status: 'success' } } } }
   */
  vxeUI.renderer.add('CellStatus', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const { statusMap, showDot = false } = props || {};

      if (!statusMap || !cellValue) {
        return cellValue;
      }

      const statusInfo = statusMap[cellValue];
      if (!statusInfo) {
        return cellValue;
      }

      const { text, status, badge = false } = statusInfo;

      if (badge) {
        let badgeStatus: 'default' | 'error' | 'success' = 'default';
        if (status === 'success') {
          badgeStatus = 'success';
        } else if (status === 'error') {
          badgeStatus = 'error';
        }
        return h(Badge, {
          status: badgeStatus,
          text,
        });
      }

      if (showDot) {
        return h(
          Space,
          {},
          {
            default: () => [
              h('span', {
                class: (() => {
                  if (status === 'success') return 'bg-green-500';
                  if (status === 'error') return 'bg-red-500';
                  if (status === 'warning') return 'bg-yellow-500';
                  return 'bg-gray-500';
                })(),
              }),
              h('span', text || cellValue),
            ],
          },
        );
      }

      let tagColor: 'default' | 'error' | 'success' | 'warning' = 'default';
      switch (status) {
        case 'error': {
          tagColor = 'error';

          break;
        }
        case 'success': {
          tagColor = 'success';

          break;
        }
        case 'warning': {
          tagColor = 'warning';

          break;
        }
        // No default
      }

      return h(
        Tag,
        {
          color: tagColor,
        },
        { default: () => text || cellValue },
      );
    },
  });

  // ========== CellActions - 操作按钮渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellActions', props: { actions: [{ text: '编辑', onClick: () => {} }] } }
   */
  vxeUI.renderer.add('CellActions', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const { actions = [], size = 'small', type = 'link' } = props || {};

      if (!actions || actions.length === 0) {
        return '';
      }

      return h(
        Space,
        { size: 'small' },
        {
          default: () =>
            actions.map((action: any, index: number) => {
              const {
                text,
                onClick,
                confirm,
                danger = false,
                disabled = false,
                icon,
              } = action;

              if (confirm) {
                return h(
                  Popconfirm,
                  {
                    title:
                      typeof confirm === 'string' ? confirm : confirm.title,
                    onConfirm: () => onClick?.(row, column),
                    disabled,
                  },
                  {
                    default: () =>
                      h(
                        Button,
                        {
                          size,
                          type,
                          danger,
                          disabled,
                          icon,
                          onClick: (e: Event) => e.stopPropagation(),
                        },
                        { default: () => text },
                      ),
                  },
                );
              }

              return h(
                Button,
                {
                  key: index,
                  size,
                  type,
                  danger,
                  disabled,
                  icon,
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    onClick?.(row, column);
                  },
                },
                { default: () => text },
              );
            }),
        },
      );
    },
  });

  // ========== CellMoney - 金额渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellMoney', props: { prefix: '¥', precision: 2 } }
   */
  vxeUI.renderer.add('CellMoney', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '--';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const {
        prefix = '¥',
        precision = 2,
        thousands = true,
        color,
      } = props || {};

      if (cellValue === null || cellValue === undefined) {
        return '--';
      }

      const numValue = Number(cellValue);
      if (Number.isNaN(numValue)) {
        return String(cellValue);
      }

      let formattedValue = numValue.toFixed(precision);

      if (thousands) {
        formattedValue = new Intl.NumberFormat('zh-CN', {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(numValue);
      }

      const content = `${prefix}${formattedValue}`;

      if (color) {
        return h('span', { style: { color } }, content);
      }

      return content;
    },
  });

  // ========== CellProgress - 进度条渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellProgress', props: { format: (percent) => `${percent}%` } }
   */
  vxeUI.renderer.add('CellProgress', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '--';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const {
        min = 0,
        max = 100,
        status,
        showInfo = true,
        format,
        strokeColor,
        trailColor,
      } = props || {};

      if (cellValue === null || cellValue === undefined) {
        return '--';
      }

      const numValue = Number(cellValue);
      if (Number.isNaN(numValue)) {
        return String(cellValue);
      }

      const percent = Math.min(
        100,
        Math.max(0, ((numValue - min) / (max - min)) * 100),
      );

      let statusType:
        | 'active'
        | 'exception'
        | 'normal'
        | 'success'
        | undefined = status;
      if (!statusType) {
        if (percent >= 100) {
          statusType = 'success';
        } else if (percent < 30) {
          statusType = 'exception';
        } else {
          statusType = 'normal';
        }
      }

      return h(Progress, {
        percent,
        status: statusType,
        showInfo,
        format: format || ((percent: number) => `${percent.toFixed(0)}%`),
        strokeColor,
        trailColor,
      });
    },
  });

  // ========== CellTooltip - 提示渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellTooltip', props: { title: '提示内容' } }
   */
  vxeUI.renderer.add('CellTooltip', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const { title, placement = 'top', maxWidth = 300 } = props || {};

      const tooltipTitle = title || cellValue;

      return h(
        Tooltip,
        {
          title: tooltipTitle,
          placement,
          overlayStyle: { maxWidth: `${maxWidth}px` },
        },
        {
          default: () =>
            h(
              'span',
              {
                class: 'cursor-pointer truncate block',
                style: { maxWidth: `${maxWidth}px` },
              },
              String(cellValue),
            ),
        },
      );
    },
  });
}
