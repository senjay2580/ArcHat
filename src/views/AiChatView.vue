<template>
  <div class="chat-container">
    <!-- 主聊天区域 -->
    <div class="chat-main" :class="{ 'sidebar-open': !sidebarCollapsed, 'has-messages': messages.length > 0 }">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <div class="ai-avatar">
            <el-icon size="20"><User /></el-icon>
          </div>
          <div class="title-info">
            <h2>{{ currentChatTitle }}</h2>
            <span class="model-info">GPT-4</span>
          </div>
        </div>
      </div>

      <!-- 消息列表/欢迎区 -->
      <div class="messages-container" ref="messagesContainer" :class="{ 'empty': messages.length === 0 }">
        <div v-if="messages.length === 0" class="welcome-section ai-welcome-center">
          <div>
            <img src="/src/assets/image/archat.png" alt="" width="120" height="100">
          </div>
          <h1 class="welcome-title">你好，{{ userStore.userInfo.username }}</h1>
          <p class="welcome-subtitle">我可以帮助您解答问题、协助工作、进行创意讨论等。请随时向我提问！</p>
          <div class="ai-input-center">
            <AichatInput 
              v-model="inputMessage"
              @send="sendMessage"
              :disabled="isTyping"
            />
          </div>
        </div>
        <template v-else>
          <div class="messages-list ai-messages-list">
            <div 
              v-for="message in messages" 
              :key="message.id"
              :class="['message', message.type, message.type === 'user' ? 'ai-message-user' : 'ai-message-ai']"
            >
              <div class="message-content">
                <div v-if="message.type === 'user'" class="message-bubble">
                  <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                </div>
                <div v-else class="ai-markdown-message">
                  <div v-html="message.rendered"></div>
                  <!-- 复制按钮 - 只在非加载状态显示 -->
                  <div v-if="!isTyping" class="copy-button-container">
                    <dangerButton type="primary" @click="copyMessageContent(message.content)">
                      <el-icon><Document /></el-icon>
                    </dangerButton>
                  </div>
                </div>
                <div v-if="!isTyping" class="message-time">
                  {{ formatDateTime(message.timestamp) }}
                </div>
                </div>
              </div>
            </div>
            <!-- AI正在输入 -->
            <div v-if="isTyping" class="message ai ai-message-ai" >
              <div class="message-content">
                <div class="message-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>      
            </div>
          </div>
        </template>
      </div>
      <!-- 输入框（有消息时固定底部） -->
      <div v-if="messages.length > 0" class="ai-input-bottom">
        <AichatInput 
          v-model="inputMessage"
          @send="sendMessage"
          :disabled="isTyping"
        />
      </div>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" :class="{ 'sidebar-open': !sidebarCollapsed }" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z"/></svg>
    </div>

    <!-- 右侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-content">
        <!-- 新建对话按钮 -->
        <div class="sidebar-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><mask id="lineMdGithubLoop0" width="24" height="24" x="0" y="0"><g fill="#fff"><ellipse cx="9.5" cy="9" rx="1.5" ry="1"/><ellipse cx="14.5" cy="9" rx="1.5" ry="1"/></g></mask><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="32" stroke-dashoffset="32" d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"><animate attributeName="d" dur="3s" repeatCount="indefinite" values="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5;M9 19c-1.406 0-3-.5-4-.5-.532 0-1 0-2-.5;M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="10;0"/></path></g><rect width="8" height="4" x="8" y="11" fill="currentColor" mask="url(#lineMdGithubLoop0)"><animate attributeName="y" dur="10s" keyTimes="0;0.45;0.46;0.54;0.55;1" repeatCount="indefinite" values="11;11;7;7;11;11"/></rect></svg>
          <span>新会话<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M4 16q-.425 0-.712-.288T3 15t.288-.712T4 14h5q.425 0 .713.288T10 15t-.288.713T9 16zm0-4q-.425 0-.712-.288T3 11t.288-.712T4 10h9q.425 0 .713.288T14 11t-.288.713T13 12zm0-4q-.425 0-.712-.288T3 7t.288-.712T4 6h9q.425 0 .713.288T14 7t-.288.713T13 8zm13 12q-.425 0-.712-.288T16 19v-3h-3q-.425 0-.712-.288T12 15t.288-.712T13 14h3v-3q0-.425.288-.712T17 10t.713.288T18 11v3h3q.425 0 .713.288T22 15t-.288.713T21 16h-3v3q0 .425-.288.713T17 20"/></svg></span>
        </div>
        <!-- 聊天历史 -->
        <div class="chat-history-section">
          <div class="history-title">最近对话</div>
          <div class="chat-history-container">
            <div class="chat-history">
              <div 
                v-for="chat in chatHistory" 
                :key="chat.id"
                :class="['history-item', { active: chat.id === currentChatId }]"
                @click="switchChat(chat.id)"
              >
                <div class="history-content">
                  <div class="history-title">{{ chat.title }}</div>
                  <div class="history-preview">{{ chat.lastMessage }}</div>
                  <div class="history-time">{{ formatDate(chat.timestamp) }}</div>
                </div>
                <el-button 
                  :icon="Delete"
                  size="small"
                  text
                  @click.stop="deleteChat(chat.id)"
                  class="delete-button"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ==================== 导入依赖 ====================
// Vue核心
import { ref, reactive, onMounted, nextTick, computed, onUnmounted } from 'vue';

// Element Plus
import { ElMessage } from 'element-plus';
import { 
  User, 
  Plus,
  Delete,
  Fold,
  Expand,
  ChatDotRound,
  Document,
  QuestionFilled,
  EditPen,
  ArrowRight
} from '@element-plus/icons-vue';

// 本地组件
import AichatInput from '@/components/misc/AichatInput.vue';
import DangerButton from '@/components/form/DangerButton.vue';

// API接口
import { aiChatStream } from '@/api/aichat';

// Stores
import { useUserInfoStore } from '@/stores/user';

// 第三方库
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/xml';
import 'highlight.js/lib/languages/css';
import { marked } from 'marked';
import MarkdownIt from 'markdown-it';

// ==================== Store ====================
const userStore = useUserInfoStore();

// ==================== Markdown渲染器配置 ====================
const renderer = new marked.Renderer();

renderer.code = function(code, infostring, escaped) {
  code = code == null ? '' : String(code)
  const lang = (infostring || '').match(/\S*/)?.[0] || ''
  let highlighted = ''
  try {
    highlighted = lang && hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang }).value
      : hljs.highlightAuto(code).value
  } catch (e) {
    highlighted = hljs.highlightAuto(code).value
  }
  return `<div class="ai-code-block"><div class="apple-window-controls"><div class="control-dot control-dot-red"></div><div class="control-dot control-dot-yellow"></div><div class="control-dot control-dot-green"></div><span class="code-lang">${lang}</span></div><pre><code class="hljs ${lang}">${highlighted}</code></pre></div>`;
};

renderer.codespan = function(code) {
  return `<code class="inline-code">${code}</code>`;
};

renderer.table = function(header, body) {
  return `<table>${header ? `<thead>${header}</thead>` : ''}<tbody>${body}</tbody></table>`;
};

renderer.tablerow = function(content) {
  return `<tr>${content}</tr>`;
};

renderer.tablecell = function(content, flags) {
  const type = flags.header ? 'th' : 'td';
  return `<${type}>${content}</${type}>`;
};

renderer.list = function(body, ordered, start) {
  const type = ordered ? 'ol' : 'ul';
  return `<${type}>${body}</${type}>`;
};

renderer.listitem = function(text, task, checked) {
  return `<li>${text}</li>`;
};

renderer.blockquote = function(quote) {
  return `<blockquote>${quote}</blockquote>`;
};

renderer.paragraph = function(text) {
  return `<p>${text}</p>`;
};

marked.setOptions({
  renderer,
  highlight: function(code, lang) {
    try {
      return lang && hljs.getLanguage(lang)
        ? hljs.highlight(code, { language: lang }).value
        : hljs.highlightAuto(code).value
    } catch (e) {
      return hljs.highlightAuto(code).value
    }
  },
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartypants: false,
  xhtml: false
})

// #region 数据存储
// 输入和UI状态
const inputMessage = ref('') // 当前输入的消息内容
const messagesContainer = ref(null) // 消息容器DOM引用
const currentChatId = ref(1) // 当前选中的聊天ID
const sidebarCollapsed = ref(true) // 侧边栏折叠状态
const isTyping = ref(false) // AI正在打字状态

// 消息列表
const messages = ref([]) // 当前聊天的消息列表

// 聊天历史
const chatHistory = ref([ // 所有聊天会话列表
  { 
    id: 1, 
    title: '新对话', 
    lastMessage: '开始新的对话...',
    timestamp: new Date(),
    messages: []
  },
  { 
    id: 2, 
    title: 'Vue.js 开发问题', 
    lastMessage: '如何在Vue 3中使用Composition API？',
    timestamp: new Date(Date.now() - 86400000),
    messages: []
  },
  { 
    id: 3, 
    title: 'UI设计讨论', 
    lastMessage: '现代化界面设计的原则是什么？',
    timestamp: new Date(Date.now() - 172800000),
    messages: []
  },
  { 
    id: 4, 
    title: 'JavaScript 异步编程', 
    lastMessage: 'Promise和async/await的区别',
    timestamp: new Date(Date.now() - 259200000),
    messages: []
  }
])
// #endregion

// #region 计算属性
/**
 * 当前聊天标题
 */
const currentChatTitle = computed(() => {
  const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
  return currentChat ? currentChat.title : '新对话'
})
// #endregion

// #region 界面控制
/**
 * 切换侧边栏折叠状态
 */
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

/**
 * 处理建议点击
 * @param {string} suggestionText - 建议文本
 */
const handleSuggestion = (suggestionText) => {
  inputMessage.value = suggestionText
  sendMessage()
}
// #endregion

// #region 消息处理

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const userInput = inputMessage.value
  const request = {
    msg: userInput,
    prompt: ""
  }
  inputMessage.value = ''

  updateChatHistory(userInput)
  await nextTick()
  scrollToBottom()
  isTyping.value = true

  let aiMessage = {
    id: Date.now() + 1,
    type: 'ai',
    content: '',
    rendered: '',
    timestamp: new Date()
  }
  messages.value.push(aiMessage)

  try {
    const response = await aiChatStream(request)
    if (!response.body) throw new Error('响应体为空')
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // 不要每次都渲染，等流结束后再渲染
    }
    aiMessage.content = buffer;
    console.log('marked.parse 前 buffer:', buffer);
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        // 处理 Vue 代码块
        if (lang === 'vue') {
          try {
            return '<pre class="hljs"><code class="hljs language-vue">' +
              hljs.highlight(str, { language: 'xml', ignoreIllegals: true }).value +
              '</code></pre>';
          } catch (__) {}
        }
        
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code class="hljs language-' + lang + '">' +
              hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
              '</code></pre>';
          } catch (__) {}
        }
        
        // 如果没有指定语言，尝试自动检测
        try {
          const result = hljs.highlightAuto(str);
          return '<pre class="hljs"><code class="hljs language-' + result.language + '">' +
            result.value + '</code></pre>';
        } catch (__) {}
        
        return '<pre class="hljs"><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    });
    aiMessage.rendered = md.render(buffer);
    console.log('marked.parse 后 rendered:', aiMessage.rendered);
    await nextTick()
    hljs.highlightAll()
    scrollToBottom()
  } catch (error) {
    console.error('AI服务错误:', error)
    ElMessage.error('AI服务暂时不可用，请稍后重试')
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: '抱歉，我现在无法回答您的问题。请稍后再试。',
      rendered: '<p>抱歉，我现在无法回答您的问题。请稍后再试。</p>',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}
// #endregion

// #region 聊天管理
const createNewChat = () => {
  const newChatId = Date.now()
  const newChat = {
    id: newChatId,
    title: '新对话',
    lastMessage: '开始新的对话...',
    timestamp: new Date(),
    messages: []
  }
  
  chatHistory.value.unshift(newChat)
  currentChatId.value = newChatId
  messages.value = []
}

// 切换对话
const switchChat = (chatId) => {
  currentChatId.value = chatId
  // 清理当前对话的Vditor实例
  // cleanupVditorInstances() // 移除 Vditor 实例清理
  // 这里可以加载对应的聊天记录
  messages.value = []
}

// 删除对话
const deleteChat = (chatId) => {
  if (chatHistory.value.length <= 1) return
  
  chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId)
  
  if (currentChatId.value === chatId) {
    currentChatId.value = chatHistory.value[0].id
    // 清理Vditor实例
    // cleanupVditorInstances() // 移除 Vditor 实例清理
    messages.value = []
  }
}

// 更新聊天历史
const updateChatHistory = (message) => {
  const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
  if (currentChat) {
    currentChat.lastMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
    currentChat.timestamp = new Date()
    
    // 如果是新对话，更新标题
    if (currentChat.title === '新对话') {
      currentChat.title = message.length > 20 ? message.substring(0, 20) + '...' : message
    }
  }
}
// #endregion

// #region 工具函数
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 格式化日期时间（完整格式）
const formatDateTime = (date) => {
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化消息内容（支持Markdown和代码高亮）
const formatMessageContent = (content) => {
  if (!content) return ''
  
  // 简单的Markdown处理
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>') // 行内代码
    .replace(/\n/g, '<br>') // 换行
  
  // 代码块处理
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
  })
  
  return formatted
}

// 格式化日期
const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 复制消息内容
const copyMessageContent = (content) => {
  if (!content) return
  
  navigator.clipboard.writeText(content).then(() => {
    ElMessage({
      message: '消息内容已复制到剪贴板',
      type: 'success',
      duration: 2000,
    });
  }).catch(err => {
    console.error('复制失败:', err);
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000,
    });
  });
}

// 渲染 markdown
function renderMarkdown(content) {
  return marked.parse(content || '')
}

// 渲染后给代码块加 Apple 风格
function applyAppleStyleCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.ai-message-ai .message-bubble pre')
  codeBlocks.forEach(block => {
    if (!block.classList.contains('apple-style-applied')) {
      block.classList.add('apple-style-applied')
      const windowControls = document.createElement('div')
      windowControls.className = 'apple-window-controls'
      windowControls.innerHTML = `
        <div class="control-dot control-dot-red"></div>
        <div class="control-dot control-dot-yellow"></div>
        <div class="control-dot control-dot-green"></div>
      `
      block.parentNode.insertBefore(windowControls, block)
    }
  })
}
// #endregion

// #region 生命周期钩子
onMounted(() => {
  scrollToBottom()
  
  // 添加全局代码块切换函数
  window.toggleCodeBlock = (codeId) => {
    const codeBlock = document.getElementById(codeId)
    if (codeBlock) {
      const isCollapsed = codeBlock.classList.contains('collapsed')
      if (isCollapsed) {
        codeBlock.classList.remove('collapsed')
        codeBlock.style.maxHeight = '400px'
      } else {
        codeBlock.classList.add('collapsed')
        codeBlock.style.maxHeight = '0'
      }
      
      // 更新按钮图标
      const toggleButton = codeBlock.previousElementSibling?.querySelector('.code-toggle')
      if (toggleButton) {
        const icon = toggleButton.querySelector('.toggle-icon')
        if (icon) {
          icon.textContent = isCollapsed ? '⋯' : '⋯'
        }
      }
    }
  }
})

onUnmounted(() => {
  // 清理Vditor实例
  // cleanupVditorInstances() // 移除 Vditor 实例清理
  delete window.copyCode
})

window.copyCode = (codeBlockId) => {
  const codeBlock = document.getElementById(codeBlockId);
  if (codeBlock) {
    const codeContent = codeBlock.querySelector('code');
    if (codeContent) {
      const text = codeContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        ElMessage({
          message: '代码已复制到剪贴板',
          type: 'success',
          duration: 2000,
        });
      }).catch(err => {
        console.error('复制失败:', err);
        ElMessage({
          message: '复制失败，请手动复制',
          type: 'error',
          duration: 2000,
        });
      });
    }
  }
};
// #endregion
</script>

<style scoped>

.chat-container {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0;
}



.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px 16px;
  padding-top: 32px; /* 为 MacWindowControls 留出空间 */
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}



.title-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.model-info {
  color: #6e6e80;
  font-size: 12px;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-chat-btn {
  font-size: 14px;
}

.input-container {
  padding: 16px 40px;
  background: var(--el-bg-color);
  margin-top: -20px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 40px;
}

.welcome-section {
  text-align: center;
  padding: 48px 24px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #5079e9;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.welcome-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.message {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  gap: 12px;
  padding: 0 24px;
}

.message.user {
  flex-direction: row-reverse;
}




.message-content {
  flex: 1;
}

.message.user .message-content {
  text-align: right;
}

.message-bubble {
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
  transition: background 0.2s;
}


.dark-mode .message.ai .message-text {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.ai .message-text {
  box-shadow: 0 1px 12px rgba(33,150,243,0.08);

}


/* 代码样式 */
.inline-code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.code-block code {
  background: none;
  padding: 0;
  color: #333;
}

/* 暗色模式代码样式 */
.dark-mode .inline-code {
  background: rgba(255, 255, 255, 0.1);
  color: #ff6b6b;
}

.dark-mode .code-block {
  background: #2d3748;
  border-color: #4a5568;
}

.dark-mode .code-block code {
  color: #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-main.sidebar-open {
    margin-right: 0;
  }
  
  .sidebar {
    width: 100%;
    transform: translateX(100%);
  }
  
  .sidebar-toggle.sidebar-open {
    right: 0;
  }
  
  .messages-container {
    padding: 16px 20px;
  }
  
  .message {
    padding: 0 12px;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .welcome-section {
    padding: 32px 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 8px 16px 12px;
    padding-top: 24px;
  }
  
  .messages-container {
    padding: 12px 16px;
  }
  
  .message {
    padding: 0 8px;
  }
  

  
 
  
  .message-text {
    font-size: 14px;
    padding: 10px 14px;
  }
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 0 4px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}


.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgb(218, 232, 247) 0%, rgb(214, 229, 247) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 101;
  box-shadow: rgba(79, 156, 232, 0.3) 0px 3px 8px;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgb(239, 247, 255) 0%, rgb(214, 229, 247) 100%);
  box-shadow: rgba(79, 156, 232, 0.4) 0px 4px 12px;
}

.sidebar-toggle svg {
  width: 24px;
  height: 24px;
  color: #9EBCD9;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover svg {
  color: #4F9CE8;
  transform: scale(1.1);
}

.sidebar-toggle.sidebar-open {
  right: 320px;
}

.sidebar-toggle.sidebar-open svg {
  transform: rotate(180deg);
}

.sidebar {
  width: 300px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  /* 磨玻璃效果 */
  border-radius: 10px;
  background: rgba(177, 208, 255, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  z-index: 100;
}
.dark-mode .sidebar {
  background: rgba(72, 106, 207, 0.6);
}
.dark-mode .sidebar-toggle {
  background: rgba(72, 106, 207, 0.6);
}

.sidebar.collapsed {
  transform: translateX(100%);
}

.sidebar-content {
  padding: 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-top: 35px;
  padding: 1px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.6);
}

.dark-mode .sidebar-header {
  background-color: rgba(30, 34, 46, 0.6);
}

.sidebar-header:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.dark-mode .sidebar-header:hover {
  background-color: rgba(30, 34, 46, 0.8);
}

.sidebar-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  letter-spacing: 0.3px;
}

.sidebar-header svg {
  width: 20px;
  height: 20px;
}

.history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
  padding: 0 8px;
}

.chat-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dark-mode .history-item:hover {
  background: rgba(30, 34, 46, 0.1);
}

.history-item.active {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dark-mode .history-item.active {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-content .history-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-preview {
  font-size: 12px;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.delete-button {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.history-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  color: var(--el-color-danger);
}

:root[data-theme='dark'] .sidebar {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

:root[data-theme='dark'] .history-item:hover {
  background: var(--el-fill-color-darker);
}

:root[data-theme='dark'] .chat-history::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
}

@media (max-width: 768px) {
  .messages-container {
    padding: 20px;
  }

  .input-container {
    padding: 16px 20px;
  }

  .sidebar-toggle {
    right: 0;
    transform: translateY(-50%);
  }

  .sidebar-toggle.sidebar-open {
    right: 320px;
  }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}



/* 修复标题样式 */
.title-info h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
}

/* 按钮样式 */
.new-chat-button {
  width: 100%;
  height: 44px;
  background: var(--el-color-primary);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  color: white;
}

.new-chat-button.icon-only {
  width: 44px;
  border-radius: 50%;
}

.new-chat-button:hover {
  background: var(--el-color-primary-light-3);
}




.history-item:hover {
  background: var(--el-color-primary-light-9);
}



/* 初始态欢迎区和输入框垂直居中 */
.ai-welcome-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 70vh;
}
.ai-input-center {
  margin-top: 32px;
  width: 100%;
  max-width: 820px;
  display: flex;
  justify-content: center;
}

/* 有消息时输入框固定底部 */
.ai-input-bottom {
  
  margin: 0 auto;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 90%;
  z-index: 5;
  display: flex;
  overflow: hidden;
  padding-right: 10px;
}

/* 聊天消息气泡分左右 */
.ai-messages-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 120px;
}
.ai-message-user,
.ai-message-ai {
  display: flex;
  align-items: center; /* 垂直居中头像和气泡 */
}
.ai-message-user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.ai-message-ai {
  flex-direction: row;
  justify-content: flex-start;
}




.ai-message-user .message-content,
.ai-message-ai .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.ai-message-ai .message-content {
  align-items: flex-start;
}

.ai-message-user .message-bubble {
  position: relative;
  color: #fff;
  border-radius: 20px 20px 6px 20px;
  margin-bottom: 5px;

}


.ai-message-ai .message-bubble {
  position: relative;
  color: #222;
  border-radius: 20px 20px 20px 6px;
  margin: 0;
  box-shadow: 0 2px 12px rgba(33,150,243,0.08);
}


@media (max-width: 768px) {
  .ai-messages-list {
    padding-bottom: 80px;
  }
  .message-bubble {
    max-width: 60vw;
    font-size: 12px;
    padding: 3px 7px;
  }

}
@media (max-width: 480px) {
  .message-bubble {
    max-width: 80vw;
    font-size: 11px;
    padding: 2px 4px;
  }

}

/* Vditor消息样式 */
.vditor-message {
  width: 100%;
  min-height: 20px;
}

.vditor-message .vditor-ir {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

.vditor-message .vditor-ir__node {
  margin: 0 !important;
  padding: 0 !important;
}

.vditor-message .vditor-ir__node pre {
  background: #f8f9fa !important;
  border: 1px solid #e9ecef !important;
  border-radius: 8px !important;
  padding: 16px !important;
  margin: 8px 0 !important;
  overflow-x: auto !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.dark-mode .vditor-message .vditor-ir__node pre {
  background: #2d3748 !important;
  border-color: #4a5568 !important;
  color: #e2e8f0 !important;
}

.vditor-message .vditor-ir__node code {
  background: rgba(0, 0, 0, 0.1) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 0.9em !important;
  color: #e74c3c !important;
}

.dark-mode .vditor-message .vditor-ir__node code {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ff6b6b !important;
}

.vditor-message .vditor-ir__node p {
  margin: 8px 0 !important;
  line-height: 1.6 !important;
}

.vditor-message .vditor-ir__node h1,
.vditor-message .vditor-ir__node h2,
.vditor-message .vditor-ir__node h3,
.vditor-message .vditor-ir__node h4,
.vditor-message .vditor-ir__node h5,
.vditor-message .vditor-ir__node h6 {
  margin: 16px 0 8px 0 !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
}

.vditor-message .vditor-ir__node ul,
.vditor-message .vditor-ir__node ol {
  margin: 8px 0 !important;
  padding-left: 20px !important;
}

.vditor-message .vditor-ir__node li {
  margin: 4px 0 !important;
  line-height: 1.6 !important;
}

.vditor-message .vditor-ir__node blockquote {
  border-left: 4px solid #ddd !important;
  padding-left: 16px !important;
  margin: 8px 0 !important;
  color: #666 !important;
  font-style: italic !important;
}

.dark-mode .vditor-message .vditor-ir__node blockquote {
  border-left-color: #4a5568 !important;
  color: #9ca3af !important;
}

.vditor-message .vditor-ir__node table {
  border-collapse: collapse !important;
  width: 100% !important;
  margin: 8px 0 !important;
}

.vditor-message .vditor-ir__node th,
.vditor-message .vditor-ir__node td {
  border: 1px solid #ddd !important;
  padding: 8px 12px !important;
  text-align: left !important;
}

.dark-mode .vditor-message .vditor-ir__node th,
.dark-mode .vditor-message .vditor-ir__node td {
  border-color: #4a5568 !important;
}

.vditor-message .vditor-ir__node th {
  background: #f8f9fa !important;
  font-weight: 600 !important;
}

.dark-mode .vditor-message .vditor-ir__node th {
  background: #374151 !important;
}

/* Apple风格代码块样式 */
.apple-window-controls {
  display: flex;
  gap: 6px;
  padding: 8px 12px 0 12px;
  background: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border: 1px solid #e9ecef;
  border-bottom: none;
}

.dark-mode .apple-window-controls {
  background: #2d3748;
  border-color: #4a5568;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.control-dot-red {
  background: #ff5f56;
}

.control-dot-yellow {
  background: #ffbd2e;
}

.control-dot-green {
  background: #27ca3f;
}

.apple-code-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.dark-mode .apple-code-container {
  background: #2d3748;
  border-color: #4a5568;
}

.apple-code-container pre {
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  background: transparent !important;
  padding: 16px !important;
}

.apple-code-container code {
  background: transparent !important;
  padding: 0 !important;
  color: #333 !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.dark-mode .apple-code-container code {
  color: #e2e8f0 !important;
}

/* 代码块语言标签 */
.apple-code-container::before {
  content: attr(data-language);
  display: block;
  background: #e9ecef;
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-bottom: 1px solid #dee2e6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-mode .apple-code-container::before {
  background: #4a5568;
  color: #a0aec0;
  border-bottom-color: #2d3748;
}

/* 代码块滚动条样式 */
.apple-code-container pre::-webkit-scrollbar {
  height: 6px;
}

.apple-code-container pre::-webkit-scrollbar-track {
  background: transparent;
}

.apple-code-container pre::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.apple-code-container pre::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark-mode .apple-code-container pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark-mode .apple-code-container pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 代码块折叠功能 */
.code-block-collapsible {
  max-height: 400px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.code-block-collapsible.collapsed {
  max-height: 0;
}

.code-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-left: 8px;
}

.code-toggle:hover {
  background: rgba(0, 0, 0, 0.2);
}

.dark-mode .code-toggle {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .code-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-icon {
  font-size: 12px;
  color: #666;
  transition: transform 0.2s ease;
}

.dark-mode .toggle-icon {
  color: #999;
}

.code-block-collapsible.collapsed .toggle-icon {
  transform: rotate(-90deg);
}
.message-bubble {
  background: rgba(20, 16, 226, 0.6);
}
/* 美化日夜间主题下的AI气泡和代码块样式 */
/* 在 .ai-message-ai .message-bubble 和 .ai-message-user .message-bubble 以及 .apple-code-container 等样式中，
  增加夜间模式下的对比度和字体色彩，提升可读性。 */
.dark-mode .ai-message-ai .message-bubble {
  background: rgba(26, 24, 156, 0.6);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dark-mode .ai-message-user .message-bubble {
  background: rgba(6, 4, 116, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}



.dark-mode .apple-code-container code {
  color: #3975c4 !important;
}

.dark-mode .apple-code-container pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark-mode .apple-code-container pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}





/* 深蓝色圆角代码块 */
:deep(pre code)
 {
  background: #fffbe6 !important;   /* 深海蓝 */
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  padding: 16px 20px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 18px 0;
  overflow-x: auto;
  display: block;
}
:deep(.hljs)
{
  background: transparent;
}
:deep(.hljs-params)
{
  color: #2bda1b;
}
/*  文字日夜颜色适配 */
:deep(.ai-markdown-message) {
  font-family: 'SF Pro Display', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 17px;
  color: #222;
  border-radius: 18px;
  padding: 24px 28px;
  margin: 0 0 24px 0;
  line-height: 1.85;
  letter-spacing: 0.01em;
  word-break: break-word;
  transition: background 0.2s, color 0.2s;
}
.dark-mode :deep(.ai-markdown-message) {
  color: #fdfdff !important;
}

:deep(.ai-markdown-message p) {
  margin: 1em 0;
}

:deep(.ai-markdown-message ul),
:deep(.ai-markdown-message ol) {
  margin: 1em 0 1em 2em;
  padding-left: 1.2em;
}

:deep(.ai-markdown-message li) {
  margin: 0.3em 0;
  line-height: 1.8;
}

:deep(.ai-markdown-message blockquote) {
  border-left: 4px solid #7bb1fa;
  color: #3a4a5d;
  padding: 0.7em 1.2em;
  margin: 1em 0;
  border-radius: 8px;
  font-style: italic;
}

:deep(.ai-markdown-message h1),
:deep(.ai-markdown-message h2),
:deep(.ai-markdown-message h3),
:deep(.ai-markdown-message h4) {
  font-weight: 700;
  color: #d69405;
  margin: 1.2em 0 0.6em 0;
  line-height: 1.3;
}

:deep(.ai-markdown-message a) {
  color: #2b7cff;
  text-decoration: underline;
  transition: color 0.2s;
}
:deep(.ai-markdown-message a:hover) {
  color: #174ea6;
}
/* 代码块高亮渲染美化 */
:deep(pre code.hljs),
:deep(pre.hljs) {
  border-radius: 12px;
  padding: 16px 20px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 18px 0;
  overflow-x: auto;
  display: block;
  /* 不要设置 color，保留 highlight.js token 颜色 */
}

/* 夜间模式下代码块背景更深 */
.dark-mode :deep(pre code.hljs),
.dark-mode :deep(pre.hljs) {
  background: #1a1d21 !important;
}

/* 语言特定样式 */
:deep(.language-bash) {
  color: #0e750a;
}

:deep(.language-vue) {
  color: #42b883;
}

:deep(.language-javascript) {
  color: #f7df1e;
}

:deep(.language-js) {
  color: #f7df1e;
}

:deep(.language-html) {
  color: #e34c26;
}

:deep(.language-css) {
  color: #1572b6;
}

:deep(.language-python) {
  color: #3776ab;
}

:deep(.language-java) {
  color: #ed8b00;
}

:deep(.language-cpp) {
  color: #00599c;
}

:deep(.language-c) {
  color: #00599c;
}

:deep(.language-json) {
  color: #000000;
}

:deep(.language-xml) {
  color: #f0f0f0;
}

:deep(.language-sql) {
  color: #336791;
}

:deep(.language-php) {
  color: #777bb4;
}

:deep(.language-go) {
  color: #00add8;
}

:deep(.language-rust) {
  color: #ce422b;
}

:deep(.language-typescript) {
  color: #3178c6;
}

:deep(.language-ts) {
  color: #3178c6;
}
:deep(.hljs-tag) {
  color: #241918;
}
:deep(.hljs-attribute) {
  color: #d66f33;
}
:deep(.hljs-property) {
  color: #1baac4;
}



/* 夜间模式下的 AI 消息样式 */
.dark-mode :deep(.ai-markdown-message) {
  background: #1a1d21 !important;
  color: #fdfdff !important;
}

.dark-mode :deep(.ai-markdown-message *),
.dark-mode :deep(.ai-markdown-message p),
.dark-mode :deep(.ai-markdown-message li),
.dark-mode :deep(.ai-markdown-message h1),
.dark-mode :deep(.ai-markdown-message h2),
.dark-mode :deep(.ai-markdown-message h3),
.dark-mode :deep(.ai-markdown-message h4) {
  color: #fdfdff !important;
}


:deep(.ai-markdown-message pre code) {
  background: #fffbe6 !important;
  color: #2a2b2c !important;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  margin: 18px 0;
  overflow-x: auto;
  display: block;
}

:deep(.ai-markdown-message table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ai-markdown-message th),
:deep(.ai-markdown-message td) {
  border: 1px solid #e3e8ee;
  padding: 8px 14px;
  text-align: left;
}
:deep(.dark-mode .ai-markdown-message li) {
  color: #fdfdff !important;
}

/* 复制按钮容器 */
.copy-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 0 8px;
}

</style>

