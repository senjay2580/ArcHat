<template>
  <div class="typewriter-container">
    <div class="typewriter-text" v-html="displayedText"></div>
    <span v-if="isTyping" class="cursor">▊</span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 30 // 字符/秒
  },
  autoStart: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['complete', 'typing'])

const displayedText = ref('')
const isTyping = ref(false)
let animationId = null
let currentIndex = 0
let lastTime = 0

// Markdown渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code class="hljs language-' + lang + '">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (__) { }
    }
    return '<pre class="hljs"><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 打字机动画函数
const typeWriter = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  
  const elapsed = timestamp - lastTime
  const interval = 1000 / props.speed // 每个字符的间隔时间
  
  if (elapsed >= interval) {
    if (currentIndex < props.text.length) {
      currentIndex++
      const currentText = props.text.substring(0, currentIndex)
      
      // 实时渲染Markdown（只渲染当前部分）
      try {
        displayedText.value = md.render(currentText)
      } catch (error) {
        // 如果Markdown渲染失败，显示纯文本
        displayedText.value = currentText.replace(/\n/g, '<br>')
      }
      
      emit('typing', currentIndex, props.text.length)
      lastTime = timestamp
    } else {
      // 打字完成
      isTyping.value = false
      emit('complete')
      return
    }
  }
  
  animationId = requestAnimationFrame(typeWriter)
}

// 开始打字动画
const startTyping = () => {
  if (isTyping.value || !props.text) return
  
  isTyping.value = true
  currentIndex = 0
  lastTime = 0
  displayedText.value = ''
  animationId = requestAnimationFrame(typeWriter)
}

// 停止打字动画
const stopTyping = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  isTyping.value = false
}

// 立即显示完整文本
const showComplete = () => {
  stopTyping()
  currentIndex = props.text.length
  try {
    displayedText.value = md.render(props.text)
  } catch (error) {
    displayedText.value = props.text.replace(/\n/g, '<br>')
  }
  emit('complete')
}

// 监听文本变化
watch(() => props.text, (newText) => {
  if (newText && props.autoStart) {
    startTyping()
  }
}, { immediate: true })

onMounted(() => {
  if (props.text && props.autoStart) {
    startTyping()
  }
})

onUnmounted(() => {
  stopTyping()
})

// 暴露方法
defineExpose({
  startTyping,
  stopTyping,
  showComplete,
  isTyping: () => isTyping.value
})
</script>

<style scoped>
.typewriter-container {
  display: inline-flex;
  align-items: flex-end;
  width: 100%;
}

.typewriter-text {
  flex: 1;
  line-height: 1.6;
  word-wrap: break-word;
}

.cursor {
  color: #3b82f6;
  animation: blink 1s infinite;
  margin-left: 2px;
  font-weight: bold;
  align-self: flex-end;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 继承父级样式 */
.typewriter-text :deep(p) {
  margin: 0.3em 0;
}

.typewriter-text :deep(pre) {
  margin: 0.5em 0;
  border-radius: 8px;
  overflow-x: auto;
}

.typewriter-text :deep(code) {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}
</style>
