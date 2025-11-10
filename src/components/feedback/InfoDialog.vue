<template>
  <div v-if="visible" class="info-notification">
    <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
        fill="#409eff"
      ></path>
    </svg>
    <div class="info-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#409eff"/>
      </svg>
    </div>
    <div class="info-content">
      <div class="info-title">{{ title }}</div>
      <div class="info-message" v-if="message">{{ message }}</div>
      <slot></slot>
    </div>
    <div class="info-close" @click="$emit('close')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#909399"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:visible', 'close'])
const close = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
/* Simple working animation like SuccessTips */
.info-notification {
  animation: slideInFromTop 0.4s ease-out;
}

@keyframes slideInFromTop {
  0% {
    opacity: 0;
    transform: translateX(50%) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(50%) translateY(0);
  }
}

.info-notification {
  overflow: hidden;
  z-index: 10000000;
  position: fixed;
  top: 30px;
  height: 50px;
  right: 50%;
  transform: translateX(50%);
  min-width: 380px;
  padding: 15px 16px;
  border-radius: 4px;
  border: 1px solid #e1f3ff;
  background-color: #f4f9ff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 15px;
  pointer-events: auto;
}
.wave {
  position: absolute;
  transform: rotate(90deg);
  left: -31px;
  top: 32px;
  width: 80px;
}
.icon-container {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1d56f1f1;
  border-radius: 50%;
  margin-left: 8px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-title {
  color: #409EFF;
  font-weight: 600;
  margin: 0;
}

.info-message {
  color: #909399;
  font-size: 13px;
  margin: 0;
}

.info-close {
  flex-shrink: 0;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.info-close {
  flex-shrink: 0;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
  pointer-events: auto;
}

.info-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

</style>

