import { defineConfig } from '@vben/vite-config';
import { loadEnv } from 'vite';

export default defineConfig(async (configEnv) => {
  // 获取当前模式（development、production、test 等）
  const mode = configEnv?.mode || process.env.NODE_ENV || 'development';

  // 加载环境变量
  // Vite 会自动加载 .env、.env.local、.env.[mode]、.env.[mode].local
  // 优先级：.env.[mode].local > .env.[mode] > .env.local > .env
  const env = loadEnv(mode, process.cwd());

  // 从环境变量获取后端 API 代理地址
  // 开发环境：使用 VITE_API_PROXY_TARGET（如果未设置，使用默认值）
  // 生产环境：通常不需要代理，直接使用 VITE_GLOB_API_URL
  const DEV_API_PROXY_TARGET =
    env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 保留 /api 前缀转发到后端
            // 例如：/api/mdm/geographic/country/page -> http://localhost:8080/api/mdm/geographic/country/page
            // 后端服务地址（仅用于开发环境的代理）
            // 通过环境变量配置，支持不同环境使用不同地址
            // 配置方式：
            //   1. 创建 .env.development 文件：VITE_API_PROXY_TARGET=http://localhost:8080
            //   2. 创建 .env.production 文件：VITE_API_PROXY_TARGET=https://api.prod.com
            //   3. 创建 .env.test 文件：VITE_API_PROXY_TARGET=http://test-api.com
            //   4. 优先级：.env.[mode].local > .env.[mode] > .env.local > .env
            target: DEV_API_PROXY_TARGET,
            ws: true,
          },
        },
      },
    },
  };
});
