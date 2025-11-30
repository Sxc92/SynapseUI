# 角色权限分配 API 规范文档

## 概述

本文档定义了角色权限分配功能所需的后端 API 接口规范。该功能用于在弹窗中展示系统、菜单、资源的三级结构，并根据角色ID反显已分配的权限。

## 数据模型

### 系统（System）
```typescript
interface System {
  id: string;           // 系统ID
  code: string;         // 系统编码
  name: string;         // 系统名称
  status: boolean;      // 启用状态
  sorted: number;       // 排序号
}
```

### 菜单（Menu）
```typescript
interface Menu {
  id: string;           // 菜单ID
  systemId: string;     // 所属系统ID
  parentId?: string;    // 父菜单ID（可选，支持两级菜单）
  code: string;         // 菜单编码
  name: string;         // 菜单名称
  icon?: string;        // 图标
  router?: string;      // 路由地址
  component?: string;   // 组件路径
  visible: boolean;     // 是否可见
  status: boolean;      // 启用状态
  sorted: number;       // 排序号
}
```

### 资源（Resource）
```typescript
interface Resource {
  id: string;           // 资源ID
  systemId: string;     // 所属系统ID
  menuId?: string;      // 所属菜单ID（可选，资源可能不属于菜单）
  code: string;         // 权限编码（accessCode）
  name: string;         // 资源名称
  type: 'API' | 'BUTTON'; // 资源类型：'API' 表示接口权限，'BUTTON' 表示按钮权限
  description?: string;  // 描述
  status: boolean;      // 启用状态
  sorted: number;       // 排序号
}
```

### 角色权限ID列表
```typescript
interface RolePermissionIds {
  systemIds: string[];   // 已分配的系统ID列表
  menuIds: string[];      // 已分配的菜单ID列表
  resourceIds: string[];  // 已分配的资源ID列表
}
```

---

## API 接口规范

### 1. 获取系统列表

**接口路径：** `GET /iam/system/list`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| roleId | string | 否 | 角色ID，如果传入则只返回该角色有权限的系统 |

**响应数据：**
```json
{
  "code": "SUCCESS",
  "data": [
    {
      "id": "sys-001",
      "code": "SYSTEM_MANAGE",
      "name": "系统管理",
      "status": true,
      "sorted": 1
    },
    {
      "id": "sys-002",
      "code": "USER_MANAGE",
      "name": "用户管理",
      "status": true,
      "sorted": 2
    }
  ],
  "msg": "操作成功"
}
```

**说明：**
- 如果不传 `roleId`：返回所有启用状态的系统列表（用于权限分配弹窗，显示所有可分配的系统）
- 如果传入 `roleId`：只返回该角色有权限的系统列表（用于其他场景）
- 按 `sorted` 字段排序
- 用于左侧系统列表展示

**使用场景：**
- 权限分配弹窗：调用 `GET /iam/system/list`（不传 roleId），显示所有系统供选择
- 其他业务场景：调用 `GET /iam/system/list?roleId=xxx`，只显示有权限的系统

---

### 2. 获取菜单树（按系统）

**接口路径：** `GET /iam/menu/tree`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| systemId | string | 否 | 系统ID，不传则返回所有系统的菜单 |

**响应数据：**
```json
{
  "code": "SUCCESS",
  "data": [
    {
      "id": "menu-001",
      "systemId": "sys-001",
      "parentId": null,
      "code": "USER_MANAGE",
      "name": "用户管理",
      "icon": "mdi:account",
      "router": "/user",
      "component": "UserList",
      "visible": true,
      "status": true,
      "sorted": 1,
      "children": [
        {
          "id": "menu-002",
          "systemId": "sys-001",
          "parentId": "menu-001",
          "code": "USER_LIST",
          "name": "用户列表",
          "icon": null,
          "router": "/user/list",
          "component": "UserList",
          "visible": true,
          "status": true,
          "sorted": 1,
          "children": []
        }
      ]
    }
  ],
  "msg": "操作成功"
}
```

**说明：**
- 返回树形结构的菜单列表（最多两级）
- 如果传入 `systemId`，只返回该系统的菜单
- 如果不传 `systemId`，返回所有系统的菜单（前端可按系统分组）
- 按 `sorted` 字段排序
- `children` 数组包含子菜单（第二级）

**使用场景：**
- 场景1：前端按系统分组展示
  - 调用：`GET /iam/menu/tree`（不传 systemId）
  - 前端按 `systemId` 分组展示
  
- 场景2：选择系统后加载菜单
  - 调用：`GET /iam/menu/tree?systemId=sys-001`
  - 只返回该系统的菜单树

---

### 3. 获取资源列表（按菜单）

**接口路径：** `GET /iam/resource/list`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| menuId | string | 是 | 菜单ID |

**响应数据：**
```json
{
  "code": "SUCCESS",
  "data": [
    {
      "id": "res-001",
      "systemId": "sys-001",
      "menuId": "menu-002",
      "code": "user:add",
      "name": "新增用户",
      "type": "BUTTON",
      "description": "新增用户按钮权限",
      "status": true,
      "sorted": 1
    },
    {
      "id": "res-002",
      "systemId": "sys-001",
      "menuId": "menu-002",
      "code": "user:delete",
      "name": "删除用户",
      "type": "BUTTON",
      "description": "删除用户按钮权限",
      "status": true,
      "sorted": 2
    },
    {
      "id": "res-003",
      "systemId": "sys-001",
      "menuId": "menu-002",
      "code": "api:user:list",
      "name": "/api/user/list",
      "type": "API",
      "description": "获取用户列表接口",
      "status": true,
      "sorted": 3
    }
  ],
  "msg": "操作成功"
}
```

**说明：**
- 返回指定菜单下的所有资源列表
- 按 `sorted` 字段排序
- `type` 字段用于前端分类显示（BUTTON 和 API）
- `code` 字段是权限编码（accessCode），用于权限检查

**使用场景：**
- 用户选择菜单时，调用此接口加载该菜单下的资源
- 前端可以按 `type` 字段分组展示（BUTTON 和 API）

---

### 4. 获取角色已分配的权限ID列表

**接口路径：** `GET /iam/role/{roleId}/permissionIds`

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| roleId | string | 是 | 角色ID（路径参数） |

**响应数据：**
```json
{
  "code": "SUCCESS",
  "data": {
    "systemIds": ["sys-001", "sys-002"],
    "menuIds": ["menu-001", "menu-002", "menu-003"],
    "resourceIds": ["res-001", "res-002", "res-005"]
  },
  "msg": "操作成功"
}
```

**说明：**
- 返回角色已分配的系统ID、菜单ID和资源ID列表
- 用于前端反显选中状态
- 只返回ID列表，不返回完整数据（减少数据传输量）
- **层级关系**：如果分配了菜单，必须分配其所属的系统；如果分配了资源，必须分配其所属的菜单和系统

**使用场景：**
- 弹窗打开时，调用此接口获取已分配的权限ID
- 前端根据ID列表标记菜单和资源的选中状态

---

### 5. 保存角色权限

**接口路径：** `POST /iam/role/assignPermissions`

**请求参数：**
```json
{
  "roleId": "role-001",
  "systemIds": ["sys-001", "sys-002"],
  "menuIds": ["menu-001", "menu-002", "menu-003"],
  "resourceIds": ["res-001", "res-002", "res-005"]
}
```

**请求参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| roleId | string | 是 | 角色ID |
| systemIds | string[] | 是 | 选中的系统ID列表 |
| menuIds | string[] | 是 | 选中的菜单ID列表 |
| resourceIds | string[] | 是 | 选中的资源ID列表 |

**响应数据：**
```json
{
  "code": "SUCCESS",
  "data": null,
  "msg": "权限分配成功"
}
```

**说明：**
- 保存角色分配的菜单和资源权限
- `menuIds` 和 `resourceIds` 都是完整列表（不是增量）
- 后端需要处理：如果某个ID不在列表中，则取消分配

**业务逻辑：**
1. 根据 `roleId` 查询当前已分配的权限
2. 对比新旧权限列表，计算差异
3. 新增：添加新的权限关联
4. 删除：移除取消的权限关联
5. 保持不变：已存在的权限保持不变

**权限关联规则（重要）：**
- **系统级联**：如果分配了菜单，必须自动分配其所属的系统
- **菜单级联**：如果分配了资源，必须自动分配其所属的菜单和系统
- **反向清理**：如果取消系统，自动取消其下所有菜单和资源
- **反向清理**：如果取消菜单，自动取消其下所有资源

**示例：**
- 用户选择菜单 `menu-001`（属于系统 `sys-001`）
  - 后端自动添加：`systemIds` 包含 `sys-001`
  
- 用户选择资源 `res-001`（属于菜单 `menu-001`，菜单属于系统 `sys-001`）
  - 后端自动添加：`systemIds` 包含 `sys-001`，`menuIds` 包含 `menu-001`
  
- 用户取消系统 `sys-001`
  - 后端自动移除：该系统的所有菜单和资源

---

## 前端调用流程

### 初始化阶段（快速启动）
```typescript
// 并行加载系统列表和权限ID
Promise.all([
  GET /iam/system/list,  // 不传 roleId，获取所有系统
  GET /iam/role/{roleId}/permissionIds  // 获取已分配的权限ID
])

// 根据权限ID反显系统选中状态
// 如果 systemIds 包含某个系统ID，则标记为选中
```

### 菜单预加载阶段
```typescript
// 方案1：加载所有系统的菜单（推荐）
GET /iam/menu/tree

// 方案2：按系统逐个加载（如果数据量大）
systems.forEach(system => {
  GET /iam/menu/tree?systemId=${system.id}
})
```

### 资源按需加载阶段
```typescript
// 用户选择菜单时
watch(selectedMenuId, (menuId) => {
  GET /iam/resource/list?menuId=${menuId}
})
```

### 保存权限
```typescript
// 用户点击保存按钮
// 前端需要收集所有选中的系统、菜单、资源ID
POST /iam/role/assignPermissions
{
  roleId: "role-001",
  systemIds: [...],  // 选中的系统ID（包括通过菜单/资源级联选中的）
  menuIds: [...],    // 选中的菜单ID（包括通过资源级联选中的）
  resourceIds: [...] // 选中的资源ID
}

// 注意：后端会自动处理级联关系
// - 如果 menuIds 包含菜单，自动添加其所属系统到 systemIds
// - 如果 resourceIds 包含资源，自动添加其所属菜单和系统
```

---

## 错误处理

### 统一错误响应格式
```json
{
  "code": "ERROR_CODE",
  "data": null,
  "msg": "错误描述信息"
}
```

### 常见错误码
| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| SUCCESS | 200 | 操作成功 |
| PARAM_ERROR | 400 | 参数错误 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| SERVER_ERROR | 500 | 服务器错误 |

---

## 性能优化建议

### 1. 数据量控制
- 系统列表：通常 < 50，一次性加载
- 菜单树：如果单系统菜单 > 100，考虑分页或虚拟滚动
- 资源列表：如果单菜单资源 > 50，考虑分页

### 2. 缓存策略
- 系统列表：可以缓存（变化频率低）
- 菜单树：可以缓存（变化频率低）
- 资源列表：按需加载，前端缓存

### 3. 响应时间目标
- 系统列表：< 200ms
- 菜单树：< 500ms（单系统），< 1000ms（所有系统）
- 资源列表：< 300ms
- 权限ID：< 200ms
- 保存权限：< 500ms

---

## 数据一致性要求

### 1. 权限关联规则（三级联动）

**正向级联（自动添加）：**
- 如果分配了菜单，必须自动分配其所属的系统
- 如果分配了资源，必须自动分配其所属的菜单和系统
- 如果分配了子菜单，建议分配其父菜单（可选，由业务决定）

**反向清理（自动移除）：**
- 如果取消系统，自动取消其下所有菜单和资源
- 如果取消菜单，自动取消其下所有资源
- 如果取消资源，不影响菜单和系统

**前端处理：**
- 用户勾选菜单时，自动勾选其所属系统
- 用户勾选资源时，自动勾选其所属菜单和系统
- 用户取消系统时，自动取消其下所有菜单和资源
- 用户取消菜单时，自动取消其下所有资源

**后端处理：**
- 保存时自动补充级联关系（即使前端漏传）
- 保存时自动清理反向关系（确保数据一致性）

### 2. 数据校验
- 保存时校验：`menuIds` 和 `resourceIds` 中的ID必须存在
- 保存时校验：`resourceIds` 中的资源必须属于已分配的菜单

---

## 扩展性考虑

### 1. 未来可能的需求
- 支持按角色类型过滤菜单/资源
- 支持权限模板（预设权限组合）
- 支持权限继承（角色继承其他角色的权限）

### 2. API 扩展建议
- 如果未来需要支持权限模板，可以添加：
  - `GET /iam/permission/templates` - 获取权限模板列表
  - `POST /iam/role/applyTemplate` - 应用权限模板

---

## 总结

本规范定义了5个核心API接口，支持：
1. ✅ 快速加载系统列表
2. ✅ 按需或批量加载菜单树
3. ✅ 按需加载资源列表
4. ✅ 获取角色权限ID用于反显
5. ✅ 保存角色权限

该方案支持数据量扩展，性能可控，交互流畅。

