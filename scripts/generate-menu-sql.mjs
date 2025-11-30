/**
 * 根据路由模块生成菜单SQL INSERT语句
 * 
 * 使用方法: node scripts/generate-menu-sql.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 菜单名称映射（从国际化文件）
const menuNameMap = {
  dashboard: '仪表盘',
  workspace: '工作台',
  mdm: '主数据中心',
  country: '国家管理',
  iam: '统一身份中心',
  userAndOrg: '用户与组织',
  user: '用户管理',
  organization: '组织架构管理',
  position: '岗位管理',
  systemAndApp: '系统与应用',
  system: '系统管理',
  permissionConfig: '权限配置',
  role: '角色管理',
  menu: '菜单管理',
  resource: 'API 资源管理',
};

// 固定值
const SYSTEM_ID = '1989175115039875073';
const CREATE_USER = '1986686516532805633';
const CURRENT_TIME = new Date().toISOString().slice(0, 19).replace('T', ' ');

// 生成雪花ID（简化版，使用时间戳+随机数+计数器）
let idCounter = 0;
function generateId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  const counter = idCounter++;
  // 生成19位数字ID：时间戳(13位) + 随机数(5位) + 计数器(1位)
  const idStr = `${timestamp}${String(random).padStart(5, '0')}${counter}`;
  return idStr.slice(0, 19).padEnd(19, '0');
}

// 解析路由文件内容（简单解析）
function parseRouteFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const routes = [];
  
  // 使用正则表达式提取路由信息
  // 匹配路由对象
  const routeRegex = /{\s*meta:\s*{([^}]+)},\s*name:\s*['"]([^'"]+)['"],\s*path:\s*['"]([^'"]+)['"](?:,\s*component:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\))?/g;
  
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const metaContent = match[1];
    const name = match[2];
    const path = match[3];
    const component = match[4] || null;
    
    // 提取meta信息
    const iconMatch = metaContent.match(/icon:\s*['"]([^'"]+)['"]/);
    const titleMatch = metaContent.match(/title:\s*\$t\(['"]([^'"]+)['"]\)/);
    const icon = iconMatch ? iconMatch[1] : null;
    const titleKey = titleMatch ? titleMatch[1].replace('menus.', '') : name;
    
    routes.push({
      name,
      path,
      component,
      icon,
      titleKey,
    });
  }
  
  return routes;
}

// 手动定义路由结构（更可靠）
const routeStructure = [
  // IAM模块
  {
    name: 'IAM',
    path: '/iam',
    icon: 'mdi:shield-account',
    titleKey: 'iam',
    children: [
      {
        name: 'UserAndOrg',
        path: '/iam/user-org',
        icon: 'mdi:account-group',
        titleKey: 'userAndOrg',
        children: [
          {
            name: 'UserManage',
            path: '/iam/user',
            component: '/iam/user/index.vue',
            icon: 'mdi:account',
            titleKey: 'user',
          },
          {
            name: 'OrganizationManage',
            path: '/iam/organization',
            component: '/iam/organization/index.vue',
            icon: 'mdi:sitemap',
            titleKey: 'organization',
          },
          {
            name: 'PositionManage',
            path: '/iam/position',
            component: '/iam/position/index.vue',
            icon: 'mdi:briefcase',
            titleKey: 'position',
          },
        ],
      },
      {
        name: 'PermissionConfig',
        path: '/iam/permission',
        icon: 'mdi:cog',
        titleKey: 'permissionConfig',
        children: [
          {
            name: 'RoleManage',
            path: '/iam/role',
            component: '/iam/role/index.vue',
            icon: 'mdi:account-key',
            titleKey: 'role',
          },
          {
            name: 'MenuManage',
            path: '/iam/menu',
            component: '/iam/menu/index.vue',
            icon: 'mdi:menu',
            titleKey: 'menu',
          },
          {
            name: 'ResourceManage',
            path: '/iam/resource',
            component: '/iam/resource/index.vue',
            icon: 'mdi:api',
            titleKey: 'resource',
          },
        ],
      },
      {
        name: 'SystemAndApp',
        path: '/iam/system-app',
        icon: 'mdi:application-cog',
        titleKey: 'systemAndApp',
        children: [
          {
            name: 'SystemManage',
            path: '/iam/system',
            component: '/iam/system/index.vue',
            icon: 'mdi:server',
            titleKey: 'system',
          },
        ],
      },
    ],
  },
  // Dashboard模块
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'mdi:view-dashboard',
    titleKey: 'dashboard',
    children: [
      {
        name: 'Workspace',
        path: '/dashboard/workspace',
        component: '/dashboard/workspace/index.vue',
        icon: 'mdi:briefcase-outline',
        titleKey: 'workspace',
      },
    ],
  },
  // MDM模块
  {
    name: 'Mdm',
    path: '/mdm',
    icon: 'ic:baseline-view-in-ar',
    titleKey: 'mdm',
    children: [
      {
        name: 'CountryManage',
        path: '/mdm/country',
        component: '/mdm/country/index.vue',
        icon: null,
        titleKey: 'country',
      },
    ],
  },
];

// 生成SQL INSERT语句
function generateSQL(route, parentId = null, level = 0) {
  const sqlStatements = [];
  const id = generateId();
  const code = route.name.toUpperCase();
  const name = menuNameMap[route.titleKey] || route.titleKey;
  const icon = route.icon || null;
  const router = route.path;
  const component = route.component ? `'${route.component}'` : 'NULL';
  const parentIdValue = parentId ? `'${parentId}'` : 'NULL';
  
  const sql = `INSERT INTO \`synapse_iam\`.\`iam_menu\` (\`id\`, \`system_id\`, \`parent_id\`, \`code\`, \`name\`, \`icon\`, \`router\`, \`component\`, \`status\`, \`visible\`, \`create_user\`, \`create_time\`, \`modify_user\`, \`modify_time\`, \`revision\`, \`deleted\`) VALUES ('${id}', '${SYSTEM_ID}', ${parentIdValue}, '${code}', '${name}', ${icon ? `'${icon}'` : 'NULL'}, '${router}', ${component}, 1, 1, '${CREATE_USER}', '${CURRENT_TIME}', '${CREATE_USER}', '${CURRENT_TIME}', 1, 0);`;
  
  sqlStatements.push(sql);
  
  // 递归处理子路由
  if (route.children && route.children.length > 0) {
    route.children.forEach((child) => {
      sqlStatements.push(...generateSQL(child, id, level + 1));
    });
  }
  
  return sqlStatements;
}

// 生成所有SQL语句
const allSQLStatements = [];
routeStructure.forEach((route) => {
  allSQLStatements.push(...generateSQL(route));
});

// 写入SQL文件
const sqlContent = allSQLStatements.join('\n\n');
const outputPath = join(rootDir, 'menu-insert.sql');
writeFileSync(outputPath, sqlContent, 'utf-8');

console.log(`✅ SQL文件已生成: ${outputPath}`);
console.log(`📊 共生成 ${allSQLStatements.length} 条INSERT语句`);

