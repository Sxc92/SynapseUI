/**
 * 组件工具函数
 * 类名合并工具函数
 */

type ClassValue =
  | boolean
  | ClassValue[]
  | null
  | number
  | Record<string, boolean>
  | string
  | undefined;

/**
 * 合并类名工具函数
 * 简化实现，不依赖外部包
 * @param inputs 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
