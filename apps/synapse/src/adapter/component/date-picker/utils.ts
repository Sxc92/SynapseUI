/**
 * 日期格式化工具函数
 * 支持国际化日期格式化
 */

import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

/**
 * 根据语言环境获取 dayjs locale
 * @param locale 语言环境，如 'zh-CN', 'en-US'
 * @returns dayjs locale 名称
 */
export function getDayjsLocale(locale: string): string {
  // 将 'zh-CN' 转换为 'zh-cn'，'en-US' 转换为 'en'
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-cn',
    'zh': 'zh-cn',
    'en-US': 'en',
    'en': 'en',
  };

  return localeMap[locale] || locale.toLowerCase();
}

/**
 * 根据语言环境获取默认日期格式
 * @param locale 语言环境
 * @param showTime 是否显示时间
 * @returns 日期格式字符串
 */
export function getDefaultDateFormat(locale: string, showTime: boolean = false): string {
  if (locale.startsWith('zh')) {
    return showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
  } else {
    return showTime ? 'MM/DD/YYYY HH:mm:ss' : 'MM/DD/YYYY';
  }
}

/**
 * 格式化日期
 * @param date 日期值
 * @param format 格式字符串
 * @param locale 语言环境
 * @returns 格式化后的字符串
 */
export function formatDate(
  date: string | Date | Dayjs | null | undefined,
  format?: string,
  locale: string = 'zh-CN',
): string {
  if (!date) {
    return '';
  }

  const dayjsLocale = getDayjsLocale(locale);
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  
  if (!dateObj.isValid()) {
    return '';
  }

  const formatStr = format || getDefaultDateFormat(locale);
  return dateObj.locale(dayjsLocale).format(formatStr);
}

/**
 * 解析日期字符串
 * @param dateString 日期字符串
 * @param format 格式字符串
 * @param locale 语言环境
 * @returns dayjs 对象或 null
 */
export function parseDate(
  dateString: string,
  format?: string,
  locale: string = 'zh-CN',
): Dayjs | null {
  if (!dateString) {
    return null;
  }

  const dayjsLocale = getDayjsLocale(locale);
  const formatStr = format || getDefaultDateFormat(locale);
  const dateObj = dayjs(dateString, formatStr).locale(dayjsLocale);
  
  return dateObj.isValid() ? dateObj : null;
}

/**
 * 格式化日期范围
 * @param dates 日期范围数组 [start, end]
 * @param format 格式字符串
 * @param locale 语言环境
 * @param separator 分隔符，默认 ' ~ '
 * @returns 格式化后的字符串
 */
export function formatDateRange(
  dates: [string | Date | Dayjs | null, string | Date | Dayjs | null] | null,
  format?: string,
  locale: string = 'zh-CN',
  separator: string = ' ~ ',
): string {
  if (!dates || !dates[0] || !dates[1]) {
    return '';
  }

  const start = formatDate(dates[0], format, locale);
  const end = formatDate(dates[1], format, locale);
  
  return `${start}${separator}${end}`;
}

