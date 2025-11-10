<template>
  <transition name="slide-fade">
    <div v-if="show" class="incoming-call-notification">
      <div class="caller-info">
        <el-avatar :size="50" :src="caller.avatar" class="caller-avatar"></el-avatar>
        <div class="caller-details">
          <div class="caller-name">{{ caller.name }}</div>
          <div class="call-type">正在邀请您进行语音通话...</div>
        </div>
      </div>
      <div class="action-buttons">
        <!-- 拒绝按钮 -->
        <div class="btn-wrapper reject-wrapper">
          <div class="ripple-effect reject-ripple"></div>
          <div class="ripple-effect reject-ripple"></div>
          <div class="ripple-effect reject-ripple"></div>
          <el-button type="danger" circle @click="onReject" class="action-btn reject-btn">
            <PhoneOff :size="28" color="white"/>
          </el-button>
        </div>
        
        <!-- 接受按钮 -->
        <div class="btn-wrapper accept-wrapper">
          <div class="ripple-effect accept-ripple"></div>
          <div class="ripple-effect accept-ripple"></div>
          <div class="ripple-effect accept-ripple"></div>
          <el-button type="success" circle @click="onAccept" class="action-btn accept-btn">
            <Phone :size="28" color="white"/>
          </el-button>
        </div>
      </div>

    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useCallStore } from '@/stores/call';
import { Phone, PhoneOff } from 'lucide-vue-next';

const callStore = useCallStore();

const show = computed(() => callStore.showIncomingCallNotification);
const caller = computed(() => callStore.incomingCallInfo);

const onAccept = () => {
  callStore.acceptCall();
};

const onReject = () => {
  callStore.rejectCall();
};
</script>

<style scoped>
.incoming-call-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  padding: 25px;
  background: rgba(51, 50, 50, 0.05);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.18);
  color: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.caller-info {
  display: flex;
  align-items: center;
  width: 100%;
  z-index: 1;
}

.caller-avatar {
  margin-right: 15px;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.caller-details {
  display: flex;
  flex-direction: column;
}

.caller-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.call-type {
  font-size: 0.9rem;
  color: #928b8b;
}

.action-buttons {
  margin-top: 25px;
  display: flex;
  justify-content: space-around;
  width: 100%;
  z-index: 1;
}

/* 按钮包装器 */
.btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
}

/* 基础按钮样式 */
.action-btn {
  width: 60px;
  height: 60px;
  font-size: 28px;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
  animation: heartbeat 1.5s ease-in-out infinite;
}

/* 拒绝按钮样式 */
.reject-btn {
  background: linear-gradient(145deg, #ff4d4f, #ff7875);
  border: none;
  box-shadow: 
    0 0 20px rgba(255, 77, 79, 0.6),
    0 0 40px rgba(255, 77, 79, 0.4),
    0 0 60px rgba(255, 77, 79, 0.2),
    inset 0 0 20px rgba(255, 255, 255, 0.1);

}

.reject-btn:hover {
  transform: scale(1.1);
  box-shadow: 
    0 0 30px rgba(255, 77, 79, 0.8),
    0 0 60px rgba(255, 77, 79, 0.6),
    0 0 90px rgba(255, 77, 79, 0.4),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

/* 接受按钮样式 */
.accept-btn {
  background: linear-gradient(145deg, #52c41a, #73d13d);
  border: none;
  box-shadow: 
    0 0 20px rgba(82, 196, 26, 0.6),
    0 0 40px rgba(82, 196, 26, 0.4),
    0 0 60px rgba(82, 196, 26, 0.2),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.accept-btn:hover {
  transform: scale(1.1);
  box-shadow: 
    0 0 30px rgba(82, 196, 26, 0.8),
    0 0 60px rgba(82, 196, 26, 0.6),
    0 0 90px rgba(82, 196, 26, 0.4),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

/* 水波涟漪效果 */
.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
}

/* 拒绝按钮涟漪 */
.reject-ripple {
  border: 2px solid rgba(255, 77, 79, 0.6);
  animation: ripple-reject 2s infinite ease-out;
}

.reject-ripple:nth-child(1) {
  animation-delay: 0s;
}

.reject-ripple:nth-child(2) {
  animation-delay: 0.7s;
}

.reject-ripple:nth-child(3) {
  animation-delay: 1.4s;
}

/* 接受按钮涟漪 */
.accept-ripple {
  border: 2px solid rgba(82, 196, 26, 0.6);
  animation: ripple-accept 2s infinite ease-out;
}

.accept-ripple:nth-child(1) {
  animation-delay: 0s;
}

.accept-ripple:nth-child(2) {
  animation-delay: 0.7s;
}

.accept-ripple:nth-child(3) {
  animation-delay: 1.4s;
}





@keyframes ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

/* 心脏跳动动画 */
@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.05);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(1);
  }
}



/* 接受按钮涟漪动画 */
@keyframes ripple-accept {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
    border-color: rgba(82, 196, 26, 0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.4;
    border-color: rgba(82, 196, 26, 0.4);
  }
  100% {
    transform: translate(-50%, -50%) scale(3.5);
    opacity: 0;
    border-color: rgba(82, 196, 26, 0);
  }
}

/* Transition */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>


