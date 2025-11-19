/**
 * 数字格式化工具函数
 * 支持国际化数字格式化（千分位分隔符）
 */

/**
 * 将数字格式化为带千分位分隔符的字符串
 * @param value 数字值
 * @param locale 语言环境，如 'zh-CN', 'en-US'
 * @param precision 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale: string = 'zh-CN',
  precision?: number,
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return String(value);
  }

  const options: Intl.NumberFormatOptions = {};

  if (precision !== undefined) {
    options.minimumFractionDigits = precision;
    options.maximumFractionDigits = precision;
  }

  return new Intl.NumberFormat(locale, options).format(numValue);
}

/**
 * 将格式化的数字字符串转换为纯数字（去除分隔符）
 * @param formattedValue 格式化后的字符串，如 "1,234.56"
 * @returns 纯数字字符串，如 "1234.56"
 */
export function parseFormattedNumber(
  formattedValue: string,
): string {
  if (!formattedValue) {
    return '';
  }

  // 移除所有非数字字符（保留小数点和负号）
  // 根据语言环境，可能需要处理不同的千分位分隔符
  // 常见分隔符：, . ' 空格
  return formattedValue
    .replace(/[^\d.-]/g, '') // 移除所有非数字、非小数点、非负号的字符
    .replace(/(\d+)-(\d+)/g, '$1-$2'); // 保留负号（如果存在）
}

/**
 * 验证数字是否在有效范围内
 * @param value 数字值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否有效
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number,
): boolean {
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}

