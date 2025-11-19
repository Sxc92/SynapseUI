/**
 * 菜单数据接口
 */
export interface MenuData {
  id: string;
  systemId: string;
  parentId?: string;
  code: string;
  name: string;
  icon?: string;
  router?: string;
  component?: string;
  visible: boolean;
  status: boolean;
}

