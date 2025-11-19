/**
 * 时区到主要城市位置的映射（用于天气查询）
 * 注意：nameKey 字段存储的是翻译键，实际显示时会通过 $t 函数获取翻译
 */
export const timezoneToLocation: Record<
  string,
  { latitude: number; longitude: number; nameKey: string }
> = {
  'America/New_York': {
    latitude: 40.7128,
    longitude: -74.0060,
    nameKey: 'workspace.cities.New_York',
  },
  'Europe/London': {
    latitude: 51.5074,
    longitude: -0.1278,
    nameKey: 'workspace.cities.London',
  },
  'Asia/Shanghai': {
    latitude: 39.9042,
    longitude: 116.4074,
    nameKey: 'workspace.cities.Beijing',
  },
  'Asia/Tokyo': {
    latitude: 35.6762,
    longitude: 139.6503,
    nameKey: 'workspace.cities.Tokyo',
  },
  'Asia/Seoul': {
    latitude: 37.5665,
    longitude: 126.9780,
    nameKey: 'workspace.cities.Seoul',
  },
  'America/Los_Angeles': {
    latitude: 34.0522,
    longitude: -118.2437,
    nameKey: 'workspace.cities.Los_Angeles',
  },
  'America/Chicago': {
    latitude: 41.8781,
    longitude: -87.6298,
    nameKey: 'workspace.cities.Chicago',
  },
  'Europe/Paris': {
    latitude: 48.8566,
    longitude: 2.3522,
    nameKey: 'workspace.cities.Paris',
  },
  'Europe/Berlin': {
    latitude: 52.5200,
    longitude: 13.4050,
    nameKey: 'workspace.cities.Berlin',
  },
  'Asia/Hong_Kong': {
    latitude: 22.3193,
    longitude: 114.1694,
    nameKey: 'workspace.cities.Hong_Kong',
  },
  'Asia/Singapore': {
    latitude: 1.3521,
    longitude: 103.8198,
    nameKey: 'workspace.cities.Singapore',
  },
  'Australia/Sydney': {
    latitude: -33.8688,
    longitude: 151.2093,
    nameKey: 'workspace.cities.Sydney',
  },
  'America/Toronto': {
    latitude: 43.6532,
    longitude: -79.3832,
    nameKey: 'workspace.cities.Toronto',
  },
  'America/Mexico_City': {
    latitude: 19.4326,
    longitude: -99.1332,
    nameKey: 'workspace.cities.Mexico_City',
  },
  'Asia/Dubai': {
    latitude: 25.2048,
    longitude: 55.2708,
    nameKey: 'workspace.cities.Dubai',
  },
  'Asia/Mumbai': {
    latitude: 19.0760,
    longitude: 72.8777,
    nameKey: 'workspace.cities.Mumbai',
  },
  'Asia/Bangkok': {
    latitude: 13.7563,
    longitude: 100.5018,
    nameKey: 'workspace.cities.Bangkok',
  },
  'Asia/Jakarta': {
    latitude: -6.2088,
    longitude: 106.8456,
    nameKey: 'workspace.cities.Jakarta',
  },
  'Europe/Moscow': {
    latitude: 55.7558,
    longitude: 37.6173,
    nameKey: 'workspace.cities.Moscow',
  },
};

/**
 * 获取当前时区对应的位置信息
 * @param timezone 时区字符串，如 'Asia/Shanghai'
 * @returns 位置信息，包含经纬度和城市名称的翻译键
 */
export function getLocationByTimezone(timezone: string): {
  latitude: number;
  longitude: number;
  nameKey: string;
} {
  const location = timezoneToLocation[timezone];
  if (location) {
    return location;
  }
  // 如果没有映射，默认使用北京
  return (
    timezoneToLocation['Asia/Shanghai'] || {
      latitude: 39.9042,
      longitude: 116.4074,
      nameKey: 'workspace.cities.Beijing',
    }
  );
}

/**
 * 获取所有时区选项列表
 * @param $t 国际化翻译函数
 * @returns 时区选项列表，包含 label 和 value
 */
export function getTimezoneOptions($t: (key: string) => string): {
  label: string;
  value: string;
}[] {
  // 需要导入 dayjs 来计算时区偏移量
  // 但由于这是工具函数，我们使用动态导入
  return Object.keys(timezoneToLocation)
    .map((timezone) => {
      const location = timezoneToLocation[timezone];
      if (!location) {
        // 如果找不到位置信息，跳过
        return null;
      }
      // 使用国际化翻译城市名称
      const cityName = $t(location.nameKey);
      
      // 返回格式：城市名称 (时区)
      // 注意：GMT 偏移量可以在使用时通过 dayjs 动态计算，这里只显示时区名称
      return {
        label: `${cityName} (${timezone})`,
        value: timezone,
      };
    })
    .filter((item): item is { label: string; value: string } => item !== null)
    .sort((a, b) => a.label.localeCompare(b.label));
}

