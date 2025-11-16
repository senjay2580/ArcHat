<template>
  <div class="streaming-text-container">
    <div 
      class="streaming-content" 
      v-html="renderedContent"
      @click="handleClick"
    ></div>
    <span v-if="isStreaming" class="streaming-cursor">▊</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  renderMarkdown: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['complete'])

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

// 简单高效的文本转义
const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 渲染内容
const renderedContent = computed(() => {
  if (!props.content) return ''
  
  if (props.renderMarkdown && !props.isStreaming) {
    // 只有在非流式状态下才进行Markdown渲染
    try {
      return md.render(props.content)
    } catch (error) {
      console.warn('Markdown渲染失败:', error)
      return escapeHtml(props.content).replace(/\n/g, '<br>')
    }
  } else {
    // 流式状态下显示纯文本，性能最优
    return escapeHtml(props.content).replace(/\n/g, '<br>')
  }
})

// 监听流式状态变化
watch(() => props.isStreaming, (newVal) => {
  if (!newVal) {
    emit('complete')
  }
})

const handleClick = () => {
  // 可以添加点击事件，比如复制文本
}
</script>

<style scoped>
.streaming-text-container {
  display: flex;
  align-items: flex-end;
  width: 100%;
  min-height: 1.5em;
}

.streaming-content {
  flex: 1;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  color: #2d3748;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.streaming-cursor {
  color: #3b82f6;
  animation: pulse 0.8s infinite;
  margin-left: 2px;
  font-weight: bold;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 暗色模式支持 */

.dark-mode .streaming-cursor {
  color: #60a5fa !important;
}
</style>
