import { MenuItem } from "../types/app_types";

export const flattenMenus = (menus: MenuItem[]): MenuItem[] => {
  const result: MenuItem[] = [];

  const walk = (items: MenuItem[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        walk(item.children);
      }
    }
  };

  walk(menus);
  return result;
}