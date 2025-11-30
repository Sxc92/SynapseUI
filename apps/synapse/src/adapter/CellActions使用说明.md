# CellActions 渲染器使用说明

## 概述

`CellActions` 是一个自定义的 vxe-table 单元格渲染器，用于在表格的操作列中显示操作按钮（查看、编辑、删除等）。

支持两种显示模式：
- **按钮模式（buttons）**：默认模式，操作按钮横向排列
- **下拉菜单模式（dropdown）**：操作项以下拉菜单形式展示，节省空间，适合操作项较多或列宽受限的场景

## 使用方式

### 方式一：使用 `createStandardActions`（推荐）

这是推荐的方式，可以自动处理国际化、权限检查和消息提示。

#### 1. 创建操作按钮配置函数

```typescript
import { createStandardActions } from '#/adapter/vxe-table/grid';
import { message } from 'ant-design-vue';
import { $t } from '#/locales';

function createSystemActions(
  drawerForm: DrawerFormInstance,
  gridApiRef: Ref<any>,
  reloadRef: Ref<(() => void) | null>,
  hasAccessByCodes: (codes: string[]) => boolean,
) {
  return createStandardActions<SystemData>(
    [
      {
        textKey: 'common.view',           // 国际化 key
        accessCodes: ['system:view'],    // 权限码数组
        onClick: (row: SystemData) => {
          drawerForm.openView(row);
        },
        noPermissionKey: 'system.noPermissionToView', // 无权限时的提示 key
      },
      {
        textKey: 'common.edit',
        accessCodes: ['system:edit'],
        onClick: (row: SystemData) => {
          drawerForm.openEdit(row);
        },
        noPermissionKey: 'system.noPermissionToEdit',
      },
      {
        textKey: 'common.delete',
        accessCodes: ['system:delete'],
        danger: true,                    // 危险操作（红色按钮）
        confirmKey: 'system.deleteConfirm', // 删除确认提示的国际化 key
        onClick: async (row: SystemData) => {
          try {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(true);
            }
            const response = await deleteSystem(row.id);
            if (response.code === 200 || response.code === 'SUCCESS') {
              message.success($t('common.deleteSuccess'));
              if (reloadRef.value) {
                reloadRef.value();
              }
            } else {
              message.error(response.msg || $t('common.deleteFailed'));
            }
          } catch (error) {
            message.error($t('common.deleteFailed'));
            console.error(error);
          } finally {
            if (gridApiRef.value) {
              gridApiRef.value.setLoading(false);
            }
          }
        },
        noPermissionKey: 'system.noPermissionToDelete',
      },
    ],
    {
      hasAccessByCodes,                  // 权限检查函数
      message,                            // 消息提示对象
      gridApi: () => gridApiRef.value,    // 表格 API（用于设置加载状态）
      reload: () => reloadRef.value || undefined, // 刷新函数
    },
  );
}
```

#### 2. 在列配置中使用

**按钮模式（默认）：**

```typescript
import { createColumns } from './columns';

export function useSystemTable() {
  const { hasAccessByCodes } = useAccess();
  const reloadRef = ref<(() => void) | null>(null);
  const gridApiRef = ref<any>(null);
  
  // ... 其他代码 ...
  
  const result = createGrid<SystemData>({
    // ... 其他配置 ...
    columns: () => [
      // ... 其他列 ...
      {
        field: '_actions',
        title: $t('common.actions'),
        width: 250,
        fixed: 'right',
        cellRender: {
          name: 'CellActions',
          props: {
            actions: createSystemActions(
              drawerForm,
              gridApiRef,
              reloadRef,
              hasAccessByCodes,
            ),
          },
        },
      },
    ],
  });
}
```

**下拉菜单模式：**

```typescript
{
  field: '_actions',
  title: $t('common.actions'),
  fixed: 'right',
  width: 60,              // 下拉模式可以设置更小的列宽
  minWidth: 60,
  resizable: false,
  cellRender: {
    name: 'CellActions',
    props: {
      mode: 'dropdown',                    // 使用下拉菜单模式
      dropdownText: $t('common.actions'),  // 触发按钮的文本（可选）
      dropdownIcon: 'mdi:chevron-down',    // 触发按钮的图标（可选，默认为 'mdi:chevron-down'）
      dropdownWidth: 120,                  // 下拉菜单的宽度（可选，支持数字（px）或字符串，默认 140px）
      actions: createSystemActions(
        drawerForm,
        gridApiRef,
        reloadRef,
        hasAccessByCodes,
      ),
    },
  },
}
```

### 方式二：直接传入自定义 actions（不推荐）

如果不需要权限检查等功能，也可以直接传入自定义配置：

**按钮模式：**

```typescript
{
  field: '_actions',
  title: $t('common.actions'),
  fixed: 'right',
  cellRender: {
    name: 'CellActions',
    props: {
      type: 'text',        // 按钮样式：'default' | 'text' | 'link' | 'primary' | 'dashed'
      size: 'middle',       // 按钮大小：'small' | 'middle' | 'large'，默认为 'middle'
      actions: [
        {
          text: '查看',     // 按钮文本
          icon: 'mdi:eye-outline', // 图标（可选）
          onClick: (row) => {
            // 处理查看逻辑
          },
        },
        {
          text: '编辑',
          icon: 'mdi:pencil-outline',
          type: 'primary', // 按钮类型
          onClick: (row) => {
            // 处理编辑逻辑
          },
        },
        {
          text: '删除',
          icon: 'mdi:delete-outline',
          danger: true,    // 危险操作
          confirm: '确定要删除吗？', // 确认提示
          onClick: async (row) => {
            // 处理删除逻辑
          },
        },
      ],
    },
  },
}
```

**下拉菜单模式：**

```typescript
{
  field: '_actions',
  title: $t('common.actions'),
  fixed: 'right',
  width: 60,
  cellRender: {
    name: 'CellActions',
    props: {
      mode: 'dropdown',                    // 下拉菜单模式
      dropdownText: $t('common.actions'),  // 触发按钮文本（可选，不设置则只显示图标）
      dropdownIcon: 'mdi:chevron-down',    // 触发按钮图标（可选）
      dropdownWidth: 140,                  // 下拉菜单宽度（可选）
      actions: [
        {
          text: '查看',
          icon: 'mdi:eye-outline',
          onClick: (row) => {
            // 处理查看逻辑
          },
        },
        {
          text: '编辑',
          icon: 'mdi:pencil-outline',
          onClick: (row) => {
            // 处理编辑逻辑
          },
        },
        {
          text: '删除',
          icon: 'mdi:delete-outline',
          danger: true,                     // 危险操作会显示为红色
          disabled: true,                   // 禁用项会显示为灰色加粗字体
          confirm: '确定要删除吗？',
          onClick: async (row) => {
            // 处理删除逻辑
          },
        },
      ],
    },
  },
}
```

## 完整示例（参考 system/systemTable.ts）

```typescript
// systemTable.ts
import { createStandardActions } from '#/adapter/vxe-table/grid';

export function useSystemTable() {
  const reloadRef = ref<(() => void) | null>(null);
  const gridApiRef = ref<any>(null);
  const { hasAccessByCodes } = useAccess();

  // 创建操作按钮配置
  function createSystemActions() {
    return createStandardActions<SystemData>(
      [
        {
          textKey: 'common.view',
          accessCodes: ['system:view'],
          onClick: (row: SystemData) => {
            drawerForm.openView(row);
          },
          noPermissionKey: 'system.noPermissionToView',
        },
        {
          textKey: 'common.edit',
          accessCodes: ['system:edit'],
          onClick: (row: SystemData) => {
            drawerForm.openEdit(row);
          },
          noPermissionKey: 'system.noPermissionToEdit',
        },
        {
          textKey: 'common.delete',
          accessCodes: ['system:delete'],
          danger: true,
          confirmKey: 'system.deleteConfirm',
          onClick: async (row: SystemData) => {
            try {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(true);
              }
              const response = await deleteSystem(row.id);
              if (response.code === 200 || response.code === 'SUCCESS') {
                message.success($t('common.deleteSuccess'));
                if (reloadRef.value) {
                  reloadRef.value();
                }
              } else {
                message.error(response.msg || $t('common.deleteFailed'));
              }
            } catch (error) {
              message.error($t('common.deleteFailed'));
              console.error(error);
            } finally {
              if (gridApiRef.value) {
                gridApiRef.value.setLoading(false);
              }
            }
          },
          noPermissionKey: 'system.noPermissionToDelete',
        },
      ],
      {
        hasAccessByCodes,
        message,
        gridApi: () => gridApiRef.value,
        reload: () => reloadRef.value || undefined,
      },
    );
  }

  // 在列配置中使用
  const result = createGrid<SystemData>({
    // ... 其他配置 ...
    columns: () => [
      // ... 其他列 ...
      {
        field: '_actions',
        title: $t('common.actions'),
        width: 250,
        fixed: 'right',
        cellRender: {
          name: 'CellActions',
          props: {
            actions: createSystemActions(),
          },
        },
      },
    ],
  });
}
```

## 配置选项说明

### StandardActionConfig（createStandardActions 的配置）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `textKey` | `string` | 是 | 按钮文本的国际化 key |
| `accessCodes` | `string[]` | 否 | 权限码数组，空数组或空字符串表示不需要权限检查 |
| `onClick` | `(row: T) => void` | 是 | 点击事件处理函数 |
| `icon` | `string` | 否 | 图标名称（如 'mdi:eye-outline'） |
| `danger` | `boolean` | 否 | 是否为危险操作（默认 false） |
| `type` | `'dashed' \| 'default' \| 'link' \| 'primary' \| 'text'` | 否 | 按钮类型 |
| `confirmKey` | `string` | 否 | 确认提示的国际化 key（用于删除等操作） |
| `noPermissionKey` | `string` | 否 | 无权限时的提示国际化 key |
| `disabled` | `boolean` | 否 | 是否禁用（默认 false） |

### CellActions Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `actions` | `ActionConfig[]` | `[]` | 操作按钮配置数组 |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | 按钮大小（仅在按钮模式下有效） |
| `type` | `'dashed' \| 'default' \| 'link' \| 'primary' \| 'text'` | `'default'` | 按钮样式类型（仅在按钮模式下有效） |
| `mode` | `'buttons' \| 'dropdown'` | `'buttons'` | 显示模式：`'buttons'` 按钮模式（默认），`'dropdown'` 下拉菜单模式 |
| `dropdownText` | `string` | `$t('common.actions')` | 下拉菜单触发按钮的文本（仅在 `mode='dropdown'` 时有效，不设置则只显示图标） |
| `dropdownIcon` | `string` | `'mdi:chevron-down'` | 下拉菜单触发按钮的图标（仅在 `mode='dropdown'` 时有效） |
| `dropdownWidth` | `number \| string` | `140` | 下拉菜单的宽度（仅在 `mode='dropdown'` 时有效），支持数字（单位 px）或字符串（如 `'140px'`, `'auto'`） |

### ActionConfig（单个操作项配置）

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 操作项文本 |
| `icon` | `string \| VNode` | 否 | 图标名称（如 'mdi:eye-outline'）或 VNode |
| `onClick` | `(row: any, column?: any) => void` | 是 | 点击事件处理函数 |
| `danger` | `boolean` | 否 | 是否为危险操作（默认 false，下拉模式下显示为红色） |
| `disabled` | `boolean` | 否 | 是否禁用（默认 false，禁用项会显示为灰色加粗字体） |
| `confirm` | `string \| { title: string; okText?: string; cancelText?: string }` | 否 | 确认提示（字符串或配置对象，用于删除等危险操作） |

## 下拉菜单模式特性

1. **节省空间**：下拉菜单模式适合操作项较多或列宽受限的场景，可以将操作列宽度设置为 60px 左右
2. **样式统一**：
   - 触发按钮使用加粗字体，与禁用项样式保持一致
   - 禁用项显示为灰色加粗字体，提高可读性
   - 危险操作（`danger: true`）显示为红色
3. **确认对话框**：需要确认的操作（如删除）会使用 `Modal.confirm` 显示确认对话框
4. **图标支持**：支持自定义触发按钮图标，默认为 `'mdi:chevron-down'`
5. **宽度控制**：可以通过 `dropdownWidth` 控制下拉菜单的宽度，支持数字（px）或字符串（如 `'auto'`）

## 完整示例：下拉菜单模式

```typescript
// menu/columns.ts
export function createColumns(
  drawerForm: DrawerFormInstance,
  gridApiRef: ReturnType<typeof ref<any>>,
  reloadRef: ReturnType<typeof ref<(() => void) | null>>,
  hasAccessByCodes: PermissionChecker,
) {
  return [
    // ... 其他列 ...
    {
      field: '_actions',
      title: $t('common.actions'),
      fixed: 'right',
      width: 60,
      minWidth: 60,
      resizable: false,
      cellRender: {
        name: 'CellActions',
        props: {
          mode: 'dropdown',
          dropdownText: $t('common.actions'),  // 可选：不设置则只显示图标
          dropdownIcon: 'mdi:chevron-down',    // 可选：默认图标
          dropdownWidth: 120,                  // 可选：下拉菜单宽度
          actions: createMenuActions(
            drawerForm,
            gridApiRef,
            reloadRef,
            hasAccessByCodes,
          ),
        },
      },
    },
  ];
}
```

## 注意事项

1. **权限检查**：如果 `accessCodes` 为空数组或包含空字符串，则不会进行权限检查
2. **国际化**：使用 `createStandardActions` 时，所有文本都会自动进行国际化处理
3. **加载状态**：删除等异步操作需要在 `onClick` 内部手动处理加载状态
4. **刷新表格**：操作成功后需要手动调用 `reload()` 刷新表格
5. **确认提示**：删除等危险操作建议设置 `confirmKey` 或 `confirm` 属性
6. **下拉菜单模式**：
   - 禁用项会自动显示为灰色加粗字体，提高可读性
   - 触发按钮使用加粗字体，保持样式统一
   - 建议在列宽受限时使用下拉菜单模式，可以设置较小的列宽（如 60px）
7. **样式覆盖**：如果需要自定义样式，可以通过全局 CSS 类名进行覆盖：
   - `.cell-actions-dropdown-trigger`：下拉触发按钮
   - `.dropdown-menu-item`：下拉菜单项
   - `.dropdown-menu-item-disabled`：禁用的下拉菜单项

## 参考文件

- 实现：`apps/synapse/src/adapter/vxe-table/config/renderers.ts`（CellActions 渲染器实现）
- 工具函数：`apps/synapse/src/adapter/vxe-table/utils/actions.ts`（createStandardActions 函数）
- 按钮模式示例：`apps/synapse/src/views/iam/system/systemTable.ts`
- 下拉菜单模式示例：`apps/synapse/src/views/iam/menu/columns.ts`、`apps/synapse/src/views/iam/role/columns.ts`
- 样式定义：`packages/styles/src/antd/index.css`（禁用项和下拉按钮的全局样式）

