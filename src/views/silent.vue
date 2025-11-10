<template>
  <div class="fog-container">
    <!-- 主背景 -->
    <div class="background"></div>
    
    <!-- 多层迷雾效果 -->
    <div class="fog-layer fog-layer-1"></div>
    <div class="fog-layer fog-layer-2"></div>
    <div class="fog-layer fog-layer-3"></div>
    <div class="fog-layer fog-layer-4"></div>
    <div class="fog-layer fog-layer-5"></div>
    <div class="fog-layer fog-layer-6"></div>
    
    <!-- 动态迷雾粒子 -->
    <div 
      v-for="particle in fogParticles" 
      :key="particle.id"
      class="fog-particle"
      :style="{
        left: particle.x + '%',
        top: particle.y + '%',
        animationDelay: particle.delay + 's',
        animationDuration: particle.duration + 's',
        transform: `scale(${particle.scale})`
      }"
    ></div>
    
    <!-- 内容区域 -->
    <div class="content">
      <h1 class="title">Silent Hill</h1>
      <p class="subtitle">Welcome to the fog...</p>
    </div>
  </div>
</template>

<script setup>
// #region 导入依赖
// Vue核心
import { ref, onMounted } from 'vue';
// #endregion

// #region 响应式数据
const fogParticles = ref([]);
// #endregion

// #region 工具函数
// 生成随机迷雾粒子
const generateFogParticles = () => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20,
      scale: 0.5 + Math.random() * 1.5
    });
  }
  fogParticles.value = particles;
};
// #endregion

// #region 生命周期钩子
onMounted(() => {
  generateFogParticles();
  
  // 定期重新生成粒子位置
  setInterval(() => {
    generateFogParticles();
  }, 30000);
});
// #endregion
</script>

<style scoped>
.fog-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000 70%);
}

.fog-layer {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(128, 128, 128, 0.3) 0%, transparent 70%);
  animation: fogMove 20s infinite linear;
}

.fog-layer-1 {
  top: -50%;
  left: -50%;
  animation-duration: 25s;
  animation-delay: 0s;
}

.fog-layer-2 {
  top: -30%;
  left: -30%;
  animation-duration: 30s;
  animation-delay: -5s;
  animation-direction: reverse;
}

.fog-layer-3 {
  top: -40%;
  left: -60%;
  animation-duration: 35s;
  animation-delay: -10s;
  background: radial-gradient(circle, rgba(100, 100, 100, 0.2) 0%, transparent 60%);
}

.fog-layer-4 {
  top: -20%;
  left: -40%;
  animation-duration: 28s;
  animation-delay: -15s;
  animation-direction: reverse;
  background: radial-gradient(circle, rgba(90, 90, 90, 0.25) 0%, transparent 65%);
}

.fog-layer-5 {
  top: -60%;
  left: -20%;
  animation-duration: 32s;
  animation-delay: -8s;
  background: radial-gradient(circle, rgba(110, 110, 110, 0.15) 0%, transparent 75%);
}

.fog-layer-6 {
  top: -35%;
  left: -55%;
  animation-duration: 27s;
  animation-delay: -12s;
  animation-direction: reverse;
  background: radial-gradient(circle, rgba(85, 85, 85, 0.3) 0%, transparent 55%);
}

.fog-particle {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(120, 120, 120, 0.4) 0%, rgba(80, 80, 80, 0.2) 30%, transparent 70%);
  border-radius: 50%;
  animation: particleFloat 20s infinite ease-in-out;
  pointer-events: none;
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  color: #ccc;
}

.title {
  font-size: 4rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  font-family: 'Arial', sans-serif;
  letter-spacing: 3px;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.subtitle {
  font-size: 1.5rem;
  margin: 20px 0 0 0;
  opacity: 0.8;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  animation: subtitleFade 4s ease-in-out infinite alternate;
}

@keyframes fogMove {
  0% {
    transform: translate(-10%, -10%) rotate(0deg);
  }
  25% {
    transform: translate(5%, -15%) rotate(90deg);
  }
  50% {
    transform: translate(-5%, 10%) rotate(180deg);
  }
  75% {
    transform: translate(-15%, 5%) rotate(270deg);
  }
  100% {
    transform: translate(-10%, -10%) rotate(360deg);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-30px) translateX(20px) scale(1.2);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) translateX(-15px) scale(0.8);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-40px) translateX(10px) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.3;
  }
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3);
  }
}

@keyframes subtitleFade {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 0.9;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .fog-particle {
    width: 200px;
    height: 200px;
  }
}
</style>

