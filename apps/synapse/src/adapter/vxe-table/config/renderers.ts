import type { VxeUIExport } from 'vxe-table';

import { h, reactive } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Badge,
  Button,
  Dropdown,
  Image,
  Modal,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import type { CustomActionConfig } from '../types';

import { isBuiltInAction } from '../types';

// 用于存储每个单元格的下拉菜单显示状态
// 使用 Map 配合 reactive 来创建响应式状态
const dropdownVisibleMap = reactive(new Map<string, boolean>());

// 生成唯一键
function getDropdownKey(row: any, column: any): string {
  const rowId = row?.id ?? row?.code ?? JSON.stringify(row);
  const colField = column?.field ?? column?.property ?? '';
  return `${rowId}_${colField}_dropdown`;
}

/**
 * 注册所有自定义渲染器
 */
export function registerRenderers(vxeUI: VxeUIExport) {
  // ========== CellTreeSeq - 树形序列号渲染器 ==========
  /**
   * 使用方式: cellRender: { name: 'CellTreeSeq' }
   * 根据树形结构显示层级序号（如 1, 1.1, 1.2, 2, 2.1 等）
   */
  vxeUI.renderer.add('CellTreeSeq', {
    renderTableDefault(_renderOpts: any, params?: any) {
      if (!params) return '';
      const { row, rowIndex, $table } = params;
      
      // 获取表格的完整数据（包含树形结构）
      // vxe-table 的树形数据在 fullData 中，已经是扁平化的
      let tableData: any[] = [];
      if ($table) {
        try {
          const tableDataObj = $table.getTableData?.();
          if (tableDataObj) {
            // fullData 包含所有数据（包括树形展开后的扁平数据）
            tableData = tableDataObj.fullData || tableDataObj.tableData || [];
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('获取表格数据失败:', e);
        }
      }
      
      // 如果获取不到数据，使用降级方案
      if (!Array.isArray(tableData) || tableData.length === 0) {
        // 降级方案：返回简单的序号
        return h('span', { style: { fontWeight: 500 } }, String(rowIndex + 1));
      }
      
      // 计算树形层级的序号（如 1, 1.1, 1.2, 2, 2.1 等）
      const calculateTreeSeq = (
        currentRow: any,
        currentIndex: number,
        allRows: any[],
      ): string => {
        // 如果是顶级节点（没有 parentId 或 parentId 为 null）
        if (!currentRow?.parentId) {
          // 计算是第几个顶级节点
          let topLevelIndex = 0;
          for (let i = 0; i < currentIndex; i++) {
            const r = allRows[i];
            if (r && !r.parentId) {
              topLevelIndex++;
            }
          }
          return String(topLevelIndex + 1);
        }
        
        // 如果是子节点，找到父节点
        const parentIndex = allRows.findIndex((r) => r && r.id === currentRow.parentId);
        if (parentIndex >= 0 && allRows[parentIndex]) {
          const parentSeq = calculateTreeSeq(
            allRows[parentIndex],
            parentIndex,
            allRows,
          );
          
          // 计算在同级兄弟节点中的位置
          let siblingIndex = 0;
          for (let i = parentIndex + 1; i < currentIndex; i++) {
            const sibling = allRows[i];
            if (sibling && sibling.parentId === currentRow.parentId) {
              siblingIndex++;
            }
          }
          return `${parentSeq}.${siblingIndex + 1}`;
        }
        
        // 如果找不到父节点，返回简单序号
        return String(currentIndex + 1);
      };
      
      try {
        const seqText = calculateTreeSeq(row, rowIndex, tableData);
        // 返回 VNode
        return h('span', { style: { fontWeight: 500, textAlign: 'center', display: 'inline-block', width: '100%' } }, seqText);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('计算树形序号失败:', e, { row, rowIndex, tableDataLength: tableData.length });
        // 降级方案：返回简单的序号
        return h('span', { style: { fontWeight: 500 } }, String(rowIndex + 1));
      }
    },
  });
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
   * 使用方式:
   * 1. 自定义按钮: cellRender: { name: 'CellActions', props: { actions: [{ text: '编辑', onClick: () => {} }] } }
   * 2. 内置按钮: cellRender: { name: 'CellActions', props: { actions: [{ action: 'view', accessCodes: ['role:view'] }], handlers: { onView, hasAccessByCodes, message } } }
   * 3. 下拉菜单模式: cellRender: { name: 'CellActions', props: { mode: 'dropdown', actions: [...] } }
   */
  vxeUI.renderer.add('CellActions', {
    renderTableDefault(renderOpts: any, params?: any) {
      if (!params) return '';
      const { props } = renderOpts;
      const { row, column } = params;
      const {
        actions = [],
        size = 'small',
        type = 'default', // 默认使用按钮样式，而不是文本样式
        handlers = {},
        mode = 'buttons', // 默认按钮模式
        dropdownText,
        dropdownIcon = 'mdi:chevron-down',
        dropdownWidth = 140, // 默认宽度 140px
      } = props || {};

      // 如果没有提供 dropdownText，使用国际化的默认值
      const finalDropdownText = dropdownText || $t('common.actions');

      // 处理下拉菜单宽度：支持数字（px）或字符串
      const finalDropdownWidth = typeof dropdownWidth === 'number'
        ? `${dropdownWidth}px`
        : dropdownWidth;

      if (!actions || actions.length === 0) {
        return '';
      }

      // 内置按钮配置映射
      const builtInButtonConfig: Record<
        string,
        { text: string; icon: string; danger?: boolean; type?: 'dashed' | 'default' | 'link' | 'primary' | 'text' }
      > = {
        view: {
          text: '查看',
          icon: 'mdi:eye-outline',
          type: 'primary', // 按钮样式
        },
        edit: {
          text: '编辑',
          icon: 'mdi:pencil-outline',
          type: 'primary', // 按钮样式
        },
        delete: {
          text: '删除',
          icon: 'mdi:delete-outline',
          danger: true,
          type: 'primary', // 按钮样式
        },
      };

      // 将内置按钮配置转换为标准按钮配置
      const normalizedActions = actions.map((action: any) => {
        // 如果是内置按钮，转换为标准配置
        if (isBuiltInAction(action)) {
          const config = builtInButtonConfig[action.action];
          if (!config) {
            console.warn(`未知的内置按钮类型: ${action.action}`);
            return null;
          }

          const {
            onView,
            onEdit,
            onDelete,
            hasAccessByCodes,
            message: msg,
            gridApi,
            reload,
          } = handlers;

          const accessCodes = action.accessCodes || [];
          // 检查是否需要权限验证：如果 accessCodes 为空或包含空字符串，则不需要验证权限
          const needsPermissionCheck =
            accessCodes.length > 0 &&
            accessCodes.some((code: string) => code && code.trim() !== '');
          const hasPermission = needsPermissionCheck
            ? hasAccessByCodes?.(accessCodes) ?? true
            : true;
          const disabled = needsPermissionCheck ? !hasPermission : false;

          let onClick: ((row: any) => void) | undefined;
          let confirm: string | { cancelText?: string; okText?: string; title: string } | undefined;

          switch (action.action) {
            case 'view':
              onClick = (row: any) => {
                if (needsPermissionCheck && !hasAccessByCodes?.(accessCodes)) {
                  msg?.warning('无权限查看详情');
                  return;
                }
                onView?.(row);
              };
              break;
            case 'edit':
              onClick = (row: any) => {
                if (needsPermissionCheck && !hasAccessByCodes?.(accessCodes)) {
                  msg?.warning('无权限编辑');
                  return;
                }
                onEdit?.(row);
              };
              break;
            case 'delete':
              confirm =
                action.confirm ||
                '确定要删除该记录吗？删除后无法恢复。';
              onClick = async (row: any) => {
                if (needsPermissionCheck && !hasAccessByCodes?.(accessCodes)) {
                  msg?.warning('无权限删除');
                  return;
                }
                try {
                  // 获取最新的 gridApi（可能是 getter）
                  const currentGridApi =
                    typeof gridApi === 'function' ? gridApi() : gridApi;
                  currentGridApi?.setLoading(true);
                  const response = await onDelete?.(row);
                  if (response?.code === 200 || response?.code === 'SUCCESS') {
                    msg?.success('删除成功');
                    // 获取最新的 reload（可能是 getter）
                    const currentReload =
                      typeof reload === 'function' ? reload() : reload;
                    currentReload?.();
                  } else {
                    msg?.error(response?.msg || '删除失败');
                  }
                } catch (error) {
                  msg?.error('删除失败');
                  console.error(error);
                } finally {
                  const currentGridApi =
                    typeof gridApi === 'function' ? gridApi() : gridApi;
                  currentGridApi?.setLoading(false);
                }
              };
              break;
          }

          return {
            text: config.text,
            icon: config.icon,
            danger: config.danger,
            type: config.type || type, // 使用配置中的 type，如果没有则使用 props 的 type
            disabled,
            confirm,
            onClick,
          };
        }

        // 自定义按钮：统一处理权限检查
        const customAction = action as CustomActionConfig;
        const {
          text: textValue,
          icon,
          accessCodes = [],
          onClick: originalOnClick,
          confirm: originalConfirm,
          danger = false,
          disabled: customDisabled = false,
          type: customType,
          noPermissionMessage: noPermissionMessageValue,
        } = customAction;

        const {
          hasAccessByCodes,
          message: msg,
        } = handlers;

        // 处理 text：支持字符串或函数（用于国际化）
        const text = typeof textValue === 'function' ? textValue() : textValue;

        // 处理 noPermissionMessage：支持字符串或函数（用于国际化）
        const noPermissionMessage = typeof noPermissionMessageValue === 'function'
          ? noPermissionMessageValue()
          : noPermissionMessageValue;

        // 检查是否需要权限验证：如果 accessCodes 为空或包含空字符串，则不需要验证权限
        const needsPermissionCheck =
          accessCodes.length > 0 &&
          accessCodes.some((code: string) => code && code.trim() !== '');
        const hasPermission = needsPermissionCheck
          ? hasAccessByCodes?.(accessCodes) ?? true
          : true;
        
        // 禁用状态：权限检查 + 自定义禁用条件
        const disabled = (needsPermissionCheck ? !hasPermission : false) || customDisabled;

        // 包装 onClick，自动添加权限检查
        let onClick: ((row: any, column: any) => void) | undefined;
        if (originalOnClick) {
          onClick = (row: any, column: any) => {
            // 如果提供了 accessCodes，先检查权限
            if (needsPermissionCheck && !hasAccessByCodes?.(accessCodes)) {
              msg?.warning(
                noPermissionMessage || '无权限执行此操作',
              );
              return;
            }
            // 执行原始的 onClick
            originalOnClick(row, column);
          };
        }

        return {
          text,
          icon,
          danger,
          type: customType || type, // 使用自定义 type 或 props 的 type
          disabled,
          confirm: originalConfirm,
          onClick,
        };
      }).filter(Boolean); // 过滤掉 null 值

      // 下拉菜单模式
      if (mode === 'dropdown') {
        // 使用响应式 Map 存储每个单元格的下拉菜单显示状态
        const dropdownKey = getDropdownKey(row, column);
        if (!dropdownVisibleMap.has(dropdownKey)) {
          dropdownVisibleMap.set(dropdownKey, false);
        }
        
        const menuItems = normalizedActions.map((action: any, index: number) => {
          const {
            text,
            onClick,
            confirm,
            danger = false,
            disabled = false,
            icon,
          } = action;

          // 处理图标：如果是字符串（iconify 格式），转换为 IconifyIcon 组件
          const iconComponent =
            typeof icon === 'string' ? h(IconifyIcon, { icon }) : icon;

          // 处理点击事件
          const handleClick = (e: Event) => {
            e.stopPropagation();
            if (disabled) return;
            
            // 关闭下拉菜单
            dropdownVisibleMap.set(dropdownKey, false);
            
            if (confirm) {
              // 对于需要确认的操作，使用 Modal.confirm
              const confirmTitle = typeof confirm === 'string' ? confirm : confirm.title;
              Modal.confirm({
                title: confirmTitle,
                okText: typeof confirm === 'object' && confirm.okText ? confirm.okText : '确定',
                cancelText: typeof confirm === 'object' && confirm.cancelText ? confirm.cancelText : '取消',
                onOk: () => {
                  onClick?.(row, column);
                },
              });
            } else {
              onClick?.(row, column);
            }
          };

          return h(
            'div',
            {
              key: index,
              class: disabled ? 'dropdown-menu-item dropdown-menu-item-disabled' : 'dropdown-menu-item',
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? 'rgba(0, 0, 0, 0.25)' : danger ? '#ff4d4f' : 'rgba(0, 0, 0, 0.85)',
                fontSize: '14px',
                lineHeight: '22px',
                fontWeight: disabled ? '700' : 'normal', // 禁用项加粗
                transition: 'background-color 0.2s',
                borderBottom: index < normalizedActions.length - 1 ? '1px solid #f0f0f0' : 'none',
              },
              onMouseenter: (e: MouseEvent) => {
                if (!disabled) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                }
              },
              onMouseleave: (e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              },
              onClick: handleClick,
            },
            [
              iconComponent ? h('span', {
                style: {
                  marginRight: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '16px',
                  color: disabled ? 'rgba(0, 0, 0, 0.25)' : danger ? '#ff4d4f' : 'rgba(0, 0, 0, 0.65)',
                  fontWeight: disabled ? '700' : 'normal', // 禁用项图标也加粗
                },
              }, [iconComponent]) : null,
              h('span', { 
                style: { 
                  flex: 1,
                  fontWeight: disabled ? '700' : 'normal', // 禁用项文字加粗
                } 
              }, text),
            ],
          );
        });

        // 使用 div 容器包装菜单项，设置下拉菜单样式
        const menuContent = h(
          'div',
          {
            style: {
              width: finalDropdownWidth === 'auto' ? 'auto' : finalDropdownWidth,
              minWidth: finalDropdownWidth === 'auto' ? '120px' : undefined,
              maxWidth: finalDropdownWidth === 'auto' ? undefined : finalDropdownWidth,
              padding: '4px 0',
              backgroundColor: '#fff',
              borderRadius: '6px',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            },
          },
          menuItems,
        );

        const triggerIcon = typeof dropdownIcon === 'string'
          ? h(IconifyIcon, { icon: dropdownIcon })
          : dropdownIcon;

        return h(
          Dropdown,
          {
            trigger: ['click'],
            placement: 'bottomRight',
            open: dropdownVisibleMap.get(dropdownKey) || false,
            onOpenChange: (open: boolean) => {
              dropdownVisibleMap.set(dropdownKey, open);
            },
          },
          {
            default: () => h(
              Button,
              {
                size: 'small',
                type: 'text',
                icon: triggerIcon,
                class: 'cell-actions-dropdown-trigger',
                style: {
                  padding: '4px 8px',
                  height: '28px',
                  fontSize: '14px',
                  fontWeight: '700', // 加粗字体
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: '20px',
                },
              },
              {
                default: () => finalDropdownText,
              },
            ),
            overlay: () => menuContent,
          },
        );
      }

      // 按钮模式（原有逻辑）
      return h(
        Space,
        { size: [4, 0], wrap: false },
        {
          default: () =>
            normalizedActions.map((action: any, index: number) => {
              const {
                text,
                onClick,
                confirm,
                danger = false,
                disabled = false,
                icon,
                type: actionType, // 支持从 action 中读取 type
              } = action;

              // 如果 action 有 type，使用 action 的 type，否则使用 props 的 type
              const buttonType = actionType ?? type;

              // 处理图标：如果是字符串（iconify 格式），转换为 IconifyIcon 组件
              const iconComponent =
                typeof icon === 'string' ? h(IconifyIcon, { icon }) : icon;

              // 创建按钮组件
              const button = h(
                Button,
                {
                  key: index,
                  size,
                  type: buttonType,
                  danger,
                  disabled,
                  icon: iconComponent,
                  class: 'action-button', // 添加自定义类名用于样式定制
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    if (!confirm) {
                      onClick?.(row, column);
                    }
                  },
                },
                { default: () => text },
              );

              // 使用 Tooltip 包装按钮，提供更好的用户体验
              const buttonWithTooltip = h(
                Tooltip,
                {
                  title: text,
                  placement: 'top',
                },
                {
                  default: () => button,
                },
              );

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
                    default: () => button,
                  },
                );
              }

              return buttonWithTooltip;
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

