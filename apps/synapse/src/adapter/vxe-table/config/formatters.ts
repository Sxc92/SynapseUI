import type { VxeUIExport } from 'vxe-table';

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化百分比
 */
function formatPercent(value: number, precision = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(precision)}%`;
}

/**
 * 格式化金额
 */
function formatMoney(
  value: number | string,
  options: {
    precision?: number;
    prefix?: string;
    suffix?: string;
    thousands?: boolean;
  } = {},
): string {
  const {
    prefix = '¥',
    suffix = '',
    precision = 2,
    thousands = true,
  } = options;

  if (value === null || value === undefined) {
    return '--';
  }

  const numValue = Number(value);
  if (Number.isNaN(numValue)) {
    return String(value);
  }

  let formattedValue = numValue.toFixed(precision);

  if (thousands) {
    formattedValue = new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(numValue);
  }

  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * 格式化手机号
 */
function formatPhone(value: string): string {
  if (!value) return '--';
  const phone = String(value).replaceAll(/\D/g, '');
  if (phone.length !== 11) return value;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $2');
}

/**
 * 格式化银行卡号
 */
function formatBankCard(value: string): string {
  if (!value) return '--';
  const card = String(value).replaceAll(/\D/g, '');
  if (card.length < 16) return value;
  return `${card.slice(0, 4)} **** **** ${card.slice(-4)}`;
}

/**
 * 格式化身份证号
 */
function formatIdCard(value: string): string {
  if (!value) return '--';
  const idCard = String(value).replaceAll(/\D/g, '');
  if (idCard.length !== 18 && idCard.length !== 15) return value;
  if (idCard.length === 18) {
    return `${idCard.slice(0, 6)}********${idCard.slice(-4)}`;
  }
  return `${idCard.slice(0, 6)}******${idCard.slice(-3)}`;
}

/**
 * 注册所有自定义格式化器
 */
export function registerFormatters(vxeUI: VxeUIExport) {
  // 注意：formatDate 和 formatDateTime 已在 extendsDefaultFormatter 中注册
  // 这里不再重复注册，避免重复定义警告

  // ========== formatMoney - 金额格式化 ==========
  /**
   * 使用方式: formatter: 'formatMoney'
   * 或: formatter: ({ cellValue }) => formatMoney(cellValue, { prefix: '$', precision: 2 })
   */
  vxeUI.formats.add('formatMoney', {
    tableCellFormatMethod({ cellValue }, params) {
      const options = params?.params || {};
      return formatMoney(cellValue, options);
    },
  });

  // ========== formatPercent - 百分比格式化 ==========
  /**
   * 使用方式: formatter: 'formatPercent'
   * 或: formatter: ({ cellValue }, { params }) => formatPercent(cellValue, params?.precision || 2)
   */
  vxeUI.formats.add('formatPercent', {
    tableCellFormatMethod({ cellValue }, params) {
      const precision = params?.params?.precision || 2;
      return formatPercent(cellValue, precision);
    },
  });

  // ========== formatFileSize - 文件大小格式化 ==========
  /**
   * 使用方式: formatter: 'formatFileSize'
   */
  vxeUI.formats.add('formatFileSize', {
    tableCellFormatMethod({ cellValue }) {
      if (cellValue === null || cellValue === undefined) {
        return '--';
      }
      const numValue = Number(cellValue);
      if (Number.isNaN(numValue)) {
        return String(cellValue);
      }
      return formatFileSize(numValue);
    },
  });

  // ========== formatPhone - 手机号格式化 ==========
  /**
   * 使用方式: formatter: 'formatPhone'
   * 格式化：138 **** 8888
   */
  vxeUI.formats.add('formatPhone', {
    tableCellFormatMethod({ cellValue }) {
      return formatPhone(cellValue);
    },
  });

  // ========== formatBankCard - 银行卡号格式化 ==========
  /**
   * 使用方式: formatter: 'formatBankCard'
   * 格式化：6222 **** **** 8888
   */
  vxeUI.formats.add('formatBankCard', {
    tableCellFormatMethod({ cellValue }) {
      return formatBankCard(cellValue);
    },
  });

  // ========== formatIdCard - 身份证号格式化 ==========
  /**
   * 使用方式: formatter: 'formatIdCard'
   * 格式化：110101********1234
   */
  vxeUI.formats.add('formatIdCard', {
    tableCellFormatMethod({ cellValue }) {
      return formatIdCard(cellValue);
    },
  });

  // ========== formatNumber - 数字格式化（千分位） ==========
  /**
   * 使用方式: formatter: 'formatNumber'
   * 或: formatter: ({ cellValue }, { params }) => formatNumber(cellValue, params?.precision || 0)
   */
  vxeUI.formats.add('formatNumber', {
    tableCellFormatMethod({ cellValue }, params) {
      if (cellValue === null || cellValue === undefined) {
        return '--';
      }
      const numValue = Number(cellValue);
      if (Number.isNaN(numValue)) {
        return String(cellValue);
      }
      const precision = params?.params?.precision || 0;
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(numValue);
    },
  });

  // ========== formatDuration - 时长格式化 ==========
  /**
   * 使用方式: formatter: 'formatDuration'
   * 格式化：将秒数转换为 时:分:秒
   */
  vxeUI.formats.add('formatDuration', {
    tableCellFormatMethod({ cellValue }) {
      if (cellValue === null || cellValue === undefined) {
        return '--';
      }
      const seconds = Number(cellValue);
      if (Number.isNaN(seconds)) {
        return String(cellValue);
      }

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    },
  });
}

// 导出格式化函数供外部使用
export {
  formatBankCard,
  formatFileSize,
  formatIdCard,
  formatMoney,
  formatPercent,
  formatPhone,
};
