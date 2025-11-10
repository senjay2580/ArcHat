<template>
  <div class="card">
    <div class="header">
      <button class="dismiss" type="button" @click="$emit('close')">×</button>
      <div class="image">
        <div class="icon-wrapper">
          <div class="glow"></div>
          <svg class="checkmark-svg" width="80" height="80" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" fill="#4CAF50"/>
            <path class="checkmark-path" d="M14 27l7.5 7.5L38 18" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>
      <div class="content">
        <span class="title">{{ title }}</span>
        <p class="message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '操作成功'
  },
  message: {
    type: String,
    default: '您的操作已成功完成'
  }
});

defineEmits(['close']);
</script>

<style scoped>
/* From Uiverse.io by rzouga001 */
.card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: transparent;

  width: 380px;
  border: 0;
  border-radius: 24px;
  box-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.15);
  padding: 40px;
  text-align: center;
  animation: fadeInScale 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards, bobbing 3s ease-in-out infinite;
  z-index: 10000;
}
.dark-mode .card {
  background-color: transparent;
  border: 0 ;
}
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes bobbing {
  0% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
  100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
}

.dismiss {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #ccc;
  transition: color 0.2s ease, transform 0.2s ease;
}

.dismiss:hover {
  color: #d41212;
  transform: scale(1.5);
}

.header {
  padding: 0;
}

.icon-wrapper {
  position: relative;
  margin: 0 auto 25px auto;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glow {
  position: absolute;
  width: 120px;
  height: 120px;
  background-image: radial-gradient(circle, rgba(76, 175, 80, 0.5) 0%, rgba(76, 175, 80, 0) 70%);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}

.checkmark-path {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw 0.5s 0.3s ease-out forwards;
}

.content {
  margin-top: 0;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(45deg, #219224, #33e769);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.message {
  color: #918e8e;
  font-size: 1.1rem;
  line-height: 1.6;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>

