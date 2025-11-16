<template>
<!-- From Uiverse.io by Smit-Prajapati --> 
<div class="container">
  <div class="search-container">
    <textarea 
      class="input" 
      :value="modelValue"
      @input="handleInput"
      @keydown="handleKeydown"
      :placeholder="placeholder"
      :disabled="disabled"
      ref="textareaRef"
      rows="1"
    ></textarea>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24"
      @click="handleSend"
      class="send-icon"
    >
      <path fill="currentColor" fill-rule="evenodd" d="M1.846 7.151a.75.75 0 0 0-.228 1.376l6.517 3.915l6.22-4.355a.75.75 0 0 1 .86 1.229l-6.22 4.355l1.45 7.463a.75.75 0 0 0 1.372.256L22.792 3.94a.75.75 0 0 0-.793-1.133z" clip-rule="evenodd"/>
    </svg>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Ask me anything...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'keydown', 'input', 'send'])
const textareaRef = ref(null)

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  adjustHeight()
}

const handleKeydown = (event) => {
  emit('keydown', event)
  // Enter发送，Shift+Enter换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (!props.disabled && props.modelValue.trim()) {
    emit('send')
  }
}

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 320
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

watch(() => props.modelValue, () => {
  nextTick(() => {
    adjustHeight()
  })
})

onMounted(() => {
  adjustHeight()
})
</script>

<style scoped>
.container {
  position: relative;
  border-radius: 1000px;
  padding: 10px;
  display: grid;
  z-index: 0;
  width: 100%;
  min-height: 65px;
  margin: 0;
}

.search-container {
  position: relative;
  width: 100%;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px;
  display: flex;
  align-items: center;   /* 让按钮和 textarea 垂直居中 */
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  min-height: 55px;
}

.search-container::after, .search-container::before {
  content: "";
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: absolute;
  transition: all 0.3s ease;
}

.search-container::before {
  top: -1px;
  left: -1px;
  background: linear-gradient(0deg, rgb(218, 232, 247) 0%, rgb(255, 255, 255) 100%);
  z-index: -1;
}

.search-container::after {
  bottom: -1px;
  right: -1px;
  background: linear-gradient(0deg, rgb(163, 206, 255) 0%, rgb(211, 232, 255) 100%);
  box-shadow: rgba(79, 156, 232, 0.7019607843) 3px 3px 5px 0px;
  z-index: -2;
}

.input {
  padding: 10px 15px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #1e3a8a;
  font-size: 16px;
  border-radius: 50px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  resize: none;
  overflow-y: auto;
  min-height: 20px;
  max-height: 320px;
  line-height: 1.4;
  font-family: inherit;
}

.input:focus {
  outline: none;
}

.input:focus + .search-container::after {
  box-shadow: 
    rgba(79, 156, 232, 0.4) 0px 0px 5px,
    rgba(79, 156, 232, 0.3) 0px 0px 10px,
    rgba(79, 156, 232, 0.2) 0px 0px 15px;
}

.search-container:focus-within {
  transform: translateY(-4px);
}

:root[data-theme='dark'] .search-container:focus-within::after {
  box-shadow: 
    rgba(64, 158, 255, 0.7) 0px 5px 10px,
    rgba(64, 158, 255, 0.5) 0px 8px 15px,
    rgba(64, 158, 255, 0.3) 0px 10px 20px;
}

.input::placeholder {
  color: #3b82f6;
  opacity: 0.7;
}

.input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search__icon {
  width: 40px;
  aspect-ratio: 1;
  border-left: 2px solid white;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-radius: 50%;
  padding-left: 12px;
  margin-right: 10px;
  flex-shrink: 0;
}

.search__icon:hover {
  border-left: 3px solid white;
}

.search__icon path {
  fill: white;
}

:root[data-theme='dark'] .container {
  background: linear-gradient(135deg, rgba(179, 208, 253, 0.2) 0%, rgba(164, 202, 248, 0.2) 100%);
}

:root[data-theme='dark'] .search-container {
  background: linear-gradient(135deg, rgba(218, 232, 247, 0.1) 0%, rgba(214, 229, 247, 0.1) 100%);
}

:root[data-theme='dark'] .input {
  background: transparent;
  color: #60a5fa;
}

:root[data-theme='dark'] .input::placeholder {
  color: #93c5fd;
  opacity: 0.7;
}

:root[data-theme='dark'] .input:focus {
  background: rgba(255, 255, 255, 0.05);
}

:root[data-theme='dark'] .search__icon {
  border-left-color: var(--el-color-primary);
}

:root[data-theme='dark'] .search__icon path {
  fill: var(--el-color-primary);
}

:root[data-theme='dark'] .send-icon {
  stroke: var(--el-color-primary);
  fill: var(--el-color-primary);
}

:root[data-theme='dark'] .send-icon:hover {
  stroke: var(--el-color-primary-light-3);
  fill: var(--el-color-primary-light-3);
}

.send-icon {
  width: 38px;
  height: 38px;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  stroke: #9EBCD9;
  stroke-width: 2;
  fill: #9EBCD9;
}

.send-icon:hover {
  transform: scale(1.1);
  stroke: #4F9CE8;
  fill: #4F9CE8;
}

.send-icon:active {
  transform: scale(0.95);
}

/* 自定义滚动条样式 */
.input::-webkit-scrollbar {
  width: 6px;
}

.input::-webkit-scrollbar-track {
  background: transparent;
}

.input::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.input::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
</style>

