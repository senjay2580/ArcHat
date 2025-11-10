<template>
  <div class="form-container">
    <!-- SVG 背景装饰 左下 -->
    <div class="login-svg-bg">
      <svg width="420" height="320" viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="210" cy="320" rx="210" ry="100" fill="url(#paint0_linear)"/>
        <circle cx="60" cy="260" r="40" fill="url(#paint1_radial)"/>
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="320" x2="420" y2="320" gradientUnits="userSpaceOnUse">
            <stop stop-color="#409EFF"/>
            <stop offset="1" stop-color="#1AAD19"/>
          </linearGradient>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(60 260) scale(40)" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7ed957"/>
            <stop offset="1" stop-color="#409EFF" stop-opacity="0.2"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <!-- SVG 背景装饰 右上 -->
    <div class="login-svg-bg-right">
      <svg width="340" height="260" viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="170" cy="-40" rx="170" ry="100" fill="url(#paint0_linear_right)"/>
        <circle cx="300" cy="60" r="30" fill="url(#paint1_radial_right)"/>
        <defs>
          <linearGradient id="paint0_linear_right" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#eafff3"/>
            <stop offset="1" stop-color="#b3e5fc"/>
          </linearGradient>
          <radialGradient id="paint1_radial_right" cx="0" cy="0" r="1" gradientTransform="translate(300 60) scale(30)" gradientUnits="userSpaceOnUse">
            <stop stop-color="#409EFF"/>
            <stop offset="1" stop-color="#1AAD19" stop-opacity="0.18"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
    <!-- 添加 logo -->
    <div class="logo" @click="goToChat">
      <img src="/src/assets/image/archat.png" alt="ARCHAT" />
    </div>
    
    <div class="form-wrapper" :class="{ 'show-register': showRegister }">
      <!-- Left Panel (Welcome/Register) -->
      <div class="panel welcome-panel" :class="{ 'panel-right': showRegister }">
        <div class="panel-content">
          <h1 class="welcome-title" style="color: #409EFF;">{{ showRegister ? 'Welcome Back!' : 'Hello, Welcome!' }}</h1>
          <p class="welcome-text">{{ showRegister ? 'Already have an account?' : 'Don\'t have an account?' }}</p>
          <!-- Icon CTA (replaces button) -->
          <div
            class="panel-cta"
            @click="toggleForm"
            @keydown.enter.space="toggleForm"
            :aria-label="showRegister ? 'Go to Login' : 'Go to Register'"
            role="button"
            tabindex="0"
          >
            <!-- Login icon when on Register panel -->
            <svg v-if="showRegister" class="cta-icon" viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M10 3a1 1 0 0 1 1-1h7a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-7a1 1 0 1 1 0-2h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 1-1-1z"/>
              <path d="M13.707 11.293a1 1 0 0 0-1.414 1.414l2.586 2.586a1 1 0 0 0 1.414-1.414L15.414 13H4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H4a3 3 0 1 1 0-6h8a1 1 0 1 0 0-2H4a5 5 0 0 0 0 10h11.414l1.879 1.879a3 3 0 1 1-4.243 4.243l-2.586-2.586a3 3 0 0 1 0-4.243l2.243-2.243z" fill-opacity="0"/>
              <path d="M12.293 7.293a1 1 0 0 1 1.414 0L17 10.586a2 2 0 0 1 0 2.828l-3.293 3.293a1 1 0 1 1-1.414-1.414L14.586 12 12.293 9.707a1 1 0 0 1 0-1.414z"/>
            </svg>
            <!-- Register icon when on Login panel -->
            <svg v-else class="cta-icon" viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5z"/>
              <path d="M19 8a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 0 1 1-1z"/>
            </svg>
            <div class="cta-label">{{ showRegister ? 'Login' : 'Register' }}</div>
          </div>
        </div>
      </div>

      <!-- Right Panel (Login Form) -->
      <div class="panel form-panel" :class="{ 'panel-left': showRegister }">
        <div class="panel-content">
          <h2 class="form-title">{{ showRegister ? 'Register' : 'Login' }}</h2>

          <!-- Login Form -->
          <div v-if="!showRegister" class="form">
            <el-form :model="loginForm" ref="loginFormRef" @submit.prevent>
              <el-form-item prop="username" class="arc-input">
                <el-input
                  v-model="loginForm.username"
                  placeholder="Username"
                  :prefix-icon="User"
                  clearable
                  size="large"
                  autocomplete="username"
                />
              </el-form-item>

              <el-form-item prop="password" class="arc-input">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="Password"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                  size="large"
                  autocomplete="current-password"
                />
              </el-form-item>

              <div class="forgot-password">
                <a href="#">Forgot password?</a>
              </div>

              <DangerButton type="primary" class="submit-button" @click="handleLogin">
                <span style="color: white!important;">Login</span>
              </DangerButton>


            </el-form>
          </div>

          <!-- Register Form -->
          <div v-else class="form">
            <el-form :model="registerForm" ref="registerFormRef" @submit.prevent>
              <el-form-item prop="username" class="arc-input">
                <el-input v-model="registerForm.username" placeholder="username" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password" class="arc-input">
                <el-input v-model="registerForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <el-form-item prop="confirmPassword" class="arc-input"  >
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="Confirm Password"
                  :prefix-icon="Lock" />
              </el-form-item>

              <DangerButton type="primary" class="submit-button" @click="handleRegister">
                <span style="color: white;">Register</span>
              </DangerButton>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ==================== 导入依赖 ====================
// Vue核心
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

// Element Plus
import { User, Lock } from '@element-plus/icons-vue';

// 本地组件
import DangerButton from '@/components/form/DangerButton.vue';

// API接口
import { registerService, loginService } from '@/api/user';

// Stores
import { useUserInfoStore } from '@/stores/user';

// 工具函数
import ArcMessage from '@/utils/ArcMessage';

// ==================== 路由和Store ====================
const router = useRouter();
const userInfoStore = useUserInfoStore();

// ==================== 响应式数据 ====================
// #region 数据存储
// UI状态
const showRegister = ref(false); // 是否显示注册表单

// 表单数据
const loginForm = reactive({ // 登录表单数据
  username: '',
  password: ''
});

const registerForm = reactive({ // 注册表单数据
  username: '',
  password: '',
  confirmPassword: ''
});

// 表单引用
const loginFormRef = ref(null); // 登录表单DOM引用
const registerFormRef = ref(null); // 注册表单DOM引用
// #endregion

// #region 表单操作
/**
 * 切换登录/注册表单
 */
const toggleForm = () => {
  showRegister.value = !showRegister.value;
};
// #endregion

// #region 登录处理
/**
 * 处理用户登录
 */
const handleLogin = async () => {
  try {
    if (!loginForm.username || !loginForm.password) {
      ArcMessage.error('请填写完整的登录信息')
      return
    }
    
    const res = await loginService({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 200) {
      ArcMessage.success('登录成功')
      // 使用 store 存储用户信息
      userInfoStore.setUserInfo(res.data)
      // 登录成功后建立 WebSocket 连接
      userInfoStore.connectWebSocket(res.data.token);
      // 跳转到首页
      router.push('/userHub')
    } else {
     
    }
  } catch (error) {
  }
};
// #endregion

// #region 注册处理
const handleRegister = async () => {
  try {
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      ArcMessage.error('请填写完整的注册信息')
      return
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      ArcMessage.error('两次输入的密码不一致')
      return
    }

    if (registerForm.password.length < 6 || registerForm.password.length > 20) {
      ArcMessage.error('密码长度必须在6-20位之间')
      return
    }
    
    const res = await registerService({
      username: registerForm.username,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    })
    
    if (res.code === 200) {
      ArcMessage.success('注册成功')
      // 切换到登录表单
      showRegister.value = false
      // 清空注册表单
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      ArcMessage.error(res.msg || '注册失败')
    }
  } catch (error) {
    ArcMessage.error('注册失败，请稍后重试')
    console.error('注册错误:', error)
  }
}
// #endregion

// 回到首页方法
const goToChat = () => {
  router.push('/chat')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* 左右双色渐变背景：左蓝右绿 */
  background: linear-gradient(120deg, #e3f0ff 0%, #b3e5fc 40%, #eafff3 100%);
  position: relative;
  overflow: hidden;
}

.login-svg-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 420px;
  height: 320px;
  pointer-events: none;
  opacity: 0.92;
}

/* 新增右侧渐变装饰 */
.login-svg-bg-right {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  width: 340px;
  height: 260px;
  pointer-events: none;
  opacity: 0.85;
}

/* 添加 logo 样式 */
.logo {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 10;


}


.logo img {
  height: 80px;
  width: auto;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: all 0.3s ease;
}
.logo img:hover {
  transform: scale(1.05);
}
.form-wrapper {
  position: relative;
  width:950px;
  height: 550px;
  border-radius: 25px;
  overflow: hidden;
  display: flex;
  background: #fff;
  /* 3D立体效果：多层阴影+微透视 */
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.10),
    0 1.5px 8px 0 rgba(64, 158, 255, 0.08),
    0 24px 48px 0 rgba(64, 158, 255, 0.10),
    0 1.5px 32px 0 rgba(30, 41, 88, 0.10);

  transition: box-shadow 0.4s, transform 0.4s;
}

.panel {
  position: relative;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-panel {
  /* register 左侧绿色渐变 */
  background: linear-gradient(135deg, #eafff3 0%, #7ed957 100%);
  color: #222;
    border-radius: 20px 80% 20px 20px;
  transform: translateX(0);
  transition: background 0.5s;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10),
    0 1.5px 8px 0 rgba(64, 158, 255, 0.08),
    0 24px 48px 0 rgba(64, 158, 255, 0.10),
    0 1.5px 32px 0 rgba(30, 41, 88, 0.10);
}

.form-panel {
  /* login 右侧蓝色渐变 */
  transform: translateX(0);
  transition: background 0.5s;
}

/* 切换时左右 panel 互换渐变色 */
.show-register .welcome-panel {
  background: linear-gradient(135deg, #e3f0ff 0%, #409EFF 100%);
  transform: translateX(100%);
  border-radius: 0px 20px 20px 80%;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10),
    0 1.5px 8px 0 rgba(64, 158, 255, 0.08),
    0 24px 48px 0 rgba(64, 158, 255, 0.10),
    0 1.5px 32px 0 rgba(30, 41, 88, 0.10);
}

.show-register .form-panel {
  transform: translateX(-100%);
  border-radius: 20px 0 0 20px;
  border-left: none;
}

.panel-content {
  padding: 30px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 2.7rem;
  line-height: 1.25;
  margin-top: 18px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #1a8cff;
  text-shadow: 0 4px 16px rgba(64,158,255,0.10), 0 1.5px 8px 0 rgba(64, 158, 255, 0.08);
}

.welcome-text {
  margin-bottom: 40px;
  font-size: 1.08rem;
  line-height: 1.4;
  color: #3a3a3a;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 3.1rem;
  color: #06aa06;
  font-weight: 800;
  letter-spacing: 1.2px;
}

/* Pixel font for background panel texts */

.welcome-text
 {
  font-family: 'Press Start 2P', monospace;
}

.action-button {
  border: none;
  color: #fff;
  font-size: 1.08rem;
  font-weight: 700;

  letter-spacing: 1px;
}

.panel-cta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  cursor: pointer;
  user-select: none;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.12);
  transition: transform .15s ease, box-shadow .25s ease, background .25s ease;
}

.panel-cta:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.35), 0 10px 30px rgba(31, 38, 135, 0.18);
}

.panel-cta:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.24);
  box-shadow: 0 12px 28px rgba(31, 38, 135, 0.16);
}

.cta-icon {
  width: 40px;
  height: 40px;
  fill: #ffffff;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18));
}

.cta-label {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.16);
}

.form {
  width: 100%;
}

/* 输入框美化：仅作用于 .arc-input 表单项，避免全局污染 */
/* 基础外观 */
:deep(.arc-input .el-input__wrapper) {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  border: 1px solid rgba(64, 158, 255, 0.18);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.06);
  transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, transform 0.12s ease;
  padding: 2px 14px;
}

/* 悬停与聚焦态：柔和的渐变高亮环 */
:deep(.arc-input .el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.35);
  box-shadow: 0 6px 18px rgba(31, 38, 135, 0.09);
}

:deep(.arc-input .el-input__wrapper.is-focus) {
  background: #ffffff;
  transform: translateY(-1px);
  border-color: transparent;
  box-shadow:
    0 10px 28px rgba(31, 38, 135, 0.12),
    0 0 0 3px rgba(64, 158, 255, 0.18),
    0 0 0 1px rgba(64, 158, 255, 0.28) inset;
}

/* 前后缀图标与占位符颜色 */
:deep(.arc-input .el-input__prefix),
:deep(.arc-input .el-input__suffix) {
  color: #7aa7ff;
}

:deep(.arc-input .el-input__inner) {
  color: #1f2937;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: transparent;
}

:deep(.arc-input .el-input__inner::placeholder) {
  color: #9aa5b1;
  font-weight: 500;
}

/* 校验错误态 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: rgba(239, 68, 68, 0.45) !important;
  box-shadow: 0 10px 28px rgba(31, 38, 135, 0.08), 0 0 0 3px rgba(239, 68, 68, 0.16) !important;
}

.forgot-password {
  text-align: right;
  margin: 10px 0 20px;
}

.forgot-password a {
  color: #409EFF;
  font-weight: 500;
  text-decoration: underline dotted;
  font-size: 0.98rem;
  transition: color 0.2s;
}
.forgot-password a:hover {
  color: #1AAD19;
}

.submit-button {
  width: 100%;
  border: none;
  font-size: 1.08rem;
  font-weight: 700;

  margin-top: 12px;
  letter-spacing: 1px;

}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-wrapper {
    width: 95%;
    height: auto;
    flex-direction: column;
  }

  .panel {
    width: 100%;
    height: auto;
    min-height: 300px;
  }

  .welcome-panel {
    border-radius: 20px 20px 0 0;
    padding: 30px 0;
    transform: translateY(0);
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  .form-panel {
    border-radius: 0 0 20px 20px;
    padding: 30px 0;
    transform: translateY(0);
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* 移动端垂直切换动画 */
  .show-register .welcome-panel {
    transform: translateY(100%);
    border-radius: 0 0 20px 20px;
    border-bottom: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  .show-register .form-panel {
    transform: translateY(-100%);
    border-radius: 20px 20px 0 0;
    border-top: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  .logo {
    top: 20px;
    left: 20px;
  }
  
  .logo img {
    height: 32px;
  }
  .login-svg-bg {
    width: 160px;
    height: 80px;
    .login-svg-bg-right {
      width: 120px;
      height: 60px;
    }
    .cta-icon { width: 34px; height: 34px; }
    .cta-label { font-size: 1.1rem; }
  }
}
</style>

