# VXE Table 适配器演进文档

## 版本历史

### v2.1.0 - 多列排序修复

**日期**: 2025-01

#### 变更概述

修复了多列排序功能，确保所有排序字段都能正确传递给后端 API。

#### 主要变更

1. **排序参数获取方式优化**
   - 移除了从 grid 实例读取排序状态的复杂逻辑
   - 改为直接使用 vxe-table 提供的 `sorts` 参数（数组）
   - `sorts` 参数包含所有已排序的列，确保多列排序正常工作

2. **代码简化**
   - 移除了本地状态存储（`sortStateRef`）
   - 移除了 `sortChange` 事件监听器
   - 移除了从列配置读取排序状态的逻辑
   - 移除了 `createDefaultGridProps` 和 `createProxyQuery` 中的 `gridApiRef` 参数

3. **排序参数格式**
   - 使用 `sorts` 数组，格式：`[{ property: 'field1', order: 'asc' }, { property: 'field2', order: 'desc' }]`
   - 转换为后端要求的 `orderByList` 格式：`[{ field: 'field1', direction: 'ASC' }, { field: 'field2', direction: 'DESC' }]`

#### 技术细节

**修改文件**:
- `apps/synapse/src/adapter/vxe-table/utils/default-config.ts`
  - `createProxyQuery()` 函数参数从 `{ page, sort }` 改为 `{ page, sorts }`
  - 直接使用 `sorts` 数组构建 `orderByList`
- `apps/synapse/src/adapter/vxe-table/grid.ts`
  - 移除了 `sortStateRef` 的创建和使用
  - 移除了 `sortChange` 事件监听器
- `apps/synapse/src/adapter/vxe-table/types/grid.ts`
  - 移除了 `GridOptions` 中的 `sortStateRef` 类型定义

**向后兼容性**:
- ✅ 完全向后兼容，无需修改现有代码
- ✅ API 接口保持不变
- ✅ 排序功能正常工作，支持多列排序

#### 问题修复

**修复前的问题**:
- 多列排序时，只有最后点击的列会被发送到后端
- 排序参数获取方式不正确，导致排序状态不同步

**修复后**:
- 所有已排序的列都会正确发送到后端
- 使用 vxe-table 官方提供的 `sorts` 参数，确保数据准确性
- 代码更简洁，维护性更好

---

### v2.0.0 - 模块化重构

**日期**: 2024-12

#### 变更概述

将原本 1215 行的 `grid.ts` 文件拆分为多个功能模块，提高代码可维护性和可扩展性。

#### 主要变更

1. **模块化拆分**
   - 创建 `types/grid.ts` - 集中管理所有类型定义
   - 创建 `utils/pager.ts` - 分页相关工具函数
   - 创建 `utils/actions.ts` - 操作按钮标准化处理
   - 创建 `utils/tree-config.ts` - 树形配置规范化
   - 创建 `utils/grid-helpers.ts` - 表格辅助函数（状态开关、操作按钮）
   - 创建 `utils/form-search.ts` - 表单自动搜索逻辑
   - 创建 `utils/default-config.ts` - 默认配置生成

2. **统一导出**
   - 所有功能通过 `#/adapter/vxe-table` 统一导出
   - 保持向后兼容，现有代码无需修改

3. **代码优化**
   - 提高代码可读性和可维护性
   - 每个模块职责单一，便于测试和扩展
   - 减少循环依赖风险

#### 迁移指南

**无需迁移** - 所有 API 保持向后兼容，现有代码无需修改。

```typescript
// ✅ 仍然有效
import { createGrid, createStandardActions } from '#/adapter/vxe-table';

// ✅ 仍然有效
import { createStandardActions } from '#/adapter/vxe-table/grid';
```

#### 模块说明

##### types/grid.ts
- `ApiMethods` - API 接口定义
- `GridOptions` - 表格配置选项
- `GridInstance` - 表格实例 API
- `StandardActionConfig` - 标准操作按钮配置

##### utils/pager.ts
- `createPagerIcons()` - 创建分页图标配置
- `createSeqConfig()` - 创建序列号配置
- `PagerInfo` - 分页信息类型

##### utils/actions.ts
- `createStandardActions()` - 创建标准化操作按钮配置
  - 统一处理国际化
  - 自动权限检查
  - 消息提示集成

##### utils/tree-config.ts
- `normalizeTreeConfig()` - 规范化树形配置
  - 支持布尔值和配置对象
  - 自动填充默认值

##### utils/grid-helpers.ts
- `createStatusSwitchFactory()` - 创建状态开关函数工厂
- `createActionButtonsFactory()` - 创建操作按钮函数工厂

##### utils/form-search.ts
- `processFormOptions()` - 处理表单选项，添加自动搜索功能
  - 自动添加 blur 和 clear 事件处理
  - 防抖处理，避免频繁请求
  - 支持 ApiSelect 等特殊组件
- `createSetFieldValueAndSearch()` - 创建设置字段值并触发搜索的函数

##### utils/default-config.ts
- `createDefaultGridProps()` - 创建默认表格配置
  - 包含完整的默认配置
  - 自动处理树形配置
  - 自动处理分页配置
- `createProxyQuery()` - 创建代理查询函数（内部使用）
  - 处理排序参数，支持多列排序
  - 将 vxe-table 的 `sorts` 参数转换为后端 `orderByList` 格式

#### 设计原则

1. **单一职责原则**
   - 每个模块只负责一个功能领域
   - 模块之间低耦合

2. **统一导出**
   - 所有功能通过主入口统一导出
   - 用户无需了解内部结构

3. **向后兼容**
   - 保持所有现有 API 不变
   - 现有代码无需修改

4. **可扩展性**
   - 新功能可以独立模块添加
   - 不影响现有模块

#### 未来规划

1. **单元测试**
   - 为每个模块添加单元测试
   - 提高代码质量

2. **文档完善**
   - 补充各模块的详细文档
   - 添加更多使用示例

3. **性能优化**
   - 优化表单搜索的防抖逻辑
   - 优化大数据量渲染

---

## 版本对比

### v1.0.0（重构前）

- 所有代码集中在 `grid.ts`（1215 行）
- 难以维护和扩展
- 代码耦合度高

### v2.0.0（重构后）

- 模块化拆分，职责清晰
- 易于维护和扩展
- 代码解耦，便于测试
- 统一导出，使用简单

### v2.1.0（多列排序修复后）

- 修复多列排序功能
- 简化排序参数获取逻辑
- 使用 vxe-table 官方 API，提高稳定性

---

## 贡献指南

### 添加新功能

1. 确定功能所属模块
2. 在对应模块中添加功能
3. 在 `grid.ts` 中集成（如需要）
4. 在主入口 `vxe-table.ts` 中导出
5. 更新文档

### 修改现有功能

1. 定位功能所在模块
2. 修改模块代码
3. 确保向后兼容
4. 更新相关文档

### 代码规范

- 使用 TypeScript 严格模式
- 遵循单一职责原则
- 添加必要的注释
- 保持 API 向后兼容

