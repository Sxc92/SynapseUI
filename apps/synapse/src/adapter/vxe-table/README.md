# VXE Table 配置中心使用文档

## 简介

本项目对 `vxe-table` 进行了完整的集成和封装，提供了配置中心模式，统一管理所有表格配置、自定义渲染器和格式化器。

## 快速开始

### 基础使用

```vue
<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  id: number;
  name: string;
  status: string;
}

const [Grid, gridApi] = useVbenVxeGrid<RowType>({
  gridOptions: {
    columns: [
      { field: 'id', title: 'ID', width: 80 },
      { field: 'name', title: '名称' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellStatus',
          props: {
            statusMap: {
              active: { text: '启用', status: 'success' },
              inactive: { text: '禁用', status: 'error' },
            },
          },
        },
      },
    ],
    data: [{ id: 1, name: '测试', status: 'active' }],
  },
});
</script>

<template>
  <Grid table-title="数据列表" />
</template>
```

## 自定义渲染器

### CellImage - 图片渲染器

```typescript
{
  field: 'avatar',
  title: '头像',
  cellRender: {
    name: 'CellImage',
    props: { width: 50, height: 50, preview: true }
  }
}
```

### CellLink - 链接渲染器

```typescript
{
  field: 'name',
  title: '名称',
  cellRender: {
    name: 'CellLink',
    props: {
      text: '查看详情',
      href: '/detail',
      onClick: (row) => console.log(row)
    }
  }
}
```

### CellTag - 标签渲染器

```typescript
{
  field: 'type',
  title: '类型',
  cellRender: {
    name: 'CellTag',
    props: {
      colorMap: {
        'A': 'success',
        'B': 'warning',
        'C': 'error'
      }
    }
  }
}
```

### CellStatus - 状态渲染器

```typescript
{
  field: 'status',
  title: '状态',
  cellRender: {
    name: 'CellStatus',
    props: {
      statusMap: {
        active: { text: '启用', status: 'success', badge: false },
        inactive: { text: '禁用', status: 'error' }
      },
      showDot: true  // 显示圆点
    }
  }
}
```

### CellActions - 操作按钮渲染器

```typescript
{
  title: '操作',
  cellRender: {
    name: 'CellActions',
    props: {
      actions: [
        {
          text: '编辑',
          onClick: (row) => handleEdit(row)
        },
        {
          text: '删除',
          danger: true,
          confirm: '确定删除吗？',
          onClick: (row) => handleDelete(row)
        }
      ]
    }
  }
}
```

### CellMoney - 金额渲染器

```typescript
{
  field: 'amount',
  title: '金额',
  cellRender: {
    name: 'CellMoney',
    props: {
      prefix: '¥',
      precision: 2,
      thousands: true,
      color: '#f5222d'  // 可选颜色
    }
  }
}
```

### CellProgress - 进度条渲染器

```typescript
{
  field: 'progress',
  title: '进度',
  cellRender: {
    name: 'CellProgress',
    props: {
      min: 0,
      max: 100,
      showInfo: true,
      format: (percent) => `${percent}%`
    }
  }
}
```

### CellTooltip - 提示渲染器

```typescript
{
  field: 'description',
  title: '描述',
  cellRender: {
    name: 'CellTooltip',
    props: {
      title: '这是提示内容',
      placement: 'top',
      maxWidth: 300
    }
  }
}
```

## 自定义格式化器

### 基础格式化器

```typescript
{
  field: 'date',
  title: '日期',
  formatter: 'formatDate'  // YYYY-MM-DD
}

{
  field: 'datetime',
  title: '日期时间',
  formatter: 'formatDateTime'  // YYYY-MM-DD HH:mm:ss
}

{
  field: 'amount',
  title: '金额',
  formatter: 'formatMoney'  // ¥1,234.56
}

{
  field: 'rate',
  title: '百分比',
  formatter: 'formatPercent'  // 85.50%
}

{
  field: 'size',
  title: '文件大小',
  formatter: 'formatFileSize'  // 1.5 MB
}

{
  field: 'phone',
  title: '手机号',
  formatter: 'formatPhone'  // 138 **** 8888
}

{
  field: 'bankCard',
  title: '银行卡',
  formatter: 'formatBankCard'  // 6222 **** **** 8888
}

{
  field: 'idCard',
  title: '身份证',
  formatter: 'formatIdCard'  // 110101********1234
}

{
  field: 'count',
  title: '数量',
  formatter: 'formatNumber'  // 1,234
}

{
  field: 'duration',
  title: '时长',
  formatter: 'formatDuration'  // 1:23:45
}
```

### 带参数的格式化器

```typescript
{
  field: 'amount',
  title: '金额',
  formatter: ({ cellValue }, { params }) => {
    return formatMoney(cellValue, {
      prefix: '$',
      precision: 2
    });
  }
}
```

## 远程数据加载

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    proxyConfig: {
      ajax: {
        query: async ({ page, sort, filters, form }) => {
          const response = await fetch('/api/data', {
            method: 'POST',
            body: JSON.stringify({
              page: page.currentPage,
              pageSize: page.pageSize,
              ...form,
            }),
          });
          return await response.json();
        },
      },
    },
    pagerConfig: { enabled: true },
  },
  formOptions: {
    schema: [{ component: 'Input', fieldName: 'keyword', label: '关键词' }],
  },
});
```

## API 参考

### useVbenVxeGrid

主要的表格组合式函数。

```typescript
const [Grid, gridApi] = useVbenVxeGrid<T>(options);
```

**参数：**

- `gridOptions`: 表格配置（继承 vxe-table 所有配置）
- `formOptions`: 表单配置（可选）
- `gridEvents`: 表格事件（可选）
- `tableTitle`: 表格标题（可选）
- `tableTitleHelp`: 标题帮助提示（可选）
- `showSearchForm`: 是否显示搜索表单（默认 true）
- `separator`: 搜索表单分隔条配置（可选）

**返回值：**

- `Grid`: Vue 组件
- `gridApi`: 表格 API 对象

### gridApi 方法

```typescript
// 查询数据
gridApi.query(params?: Record<string, any>);

// 重新加载数据（返回第一页）
gridApi.reload(params?: Record<string, any>);

// 设置表格配置
gridApi.setGridOptions(options: Partial<VxeGridProps['gridOptions']>);

// 设置加载状态
gridApi.setLoading(isLoading: boolean);

// 切换搜索表单显示
gridApi.toggleSearchForm(show?: boolean);

// 获取表格实例
gridApi.grid;  // VxeGridInstance

// 获取表单 API
gridApi.formApi;  // ExtendedFormApi
```

## 配置中心

所有默认配置位于 `config/grid-config.ts`，可通过修改该文件调整全局默认配置。

### 修改全局配置

```typescript
// apps/synapse/src/adapter/vxe-table.ts
import { defaultGridConfig } from './vxe-table/config';

// 修改配置
setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        ...defaultGridConfig,
        // 覆盖默认配置
        size: 'medium',
        border: true,
      },
    });
  },
});
```

## createGrid - 表格工厂函数

`createGrid` 是一个高级表格工厂函数，提供了开箱即用的表格配置，包括：
- 自动分页配置
- 表单自动搜索（blur 和 clear 事件）
- 状态开关和操作按钮的快速创建
- 树形结构支持
- 序列号自动计算

### 基础使用

```typescript
import { createGrid } from '#/adapter/vxe-table';

interface MenuData {
  id: number;
  name: string;
  status: boolean;
}

const { Grid, api, createStatusSwitch, createActionButtons } = createGrid<MenuData>({
  tableTitle: '菜单管理',
  formOptions: {
    schema: [
      { component: 'Input', fieldName: 'name', label: '名称' },
    ],
  },
  api: {
    getPage: getMenuPage,
    enable: enableMenu,
    remove: deleteMenu,
  },
  pageSize: 20,
  columns: ({ createStatusSwitch, createActionButtons }) => [
    { field: 'name', title: '名称' },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'VNode',
        props: {
          vnode: (params: any) => createStatusSwitch(params.row),
        },
      },
    },
    {
      title: '操作',
      cellRender: {
        name: 'VNode',
        props: {
          vnode: (params: any) => createActionButtons(params.row),
        },
      },
    },
  ],
});
```

### createStandardActions - 标准化操作按钮

`createStandardActions` 用于创建标准化的操作按钮配置，统一处理国际化、权限检查和消息提示。

```typescript
import { createStandardActions } from '#/adapter/vxe-table';

const actions = createStandardActions<MenuData>(
  [
    {
      textKey: 'common.view',
      accessCodes: ['menu:view'],
      onClick: (row) => drawerForm.openView(row),
      noPermissionKey: 'menu.noPermissionToView',
    },
    {
      textKey: 'common.delete',
      accessCodes: ['menu:delete'],
      danger: true,
      confirmKey: 'menu.deleteConfirm',
      onClick: async (row) => {
        const response = await deleteMenu(row.id);
        if (response.code === 200) {
          message.success($t('common.deleteSuccess'));
          gridApi.reload();
        }
      },
      noPermissionKey: 'menu.noPermissionToDelete',
    },
  ],
  {
    hasAccessByCodes,
    message,
    gridApi: () => gridApiRef.value,
    reload: () => gridApiRef.value.reload(),
  }
);

// 在列配置中使用
{
  title: '操作',
  cellRender: {
    name: 'CellActions',
    props: { actions },
  },
}
```

## 模块化架构

为了更好的代码组织和维护性，`grid.ts` 已被拆分为多个模块：

### 目录结构

```
vxe-table/
├── types/
│   └── grid.ts              # 类型定义（ApiMethods, GridOptions, GridInstance, StandardActionConfig）
├── utils/
│   ├── pager.ts             # 分页相关工具（createPagerIcons, createSeqConfig）
│   ├── actions.ts           # 操作按钮工具（createStandardActions）
│   ├── tree-config.ts       # 树形配置处理（normalizeTreeConfig）
│   ├── grid-helpers.ts      # 表格辅助函数（createStatusSwitchFactory, createActionButtonsFactory）
│   ├── form-search.ts       # 表单自动搜索逻辑（processFormOptions, createSetFieldValueAndSearch）
│   └── default-config.ts    # 默认配置生成（createDefaultGridProps）
├── config/                  # 配置中心
├── grid.ts                  # 主函数（整合所有模块）
└── README.md                # 使用文档
```

### 统一导出

所有功能都通过 `#/adapter/vxe-table` 统一导出，无需关心内部模块结构：

```typescript
import {
  // 核心 API
  useVbenVxeGrid,
  createGrid,
  createStandardActions,
  
  // 类型
  type GridOptions,
  type GridInstance,
  type StandardActionConfig,
  
  // 配置和工具
  defaultGridConfig,
  formatMoney,
  // ...
} from '#/adapter/vxe-table';
```

## 更多示例

参考项目中的示例文件：

- `playground/src/views/examples/vxe-table/` - 各种使用示例
- `apps/synapse/src/views/iam/menu/` - 菜单管理表格示例（使用 createGrid）
