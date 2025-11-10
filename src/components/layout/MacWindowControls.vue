<template>
  <div class="mac-window-controls">
    <div class="control-button close" @click="handleClose">
      <div class="control-icon"></div>
    </div>
    <div class="control-button minimize" @click="handleMinimize">
      <div class="control-icon"></div>
    </div>
    <div class="control-button maximize">
      <div class="control-icon"></div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close', 'minimize']);

const handleClose = () => {
  emit('close');
};

const handleMinimize = () => {
  emit('minimize');
};
</script>

<style scoped>
.mac-window-controls {
  display: flex;
  gap: 8px;
  padding: 8px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button .control-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.control-button:hover .control-icon {
  opacity: 1;
}

.close {
  background-color: #ff5f57;
}

.minimize {
  background-color: #febc2e;
}

.maximize {
  background-color: #28c840;
}

.close:hover {
  background-color: #ff3b30;
}

.minimize:hover {
  background-color: #ffcc00;
}

.maximize:hover {
  background-color: #34c759;
}

/* 暗色模式适配 */
:deep(.dark-mode) .mac-window-controls {
  filter: brightness(0.8);
}
</style> 

