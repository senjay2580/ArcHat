<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <!-- 主要内容区域 -->
      <div class="content">
        <!-- 背景装饰元素 -->
        <div class="background-decorations">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>

        <!-- SVG 插图 -->
        <div class="svg-container">
          <div class="svg-wrapper">
            <svg 
              class="not-found-svg"
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- 外圈装饰 -->
              <circle cx="200" cy="200" r="180" stroke="url(#gradient1)" stroke-width="2" fill="none" opacity="0.3" class="spin-slow"/>
              
              <!-- 主要图形 - 404 数字 -->
              <g transform="translate(50, 120)">
                <!-- 4 -->
                <path d="M20 0 L20 60 L60 60 L60 40 L40 40 L40 0 Z M60 0 L60 80 L80 80 L80 0 Z" 
                      fill="url(#gradient2)" class="float-animation"/>
                
                <!-- 0 -->
                <ellipse cx="150" cy="40" rx="30" ry="40" fill="none" stroke="url(#gradient2)" stroke-width="8" class="float-animation delay-200"/>
                
                <!-- 4 -->
                <path d="M220 0 L220 60 L260 60 L260 40 L240 40 L240 0 Z M260 0 L260 80 L280 80 L280 0 Z" 
                      fill="url(#gradient2)" class="float-animation delay-400"/>
              </g>

              <!-- 装饰性元素 -->
              <g class="bounce-slow">
                <circle cx="100" cy="300" r="8" fill="#3B82F6" opacity="0.6"/>
                <circle cx="300" cy="100" r="6" fill="#8B5CF6" opacity="0.6"/>
                <circle cx="320" cy="320" r="10" fill="#EC4899" opacity="0.6"/>
              </g>

              <!-- 渐变定义 -->
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>

            <!-- 浮动装饰点 -->
            <div class="floating-dot dot-1"></div>
            <div class="floating-dot dot-2"></div>
          </div>
        </div>

        <!-- 文字内容 -->
        <div class="text-content">
          <h1 class="title">
            Page Not Found
          </h1>
          
          <div class="description">
            <p class="subtitle">
              Oops! Looks like this page got lost in the digital universe
            </p>
            <p class="message">
              Don't worry, it happens to the best of us. Let's get you back on track to continue your amazing journey.
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <button 
            @click="goHome"
            class="primary-button"
          >
            <span class="button-content">
              <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Back to Home
            </span>
          </button>
        </div>

        <!-- 底部提示 -->
        <div class="footer">
          <p class="footer-text">
            3381335358@qq.com
          </p>
          <div class="footer-links">
            <a href="#" class="footer-link">
              <svg class="link-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Help Center
            </a>
            <a href="#" class="footer-link">
              <svg class="link-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const searchSite = () => {
  const searchQuery = prompt('请输入您要搜索的内容：')
  if (searchQuery) {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

.content-wrapper {
  max-width: 64rem;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* 移除所有装饰性背景效果 */
.not-found-container::before,
.not-found-container::after {
  display: none;
}

/* 移除装饰性圆圈 */
.background-decorations {
  display: none;
}

/* 移除浮动点 */
.floating-dot {
  display: none;
}

.content {
  position: relative;
}

.svg-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.svg-wrapper {
  position: relative;
}

.not-found-svg {
  width: 20rem;
  height: 20rem;
  transform: scale(1);
  transition: transform 0.5s;
}

.not-found-svg:hover {
  transform: scale(1.05);
}

.text-content {
  margin-bottom: 3rem;
}

.title {
  font-size: 4rem;
  font-weight: bold;
  background: linear-gradient(to right, #00f2fe, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeIn 1s ease-out;
  text-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
}

.subtitle {
  font-size: 1.5rem;
  color: #e2e8f0;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.message {
  font-size: 1.125rem;
  color: #94a3b8;
  max-width: 32rem;
  margin: 0 auto;
  line-height: 1.75;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 4rem;
}

.primary-button {
  position: relative;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #00f2fe, #4facfe);
  color: white;
  font-weight: 600;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
  transform: translateY(0);
  transition: all 0.3s;
  overflow: hidden;
  border: none;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.primary-button:hover::before {
  left: 100%;
}

.button-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-button {
  padding: 1rem 2rem;
  border: 2px solid #d1d5db;
  color: #374151;
  font-weight: 600;
  border-radius: 1rem;
  transform: translateY(0);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-button:hover {
  border-color: #60a5fa;
  color: #2563eb;
  transform: translateY(-2px);
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.footer {
  margin-top: 4rem;
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-link {
  color: #4facfe;
  transition: all 0.3s;
}

.footer-link:hover {
  color: #00f2fe;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.link-icon {
  width: 1rem;
  height: 1rem;
}

/* 动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

.spin-slow {
  animation: spin 20s linear infinite;
}

.bounce-slow {
  animation: float 4s ease-in-out infinite;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-400 {
  animation-delay: 0.4s;
}

@media (min-width: 640px) {
  .button-group {
    flex-direction: row;
  }
  
  .not-found-svg {
    width: 24rem;
    height: 24rem;
  }
}
</style>

