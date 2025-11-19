import { computed, onMounted, ref, unref, watch } from 'vue';

import { getLocationByTimezone } from '@vben/layouts';
import { useI18n } from '@vben/locales';
import { useTimezoneStore } from '@vben/stores';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { $t } from '#/locales';

import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

// 启用 dayjs 时区插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 天气代码到翻译键的映射（Open-Meteo 使用 WMO 天气代码）
const weatherCodeToKey: Record<number, string> = {
  0: 'workspace.weather.clear',
  1: 'workspace.weather.mainlyClear',
  2: 'workspace.weather.partlyCloudy',
  3: 'workspace.weather.overcast',
  45: 'workspace.weather.fog',
  48: 'workspace.weather.depositingRimeFog',
  51: 'workspace.weather.lightDrizzle',
  53: 'workspace.weather.moderateDrizzle',
  55: 'workspace.weather.denseDrizzle',
  56: 'workspace.weather.lightFreezingDrizzle',
  57: 'workspace.weather.denseFreezingDrizzle',
  61: 'workspace.weather.lightRain',
  63: 'workspace.weather.moderateRain',
  65: 'workspace.weather.heavyRain',
  66: 'workspace.weather.lightFreezingRain',
  67: 'workspace.weather.heavyFreezingRain',
  71: 'workspace.weather.slightSnow',
  73: 'workspace.weather.moderateSnow',
  75: 'workspace.weather.heavySnow',
  77: 'workspace.weather.snowGrains',
  80: 'workspace.weather.slightRainShowers',
  81: 'workspace.weather.moderateRainShowers',
  82: 'workspace.weather.violentRainShowers',
  85: 'workspace.weather.slightSnowShowers',
  86: 'workspace.weather.heavySnowShowers',
  95: 'workspace.weather.thunderstorm',
  96: 'workspace.weather.thunderstormWithHail',
  99: 'workspace.weather.heavyThunderstormWithHail',
};

// 天气信息接口
export interface WeatherInfo {
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  description: string;
}

/**
 * 根据语言环境获取日期格式
 * @param locale 语言环境，如 'zh-CN', 'en-US'
 * @returns 日期格式字符串
 */
function getDateFormatByLocale(locale: string): string {
  if (locale.startsWith('zh')) {
    // 中文格式：2024年01月15日 星期一
    return 'YYYY年MM月DD日 dddd';
  } else {
    // 英文格式：Monday, January 15, 2024
    return 'dddd, MMMM DD, YYYY';
  }
}

/**
 * 根据语言环境获取 dayjs locale
 * @param locale 语言环境，如 'zh-CN', 'en-US'
 * @returns dayjs locale 名称
 */
function getDayjsLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-cn',
    zh: 'zh-cn',
    'en-US': 'en',
    en: 'en',
  };
  return localeMap[locale] || locale.toLowerCase();
}

/**
 * 工作台 Composable
 * 提供日期、问候语、天气等功能
 */
export function useWorkspace() {
  const timezoneStore = useTimezoneStore();
  const { locale: i18nLocale } = useI18n();

  const weatherInfo = ref<null | WeatherInfo>(null);
  const loading = ref(false);

  /**
   * 获取天气信息
   */
  async function fetchWeather() {
    try {
      loading.value = true;
      // 获取用户选择的时区
      const currentTimezone = unref(timezoneStore.timezone) || 'Asia/Shanghai';

      // 根据时区获取对应的地理位置
      const location = getLocationByTimezone(currentTimezone);

      // 将时区转换为 URL 编码格式
      const encodedTimezone = encodeURIComponent(currentTimezone);

      // 使用 Open-Meteo API（免费，无需 API key）
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=${encodedTimezone}`,
      );
      const data = await response.json();

      if (data.current && data.daily) {
        const current = data.current;
        const daily = data.daily;
        const weatherCode = current.weather_code;

        weatherInfo.value = {
          temperature: Math.round(current.temperature_2m),
          temperatureMax: Math.round(daily.temperature_2m_max[0]),
          temperatureMin: Math.round(daily.temperature_2m_min[0]),
          weatherCode,
          description:
            weatherCodeToKey[weatherCode] || 'workspace.weather.unknown',
        };
      }
    } catch (error) {
      console.error('获取天气信息失败:', error);
      // 失败时使用默认值
      weatherInfo.value = {
        temperature: 20,
        temperatureMax: 32,
        temperatureMin: 20,
        weatherCode: 0,
        description: 'workspace.weather.clear',
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * 格式化日期（根据用户选择的时区和语言环境）
   */
  const formattedDate = computed(() => {
    const currentTimezone = unref(timezoneStore.timezone) || 'Asia/Shanghai';
    const currentLocale = unref(i18nLocale) || 'zh-CN';
    const dateFormat = getDateFormatByLocale(currentLocale);
    const dayjsLocale = getDayjsLocale(currentLocale);

    return dayjs().tz(currentTimezone).locale(dayjsLocale).format(dateFormat);
  });

  /**
   * 根据时间获取问候语（根据用户选择的时区）
   */
  const greeting = computed(() => {
    const currentTimezone = unref(timezoneStore.timezone) || 'Asia/Shanghai';
    const hour = dayjs().tz(currentTimezone).hour();
    if (hour >= 5 && hour < 12) {
      return $t('workspace.greeting.goodMorning');
    } else if (hour >= 12 && hour < 14) {
      return $t('workspace.greeting.goodNoon');
    } else if (hour >= 14 && hour < 18) {
      return $t('workspace.greeting.goodAfternoon');
    } else if (hour >= 18 && hour < 22) {
      return $t('workspace.greeting.goodEvening');
    } else {
      return $t('workspace.greeting.lateNight');
    }
  });

  /**
   * 天气描述文本
   */
  const weatherDescription = computed(() => {
    if (!weatherInfo.value) {
      return $t('workspace.loading');
    }
    const { description, temperatureMax, temperatureMin } = weatherInfo.value;
    // description 是翻译键，需要通过 $t 获取翻译
    const weatherText = $t(description);
    return `${weatherText}，${temperatureMin}℃ - ${temperatureMax}℃`;
  });

  // 监听时区变化，重新获取天气
  watch(
    () => timezoneStore.timezone,
    () => {
      fetchWeather();
    },
  );

  // 组件挂载时获取天气
  onMounted(() => {
    fetchWeather();
  });

  return {
    // 响应式数据
    weatherInfo,
    loading,
    // 计算属性
    formattedDate,
    greeting,
    weatherDescription,
    // 方法
    fetchWeather,
  };
}
