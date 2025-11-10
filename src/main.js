// Vue核心
import { createApp } from 'vue'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Pinia状态管理
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 本地资源
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import './assets/styles/theme.css'

// 创建应用实例
const app = createApp(App)

// 配置Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()
document.documentElement.classList.add('theme-transition')

// 挂载应用
app.mount('#app')
