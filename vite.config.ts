import { HttpsProxyAgent } from 'https-proxy-agent'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyUrl = env.DEV_HTTPS_PROXY || env.HTTPS_PROXY || env.HTTP_PROXY
  const notionAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  return {
    plugins: [
      react(),
      nodePolyfills({
        include: ['buffer'],
      }),
    ],
    server: {
      proxy: {
        // 开发环境通过可选系统代理访问 Notion，避免部分网络下直连被重置。
        '/notion-api': {
          target: 'https://api.notion.com/v1',
          changeOrigin: true,
          agent: notionAgent,
          rewrite: (path) => path.replace(/^\/notion-api/, ''),
        },
      },
    },
  }
})
