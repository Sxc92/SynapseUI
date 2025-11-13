# @vben-core 核心包文档

## 📋 目录

- [概述](#概述)
- [包结构](#包结构)
- [基础包 (Base)](#基础包-base)
  - [@vben-core/shared](#vben-coreshared)
  - [@vben-core/typings](#vben-coretypings)
  - [@vben-core/icons](#vben-coreicons)
  - [@vben-core/design](#vben-coredesign)
- [UI 组件库 (UI Kit)](#ui-组件库-ui-kit)
  - [@vben-core/shadcn-ui](#vben-coreshadcn-ui)
  - [@vben-core/form-ui](#vben-coreform-ui)
  - [@vben-core/layout-ui](#vben-corelayout-ui)
  - [@vben-core/menu-ui](#vben-coremenu-ui)
  - [@vben-core/popup-ui](#vben-corepopup-ui)
  - [@vben-core/tabs-ui](#vben-coretabs-ui)
- [组合式函数 (Composables)](#组合式函数-composables)
- [偏好设置 (Preferences)](#偏好设置-preferences)
- [依赖关系图](#依赖关系图)
- [使用指南](#使用指南)

---

## 概述

`@vben-core` 是框架的核心包集合，提供系统的基础 SDK 和 UI 组件库。这些包是框架的底层基础，不包含任何业务逻辑，可以独立发布到 npm。

### ⚠️ 重要提示

- **请勿将业务逻辑放在此目录**
- 这些包是框架基础，后续可能会迁移或发布到 npm
- 所有包都应该保持通用性和可复用性

---

## 包结构

```
packages/@core/
├── base/              # 基础设施包
│   ├── shared/        # 共享工具和工具函数
│   ├── typings/       # TypeScript 类型定义
│   ├── icons/         # 图标系统
│   └── design/        # 设计系统和样式
├── ui-kit/            # UI 组件库
│   ├── shadcn-ui/     # 基础 UI 组件（基于 shadcn）
│   ├── form-ui/       # 表单组件
│   ├── layout-ui/     # 布局组件
│   ├── menu-ui/       # 菜单组件
│   ├── popup-ui/      # 弹窗组件（Modal、Drawer、Alert）
│   └── tabs-ui/       # 标签页组件
├── composables/       # Vue 组合式函数
└── preferences/       # 偏好设置系统
```

---

## 基础包 (Base)

### @vben-core/shared

**共享工具和工具函数库**

提供框架最基础的实用工具函数，包括 DOM 操作、数据处理、状态管理等。

#### 📦 导出模块

- `@vben-core/shared/utils` - 工具函数集合
- `@vben-core/shared/constants` - 常量定义
- `@vben-core/shared/color` - 颜色处理工具
- `@vben-core/shared/cache` - 缓存管理
- `@vben-core/shared/store` - 状态管理
- `@vben-core/shared/global-state` - 全局状态

#### 🔧 主要工具函数

```typescript
// 工具函数
import {
  // 类名合并
  cn,

  // 日期处理
  formatDate,
  formatDateTime,

  // DOM 操作
  addClass,
  removeClass,
  toggleClass,

  // 数据操作
  cloneDeep, // 深拷贝
  get, // 获取对象属性
  set, // 设置对象属性
  isEqual, // 深度比较

  // 树形数据处理
  mapTree,
  filterTree,
  traverseTreeValues,

  // 数组去重
  uniqueByField,

  // 资源加载
  loadScript,
  loadStyle,

  // NProgress 进度条
  startProgress,
  doneProgress,

  // 下载
  downloadByUrl,
  downloadByData,

  // 其他工具
  isString,
  isNumber,
  isFunction,
  isObject,
  debounce,
  throttle,
} from '@vben-core/shared/utils';

// 常量
import { CSS_VARIABLE_LAYOUT_CONTENT_HEIGHT } from '@vben-core/shared/constants';

// 颜色处理
import { generateColor } from '@vben-core/shared/color';

// 缓存管理
import { StorageManager } from '@vben-core/shared/cache';
```

#### 💡 使用示例

```typescript
// 类名合并
import { cn } from '@vben-core/shared/utils';

const className = cn('base-class', {
  active: isActive,
  disabled: isDisabled,
});

// 日期格式化
import { formatDate, formatDateTime } from '@vben-core/shared/utils';

const dateStr = formatDate(new Date(), 'YYYY-MM-DD');
const dateTimeStr = formatDateTime(new Date());

// 树形数据处理
import { mapTree, filterTree } from '@vben-core/shared/utils';

const mappedTree = mapTree(treeData, (node) => ({
  ...node,
  label: node.name,
}));

// 缓存管理
import { storageManager } from '@vben-core/shared/cache';

storageManager.set('key', value);
const value = storageManager.get('key');
```

---

### @vben-core/typings

**TypeScript 类型定义库**

提供框架所需的 TypeScript 类型定义，确保类型安全。

#### 📦 导出内容

```typescript
import type {
  // 基础类型
  Recordable,
  Nullable,
  DeepPartial,
  ClassType,
  AnyFunction,

  // 应用相关
  AppConfig,

  // 菜单相关
  MenuRecordRaw,
  MenuMeta,

  // 标签页相关
  TabDefinition,

  // 路由相关（需要单独导入）
} from '@vben-core/typings';

// Vue Router 类型扩展
import type { RouteMeta } from '@vben-core/typings/vue-router';
```

#### 💡 使用示例

```typescript
import type { MenuRecordRaw, Recordable } from '@vben-core/typings';

const menu: MenuRecordRaw = {
  path: '/dashboard',
  name: 'Dashboard',
  meta: {
    title: '仪表盘',
    icon: 'dashboard',
  },
};

const data: Recordable<string> = {
  key1: 'value1',
  key2: 'value2',
};
```

---

### @vben-core/icons

**图标系统**

基于 Iconify 的图标系统，支持 Iconify 图标库和自定义 SVG 图标。

#### 📦 导出内容

```typescript
import {
  // 创建图标组件
  createIconifyIcon,

  // Iconify 相关
  IconifyIcon,
  addIcon,
  addCollection,
  listIcons,

  // Lucide 图标导出
  // ... (大量 Lucide 图标)
} from '@vben-core/icons';

import type { IconifyIconStructure } from '@vben-core/icons';
```

#### 💡 使用示例

```typescript
// 创建 Iconify 图标
import { createIconifyIcon } from '@vben-core/icons';

const MyIcon = createIconifyIcon('mdi:home');

// 使用 Lucide 图标
import { Home, User, Settings } from '@vben-core/icons';

// 添加自定义图标
import { addIcon } from '@vben-core/icons';

addIcon('custom:my-icon', {
  body: '<path d="..."/>',
  width: 24,
  height: 24,
});
```

---

### @vben-core/design

**设计系统和样式**

提供设计令牌、CSS 变量、全局样式和工具类。

#### 📦 导出内容

```typescript
// 引入设计系统（自动导入样式）
import '@vben-core/design';

// 设计令牌
// - CSS 变量定义（颜色、间距、字体等）
// - 暗色主题支持
// - 响应式断点
```

#### 🎨 包含的样式

- `global.css` - 全局样式
- `transition.css` - 过渡动画
- `nprogress.css` - 进度条样式
- `ui.css` - UI 组件基础样式
- `design-tokens/` - 设计令牌（颜色、主题等）
- `scss-bem/` - BEM 命名工具

#### 💡 使用示例

```typescript
// 在主入口文件引入
// main.ts
import '@vben-core/design';

// 在组件中使用 CSS 变量
<style>
.my-component {
  color: var(--foreground);
  background: var(--background);
  padding: var(--spacing-4);
}
</style>

// 使用 BEM（如果启用 SCSS）
<style lang="scss">
@use '@vben-core/design/bem' as *;

.my-component {
  @include b(component) {
    @include e(title) {
      font-size: 1.2rem;
    }
  }
}
</style>
```

---

## UI 组件库 (UI Kit)

### @vben-core/shadcn-ui

**基础 UI 组件库**

基于 shadcn/ui 设计的 Vue 3 组件库，提供最基础的 UI 组件。

#### 📦 主要组件

```typescript
import {
  // 基础组件
  VbenButton,
  VbenInput,
  VbenTextarea,
  VbenCheckbox,
  VbenSelect,
  VbenCard,
  VbenBadge,
  VbenAvatar,

  // 交互组件
  VbenDialog,
  VbenPopover,
  VbenTooltip,
  VbenDropdownMenu,
  VbenContextMenu,
  VbenAlertDialog,

  // 布局组件
  VbenSeparator,
  VbenScrollArea,
  VbenTabs,
  VbenAccordion,

  // 表单组件
  VbenForm,
  VbenLabel,
  VbenRadioGroup,
  VbenSwitch,
  VbenToggle,
  VbenToggleGroup,

  // 数据展示
  VbenPagination,
  VbenTree,

  // 其他
  VbenBreadcrumb,
  VbenIcon,
  VbenIconButton,
  VbenSpinner,
  VbenLoading,
} from '@vben-core/shadcn-ui';
```

#### 💡 使用示例

```vue
<script setup lang="ts">
import { VbenButton, VbenCard, VbenInput } from '@vben-core/shadcn-ui';
</script>

<template>
  <VbenCard>
    <VbenInput v-model="value" placeholder="输入内容" />
    <VbenButton @click="handleClick">提交</VbenButton>
  </VbenCard>
</template>
```

---

### @vben-core/form-ui

**表单组件库**

提供强大的表单构建和验证功能，基于 vee-validate 和 zod。

#### 📦 主要导出

```typescript
import {
  VbenForm,
  VbenUseForm,
  useVbenForm,
  FormApi,
} from '@vben-core/form-ui';

import type { VbenFormProps, BaseFormComponentType } from '@vben-core/form-ui';
```

#### 💡 使用示例

```vue
<script setup lang="ts">
import { useVbenForm } from '@vben-core/form-ui';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('邮箱格式不正确'),
});

const { handleSubmit, values, fields } = useVbenForm({
  schema,
  initialValues: {
    name: '',
    email: '',
  },
});

const onSubmit = handleSubmit((values) => {
  console.log(values);
});
</script>

<template>
  <VbenForm @submit="onSubmit">
    <Field name="name" v-slot="{ field }">
      <VbenInput v-bind="field" />
    </Field>
    <Field name="email" v-slot="{ field }">
      <VbenInput v-bind="field" type="email" />
    </Field>
    <VbenButton type="submit">提交</VbenButton>
  </VbenForm>
</template>
```

---

### @vben-core/layout-ui

**布局组件库**

提供页面布局相关的组件，包括 Header、Sidebar、Content、Footer 等。

#### 📦 主要导出

```typescript
import {
  VbenLayout,
  LayoutHeader,
  LayoutSidebar,
  LayoutContent,
  LayoutFooter,
  LayoutTabbar,
  useLayout,
} from '@vben-core/layout-ui';
```

#### 💡 使用示例

```vue
<script setup lang="ts">
import { VbenLayout } from '@vben-core/layout-ui';
</script>

<template>
  <VbenLayout>
    <template #header>
      <LayoutHeader>头部内容</LayoutHeader>
    </template>
    <template #sidebar>
      <LayoutSidebar>侧边栏内容</LayoutSidebar>
    </template>
    <template #content>
      <LayoutContent>主内容区域</LayoutContent>
    </template>
    <template #footer>
      <LayoutFooter>底部内容</LayoutFooter>
    </template>
  </VbenLayout>
</template>
```

---

### @vben-core/menu-ui

**菜单组件库**

提供导航菜单组件，支持多级菜单、图标、徽章等。

#### 📦 主要导出

```typescript
import {
  Menu,
  SubMenu,
  MenuItem,
  useMenu,
  useMenuContext,
} from '@vben-core/menu-ui';

import type { MenuRecordRaw } from '@vben-core/typings';
```

#### 💡 使用示例

```vue
<script setup lang="ts">
import { Menu, SubMenu, MenuItem } from '@vben-core/menu-ui';
import type { MenuRecordRaw } from '@vben-core/typings';

const menuData: MenuRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'dashboard' },
  },
  {
    path: '/users',
    name: 'Users',
    meta: { title: '用户管理', icon: 'users' },
    children: [
      {
        path: '/users/list',
        name: 'UserList',
        meta: { title: '用户列表' },
      },
    ],
  },
];
</script>

<template>
  <Menu :data="menuData" />
</template>
```

---

### @vben-core/popup-ui

**弹窗组件库**

提供 Modal、Drawer、Alert 等弹窗组件及其 API。

#### 📦 主要导出

```typescript
import {
  // Modal
  VbenModal,
  useVbenModal,
  modalApi,

  // Drawer
  VbenDrawer,
  useVbenDrawer,
  drawerApi,

  // Alert
  VbenAlert,
  alertApi,
} from '@vben-core/popup-ui';
```

#### 💡 使用示例

```typescript
// 使用 API 方式
import { modalApi, drawerApi, alertApi } from '@vben-core/popup-ui';

// Modal
modalApi.open({
  title: '确认',
  content: '确定要删除吗？',
  onOk: () => {
    console.log('确认');
  },
});

// Drawer
drawerApi.open({
  title: '设置',
  content: '...',
  width: 500,
});

// Alert
alertApi.success('操作成功');
alertApi.error('操作失败');
alertApi.warning('警告信息');

// 使用组合式函数
import { useVbenModal } from '@vben-core/popup-ui';

const { open, close } = useVbenModal();

open({
  title: '标题',
  content: '内容',
});
```

---

### @vben-core/tabs-ui

**标签页组件库**

提供标签页视图组件，支持标签页切换、拖拽等。

#### 📦 主要导出

```typescript
import { TabsView, useTabsView } from '@vben-core/tabs-ui';

import type { TabDefinition } from '@vben-core/typings';
```

#### 💡 使用示例

```vue
<script setup lang="ts">
import { TabsView } from '@vben-core/tabs-ui';
import type { TabDefinition } from '@vben-core/typings';

const tabs: TabDefinition[] = [
  {
    key: '1',
    title: '标签1',
    component: () => import('./Tab1.vue'),
  },
  {
    key: '2',
    title: '标签2',
    component: () => import('./Tab2.vue'),
  },
];
</script>

<template>
  <TabsView :tabs="tabs" />
</template>
```

---

## 组合式函数 (Composables)

### @vben-core/composables

**Vue 3 组合式函数库**

提供可复用的 Vue 3 Composition API 函数。

#### 📦 主要导出

```typescript
import {
  // 响应式工具
  useIsMobile, // 检测是否为移动设备
  useLayoutStyle, // 布局样式
  useNamespace, // 命名空间
  usePriorityValue, // 优先级值
  useScrollLock, // 滚动锁定
  useSimpleLocale, // 简单国际化
  useSortable, // 排序功能

  // Radix Vue 工具
  useEmitAsProps,
  useForwardExpose,
  useForwardProps,
  useForwardPropsEmits,
} from '@vben-core/composables';
```

#### 💡 使用示例

```typescript
import { useIsMobile, useScrollLock } from '@vben-core/composables';

// 检测移动设备
const isMobile = useIsMobile();

// 锁定滚动
const { lock, unlock } = useScrollLock();

lock(); // 锁定页面滚动
unlock(); // 解锁页面滚动

// 排序功能
import { useSortable } from '@vben-core/composables';

const { sortableRef, handleStart, handleEnd } = useSortable({
  onEnd: (event) => {
    console.log('排序结束', event);
  },
});
```

---

## 偏好设置 (Preferences)

### @vben-core/preferences

**用户偏好设置系统**

管理应用的主题、语言、布局等偏好设置。

#### 📦 主要导出

```typescript
import {
  preferences,
  updatePreferences,
  usePreferences,
  useThemeMode,
  useColorMode,
} from '@vben-core/preferences';

import type { Preferences } from '@vben-core/preferences';
```

#### 💡 使用示例

```typescript
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@vben-core/preferences';

// 获取偏好设置
const prefs = preferences.value;

// 更新偏好设置
updatePreferences({
  theme: {
    mode: 'dark',
    color: '#1890ff',
  },
});

// 使用组合式函数
const { preferences, updatePreferences } = usePreferences();

preferences.value.theme.mode = 'dark';
```

---

## 依赖关系图

```
@vben-core/shared (基础工具)
    ↑
    ├── @vben-core/composables
    ├── @vben-core/preferences
    ├── @vben-core/icons
    └── @vben-core/design

@vben-core/typings (类型定义)
    ↑
    ├── @vben-core/preferences
    └── @vben-core/form-ui

@vben-core/shadcn-ui (基础 UI)
    ↑
    ├── @vben-core/form-ui
    ├── @vben-core/layout-ui
    ├── @vben-core/menu-ui
    └── @vben-core/popup-ui

@vben-core/icons (图标)
    ↑
    └── @vben-core/shadcn-ui
```

---

## 使用指南

### 安装依赖

所有包都在 workspace 中，无需单独安装：

```bash
# 在项目根目录运行
pnpm install
```

### 导入使用

```typescript
// 工具函数
import { cn, formatDate } from '@vben-core/shared/utils';

// 类型定义
import type { MenuRecordRaw } from '@vben-core/typings';

// 图标
import { Home } from '@vben-core/icons';

// UI 组件
import { VbenButton } from '@vben-core/shadcn-ui';

// 组合式函数
import { useIsMobile } from '@vben-core/composables';

// 偏好设置
import { usePreferences } from '@vben-core/preferences';
```

### 最佳实践

1. **按需导入**：只导入需要的功能，避免导入整个包
2. **类型安全**：使用 TypeScript 类型定义确保类型安全
3. **组合使用**：灵活组合不同的包来实现功能
4. **不修改核心包**：不要在 `@core` 目录下添加业务逻辑

### 注意事项

- ⚠️ `@core` 目录下的包是框架核心，请勿添加业务逻辑
- ⚠️ 这些包可能在未来迁移或发布到 npm
- ✅ 业务组件应该放在 `packages/effects` 中

---

## 版本信息

当前版本：`5.5.9`

所有 `@vben-core` 包使用统一版本号，通过 workspace 管理依赖。

---

## 贡献指南

如需修改或扩展 `@core` 包：

1. 确保修改不涉及业务逻辑
2. 保持 API 的向后兼容性
3. 添加适当的测试
4. 更新相关文档

---

## 许可证

MIT
