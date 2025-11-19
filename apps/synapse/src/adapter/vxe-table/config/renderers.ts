import type { VxeUIExport } from 'vxe-table';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';

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

  // ========== CellStatusIcon - 图标状态渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellStatusIcon', props: { statusMap: { 'active': { icon: 'mdi:check-circle', color: '#52c41a', text: '启用' } }, onClick: (row, field, newValue) => {}, hasPermission: (row) => boolean | string } }
   * 支持点击切换状态：如果提供了 onClick 回调，则状态字段可点击切换
   * 可点击的状态会显示为标签样式，带有编辑图标提示
   * 权限控制：hasPermission 可以是函数 (row) => boolean 或字符串权限标识，返回 false 时禁用点击
   */
  vxeUI.renderer.add('CellStatusIcon', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const cellValue = row[column.field];
      const { statusMap, onClick, hasPermission } = props || {};

      // 权限检查函数
      const checkPermission = (): boolean => {
        if (!hasPermission) return true; // 未配置权限，默认允许
        if (typeof hasPermission === 'function') {
          return hasPermission(row);
        }
        if (typeof hasPermission === 'string') {
          // 如果是字符串，可以在这里集成权限检查逻辑
          // 例如：return useAccessStore().hasPermission(hasPermission);
          // 暂时返回 true，后续可以接入实际的权限系统
          return true;
        }
        return true;
      };

      const canClick = checkPermission();

      if (!statusMap || cellValue === null || cellValue === undefined) {
        return cellValue;
      }

      // 支持布尔值：将 true/false 转换为字符串键，也支持直接使用布尔值作为键
      const key =
        typeof cellValue === 'boolean' ? String(cellValue) : cellValue;
      const statusInfo = statusMap[key] || statusMap[cellValue];
      if (!statusInfo) {
        return cellValue;
      }

      const { icon, color, text } = statusInfo;

      if (!icon) {
        return text || cellValue;
      }

      // 可点击时使用标签样式，不可点击时使用简单样式
      if (typeof onClick === 'function') {
        // 有 onClick 但无权限时，显示为禁用状态
        if (!canClick) {
          return h(
            'div',
            {
              class: 'cell-status-disabled',
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'not-allowed',
                userSelect: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: `${color || '#f0f0f0'}10`,
                position: 'relative',
                fontWeight: 500,
                fontSize: '13px',
                opacity: 0.6,
                boxShadow: `inset 0 0 0 1px ${color || '#d9d9d9'}20`,
              },
              title: '无权限操作',
            },
            [
              h(IconifyIcon, {
                icon,
                style: {
                  color: color || '#999',
                  fontSize: '16px',
                  display: 'inline-block',
                  flexShrink: 0,
                },
              }),
              text
                ? h(
                    'span',
                    {
                      style: {
                        fontSize: '13px',
                        fontWeight: 500,
                        color: color || '#999',
                        verticalAlign: 'middle',
                      },
                    },
                    text,
                  )
                : null,
              // 禁用图标提示
              h(IconifyIcon, {
                icon: 'mdi:lock-outline',
                style: {
                  color: '#999',
                  fontSize: '12px',
                  display: 'inline-block',
                  flexShrink: 0,
                  marginLeft: '2px',
                  opacity: 0.7,
                },
              }),
            ],
          );
        }

        // 有权限，可点击
        return h(
          'div',
          {
            class: 'cell-status-clickable',
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              backgroundColor: `${color || '#f0f0f0'}15`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              fontWeight: 500,
              fontSize: '13px',
              // 使用 box-shadow 创建内阴影效果，避免与表格线重叠
              boxShadow: `inset 0 0 0 1px ${color || '#d9d9d9'}40`,
            },
            title: '点击切换状态',
            onMouseenter: (e: MouseEvent) => {
              const target = e.currentTarget as HTMLElement;
              const editIcon = target.querySelector(
                '.status-edit-icon',
              ) as HTMLElement;
              target.style.backgroundColor = `${color || '#1890ff'}25`;
              target.style.boxShadow = `
                inset 0 0 0 2px ${color || '#1890ff'},
                0 2px 8px ${color || '#1890ff'}30,
                inset -3px 0 0 ${color || '#1890ff'}
              `;
              target.style.transform = 'translateY(-1px)';
              if (editIcon) {
                editIcon.style.opacity = '1';
                editIcon.style.transform = 'scale(1.2)';
              }
            },
            onMouseleave: (e: MouseEvent) => {
              const target = e.currentTarget as HTMLElement;
              const editIcon = target.querySelector(
                '.status-edit-icon',
              ) as HTMLElement;
              target.style.backgroundColor = `${color || '#f0f0f0'}15`;
              target.style.boxShadow = `inset 0 0 0 1px ${color || '#d9d9d9'}40`;
              target.style.transform = 'translateY(0)';
              if (editIcon) {
                editIcon.style.opacity = '0.5';
                editIcon.style.transform = 'scale(1)';
              }
            },
            onMousedown: (e: MouseEvent) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateY(0px) scale(0.98)';
              target.style.boxShadow = `inset 0 0 0 2px ${color || '#1890ff'}, 0 1px 4px ${color || '#000'}20`;
            },
            onMouseup: (e: MouseEvent) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateY(-1px)';
              target.style.boxShadow = `
                inset 0 0 0 2px ${color || '#1890ff'},
                0 2px 8px ${color || '#1890ff'}30,
                inset -3px 0 0 ${color || '#1890ff'}
              `;
            },
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              // 再次检查权限（防止权限在渲染后发生变化）
              if (!checkPermission()) {
                // 可以在这里显示权限提示消息
                // message.warning('无权限执行此操作');
                return;
              }
              // 计算新值：如果是布尔值，取反；如果是字符串，切换为另一个值
              let newValue: any;
              if (typeof cellValue === 'boolean') {
                newValue = !cellValue;
              } else {
                // 查找 statusMap 中的另一个值
                const keys = Object.keys(statusMap);
                const currentIndex = keys.indexOf(key);
                const nextIndex = (currentIndex + 1) % keys.length;
                newValue = keys[nextIndex];
              }
              onClick?.(row, column.field, newValue);
            },
          },
          [
            h(IconifyIcon, {
              icon,
              style: {
                color: color || '#666',
                fontSize: '16px',
                display: 'inline-block',
                flexShrink: 0,
                fontWeight: 'bold',
              },
            }),
            text
              ? h(
                  'span',
                  {
                    style: {
                      fontSize: '13px',
                      fontWeight: 600,
                      color: color || '#666',
                      verticalAlign: 'middle',
                      letterSpacing: '0.3px',
                    },
                  },
                  text,
                )
              : null,
            // 添加切换提示图标，悬停时更明显
            h(IconifyIcon, {
              icon: 'mdi:pencil-outline',
              class: 'status-edit-icon',
              style: {
                color: color || '#999',
                fontSize: '12px',
                display: 'inline-block',
                flexShrink: 0,
                opacity: 0.5,
                marginLeft: '2px',
                transition: 'all 0.2s',
              },
            }),
          ],
        );
      } else {
        // 不可点击时使用简单样式
        return h(
          'div',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            },
          },
          [
            h(IconifyIcon, {
              icon,
              style: {
                color: color || '#666',
                fontSize: '16px',
                display: 'inline-block',
                verticalAlign: 'middle',
              },
            }),
            text
              ? h(
                  'span',
                  {
                    style: { verticalAlign: 'middle' },
                  },
                  text,
                )
              : null,
          ],
        );
      }
    },
  });
}
