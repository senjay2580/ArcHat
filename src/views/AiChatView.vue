<template>
  <div class="chat-container">
    <!-- 主聊天区域 -->
    <div class="chat-main" :class="{ 'sidebar-open': !sidebarCollapsed, 'has-messages': messages.length > 0 }">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <div class="ai-avatar">
            <img src="@/assets/image/archat.png" alt="" width="40" height="32">
          </div>
          <div class="title-info">
            <h2>{{ currentChatTitle }}</h2>
            <span class="model-info">{{ getLatestMessagePreview() }}</span>
          </div>
        </div>
        
        <!-- 功能按钮组 -->
        <div class="function-buttons">
          <!-- RAG知识库按钮 -->
          <div class="button-container rag-button-container">
          <button 
            class="rag-toggle-btn"
            :class="{ 'active': showRagDropdown }"
            @click="toggleRagDropdown"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span>知识库</span>
            <span v-if="uploadedFiles.length > 0" class="file-count">{{ uploadedFiles.length }}</span>
          </button>
          
          <!-- RAG下拉框 -->
          <div 
            v-if="showRagDropdown" 
            class="rag-dropdown"
            @click.stop
          >
            <div class="rag-dropdown-content">
              <!-- RAG文件拖拽区域 -->
              <div class="rag-container">
                <div 
                  class="rag-dropzone"
                  :class="{ 'drag-over': isDragOver }"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <input 
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.md"
                    @change="handleFileSelect"
                    style="display: none;"
                  />
                  
                  <div class="rag-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  
                  <div class="rag-text">
                    <h3>知识库文档</h3>
                    <p>拖拽文件到此处或点击上传</p>
                    <span class="rag-hint">支持 TXT、PDF、DOC、DOCX、MD 格式</span>
                  </div>
                </div>
                
                <!-- 已上传文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="uploaded-files">
                  <div class="files-header">
                    <span>已上传文件 ({{ uploadedFiles.length }})</span>
                    <button @click="clearAllFiles" class="clear-all-btn">清空全部</button>
                  </div>
                  <div class="files-list">
                    <div 
                      v-for="(file, index) in uploadedFiles" 
                      :key="index"
                      class="file-item"
                    >
                      <div class="file-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <button @click="removeFile(index)" class="remove-file-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          
          <!-- AI模型切换按钮 -->
          <div class="button-container model-button-container">
            <button 
              class="function-btn model-toggle-btn"
              :class="{ 'active': showModelDropdown }"
              @click="toggleModelDropdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
              <span>AI模型</span>
            </button>
          </div>
          
          <!-- MCP工具按钮 -->
          <div class="button-container mcp-button-container">
            <button 
              class="function-btn mcp-toggle-btn"
              :class="{ 'active': showMcpDropdown }"
              @click="toggleMcpDropdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="8" width="10" height="8" rx="1" ry="1"/>
              </svg>
              <span>MCP工具</span>
            </button>
          </div>
          
          <!-- AI提示词按钮 -->
          <div class="button-container prompt-button-container">
            <button 
              class="function-btn prompt-toggle-btn"
              :class="{ 'active': showPromptDropdown }"
              @click="togglePromptDropdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="12" y1="17" x2="8" y2="17"/>
              </svg>
              <span>提示词</span>
            </button>
          </div>
          
          <!-- 工作流按钮 -->
          <div class="button-container workflow-button-container">
            <button 
              class="function-btn workflow-toggle-btn"
              :class="{ 'active': showWorkflowDropdown }"
              @click="toggleWorkflowDropdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="6" height="6" rx="1"/>
                <rect x="15" y="3" width="6" height="6" rx="1"/>
                <rect x="9" y="15" width="6" height="6" rx="1"/>
                <path d="M6 9v1a2 2 0 0 0 2 2h1m0 0h4m0 0h1a2 2 0 0 0 2-2V9m-6 6v1"/>
              </svg>
              <span>工作流</span>
            </button>
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
            <AichatInput v-model="inputMessage" @send="sendMessage" :disabled="isTyping" />
          </div>
          
          <!-- 信息卡片网格 -->
          <div class="info-cards-grid">
            <!-- 天气信息卡片 -->
            <div class="info-card weather-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  </svg>
                </div>
                <h3>天气信息</h3>
                <button @click="refreshWeather" class="refresh-btn" :disabled="loadingWeather">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
                </button>
              </div>
              <div class="card-content">
                <div v-if="loadingWeather" class="loading-state">
                  <div class="loading-spinner"></div>
                  <span>加载中...</span>
                </div>
                <div v-else-if="weatherData" class="weather-info">
                  <div class="weather-main">
                    <div class="temperature">{{ weatherData.temperature }}°C</div>
                    <div class="weather-desc">{{ weatherData.description }}</div>
                  </div>
                  <div class="weather-details">
                    <div class="weather-item">
                      <span>湿度</span>
                      <span>{{ weatherData.humidity }}%</span>
                    </div>
                    <div class="weather-item">
                      <span>风速</span>
                      <span>{{ weatherData.windSpeed }} km/h</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <span>暂无天气数据</span>
                </div>
              </div>
            </div>
            
            <!-- 今日提示卡片 -->
            <div class="info-card tips-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <h3>今日提示</h3>
                <button @click="refreshTips" class="refresh-btn" :disabled="loadingTips">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
                </button>
              </div>
              <div class="card-content">
                <div v-if="loadingTips" class="loading-state">
                  <div class="loading-spinner"></div>
                  <span>加载中...</span>
                </div>
                <div v-else-if="tipsData" class="tips-content">
                  <div class="tip-text">{{ tipsData.content }}</div>
                  <div class="tip-category">{{ tipsData.category }}</div>
                </div>
                <div v-else class="empty-state">
                  <span>暂无提示内容</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template v-else>
          <div class="messages-list ai-messages-list">
            <div v-for="(message, index) in messages" :key="message.id"
              :class="['message', message.type, message.type === 'user' ? 'ai-message-user' : 'ai-message-ai']">
              <!-- 头像 -->
              <div class="message-avatar">
                <div v-if="message.type === 'user'" class="user-avatar">
                  <div class="avatar-circle user-avatar-bg">
                    {{ userStore.userInfo.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>
                </div>
                <div v-else class="ai-avatar">
                  <div class="avatar-circle ai-avatar-bg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="currentColor">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="message-content">
                <div v-if="message.type === 'user'" class="message-bubble">
                  <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                </div>
                <div v-else class="ai-markdown-message">
                  <StreamingText 
                    :content="message.content || ''"
                    :isStreaming="message.isStreaming || false"
                    :renderMarkdown="true"
                    @complete="onStreamComplete(message)"
                  />
                  
                  <!-- 复制按钮 - 只在非流式状态显示 -->
                  <div v-if="!message.isStreaming" class="copy-button-container">
                    <dangerButton type="primary" @click="copyMessageContent(message.content)" >
                      <el-icon>
                        <Document />
                      </el-icon>
                    </dangerButton>
                  </div>
                </div>
                <div v-if="!isTyping" class="message-time">
                  {{ formatDateTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 输入框（有消息时固定底部） -->
      <div v-if="messages.length > 0" class="ai-input-bottom">
        <AichatInput v-model="inputMessage" @send="sendMessage" :disabled="isTyping" />
      </div>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" :class="{ 'sidebar-open': !sidebarCollapsed }" @click="toggleSidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
        viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
        <path fill="currentColor"
          d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z" />
      </svg>
    </div>

    <!-- 右侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-content">
        <!-- 新建对话按钮 -->
        <div class="sidebar-header" @click="createNewChat">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
            viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt -->
            <mask id="lineMdGithubLoop0" width="24" height="24" x="0" y="0">
              <g fill="#fff">
                <ellipse cx="9.5" cy="9" rx="1.5" ry="1" />
                <ellipse cx="14.5" cy="9" rx="1.5" ry="1" />
              </g>
            </mask>
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path stroke-dasharray="32" stroke-dashoffset="32"
                d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3">
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0" />
              </path>
              <path stroke-dasharray="10" stroke-dashoffset="10"
                d="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5">
                <animate attributeName="d" dur="3s" repeatCount="indefinite"
                  values="M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5;M9 19c-1.406 0-3-.5-4-.5-.532 0-1 0-2-.5;M9 19c-1.406 0-2.844-.563-3.688-1.188C4.47 17.188 4.22 16.157 3 15.5" />
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="10;0" />
              </path>
            </g>
            <rect width="8" height="4" x="8" y="11" fill="currentColor" mask="url(#lineMdGithubLoop0)">
              <animate attributeName="y" dur="10s" keyTimes="0;0.45;0.46;0.54;0.55;1" repeatCount="indefinite"
                values="11;11;7;7;11;11" />
            </rect>
          </svg>
          <span>新会话<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
              viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
              <path fill="currentColor"
                d="M4 16q-.425 0-.712-.288T3 15t.288-.712T4 14h5q.425 0 .713.288T10 15t-.288.713T9 16zm0-4q-.425 0-.712-.288T3 11t.288-.712T4 10h9q.425 0 .713.288T14 11t-.288.713T13 12zm0-4q-.425 0-.712-.288T3 7t.288-.712T4 6h9q.425 0 .713.288T14 7t-.288.713T13 8zm13 12q-.425 0-.712-.288T16 19v-3h-3q-.425 0-.712-.288T12 15t.288-.712T13 14h3v-3q0-.425.288-.712T17 10t.713.288T18 11v3h3q.425 0 .713.288T22 15t-.288.713T21 16h-3v3q0 .425-.288.713T17 20" />
            </svg></span>
        </div>
        <!-- 聊天历史 -->
        <div class="chat-history-section">
          <div class="history-title">最近对话</div>
          <div class="chat-history-container">
            <div class="chat-history">
              <div v-for="chat in chatHistory" :key="chat.id"
                :class="['history-item', { active: chat.id === currentChatId }]" @click="switchChat(chat.id)">
                <div class="history-content">
                  <div class="history-title">{{ chat.title }}</div>
                  <div class="history-preview">{{ chat.lastMessage }}</div>
                  <div class="history-time">{{ formatDate(chat.timestamp) }}</div>
                </div>
               <dangerButton type="danger" @click.stop="deleteChat(chat.id)" :disabled="isDeletingChat" class="delete-button-hover">
                <el-icon>
                  <Delete />
                </el-icon>
              </dangerButton>
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
import { ref, reactive, onMounted, nextTick, computed, onUnmounted, watch } from 'vue';
import { useDark } from '@vueuse/core';

// 工具函数
import ArcMessage from '@/utils/ArcMessage';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// UI组件
import { Document } from '@element-plus/icons-vue';
import AichatInput from '@/components/misc/AichatInput.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import StreamingText from '@/components/ai/StreamingText.vue';

// API接口
import { aiChatStream, createAiContact } from '@/api/aichat';

// Stores
import { useUserInfoStore } from '@/stores/user';
import { useAiChatStore } from '@/stores/aiChat';

// 第三方库样式和语言包
import 'highlight.js/styles/github.css';
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/xml';
import 'highlight.js/lib/languages/css';
import { marked } from 'marked';

// ==================== Store ====================
const userStore = useUserInfoStore();
const aiChatStore = useAiChatStore();

// ==================== Markdown渲染器配置 ====================
const renderer = new marked.Renderer();

renderer.code = function (code, infostring, escaped) {
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

renderer.codespan = function (code) {
  return `<code class="inline-code">${code}</code>`;
};

renderer.table = function (header, body) {
  return `<table>${header ? `<thead>${header}</thead>` : ''}<tbody>${body}</tbody></table>`;
};

renderer.tablerow = function (content) {
  return `<tr>${content}</tr>`;
};

renderer.tablecell = function (content, flags) {
  const type = flags.header ? 'th' : 'td';
  return `<${type}>${content}</${type}>`;
};

renderer.list = function (body, ordered, start) {
  const type = ordered ? 'ol' : 'ul';
  return `<${type}>${body}</${type}>`;
};

renderer.listitem = function (text, task, checked) {
  return `<li>${text}</li>`;
};

renderer.blockquote = function (quote) {
  return `<blockquote>${quote}</blockquote>`;
};

renderer.paragraph = function (text) {
  return `<p>${text}</p>`;
};

marked.setOptions({
  renderer,
  highlight: function (code, lang) {
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

// #region 组件状态
// 输入和UI状态
const inputMessage = ref('') // 当前输入的消息内容
const messagesContainer = ref(null) // 消息容器DOM引用
const sidebarCollapsed = ref(true) // 侧边栏折叠状态
const isTyping = ref(false) // AI正在打字状态

// 主题切换相关
const isDarkMode = useDark() // 暗黑模式状态
const themeTransitionTimer = ref(null) // 主题切换防抖定时器

// 消息列表 - 从store获取
const messages = ref([]) // 当前聊天的消息列表

// RAG文件相关状态
const fileInput = ref(null) // 文件输入引用
const isDragOver = ref(false) // 拖拽状态
const uploadedFiles = ref([]) // 已上传文件列表
const showRagDropdown = ref(false) // 显示RAG下拉框

// 其他功能按钮状态
const showModelDropdown = ref(false) // 显示模型下拉框
const showMcpDropdown = ref(false) // 显示MCP下拉框
const showPromptDropdown = ref(false) // 显示提示词下拉框
const showWorkflowDropdown = ref(false) // 显示工作流下拉框

// 功能数据
const currentModel = ref('gpt-4') // 当前选中的模型
const availableModels = ref([
  { id: 'gpt-4', name: 'GPT-4', description: '最强大的通用模型' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '快速响应的对话模型' },
  { id: 'claude-3', name: 'Claude-3', description: 'Anthropic的高级模型' }
])

const mcpTools = ref([
  { id: 'search', name: '网络搜索', description: '搜索最新信息' },
  { id: 'calculator', name: '计算器', description: '数学计算工具' },
  { id: 'weather', name: '天气查询', description: '获取天气信息' }
])

const promptTemplates = ref([
  { id: 'code-review', name: '代码审查', description: '帮助审查和优化代码' },
  { id: 'writing', name: '写作助手', description: '提升文章质量' },
  { id: 'translate', name: '翻译专家', description: '多语言翻译' }
])

const workflows = ref([
  { id: 'blog-writing', name: '博客写作', description: '从构思到发布的完整流程' },
  { id: 'code-generation', name: '代码生成', description: '需求分析到代码实现' },
  { id: 'data-analysis', name: '数据分析', description: '数据处理和可视化' }
])

// 信息卡片相关状态
const loadingWeather = ref(false)
const loadingTips = ref(false)

const weatherData = ref(null)
const tipsData = ref(null)

// #region 计算属性
/**
 * 当前聊天标题
 */
const currentChatTitle = computed(() => {
  return aiChatStore.getCurrentChatTitle()
})

/**
 * 聊天历史
 */
const chatHistory = computed(() => {
  return aiChatStore.chatHistory
})

/**
 * 当前聊天ID
 */
const currentChatId = computed(() => {
  return aiChatStore.currentChatId
})

/**
 * 获取最新消息预览
 */
const getLatestMessagePreview = () => {
  if (messages.value.length === 0) {
    return '开始新的对话...'
  }
  
  const latestMessage = messages.value[messages.value.length - 1]
  if (!latestMessage || !latestMessage.content) {
    return '开始新的对话...'
  }
  
  // 获取消息内容的前15个字符
  const content = latestMessage.content.trim()
  return content.length > 15 ? content.substring(0, 15) + '...' : content
}
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

  try {
    // 确保有memoryId
    const memoryId = await aiChatStore.ensureMemoryId()

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
      memoryId: memoryId,
      prompt: ""
    }
    inputMessage.value = ''

    // 更新聊天信息
    aiChatStore.updateChatInfo(userInput)
    await nextTick()
    scrollToBottom()
    isTyping.value = true

  // 创建AI消息对象
  let aiMessage = {
    id: Date.now() + 1,
    type: 'ai',
    content: '',
    isStreaming: true,
    timestamp: new Date()
  }
  messages.value.push(aiMessage)

  try {
    const response = await aiChatStream(request)
    
    if (!response.body) throw new Error('响应体为空')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let chunkCount = 0

    // 立即关闭加载状态
    isTyping.value = false

    // 简化的流式处理 - 直接更新内容
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      chunkCount++
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      // 直接更新消息内容，让StreamingText组件处理显示
      aiMessage.content = buffer
      
      // 强制触发Vue响应式更新
      messages.value = [...messages.value]
      
      // 提高渲染频率 - 每个块都滚动
      scrollToBottom()
    }
    
    // 流式完成
    aiMessage.isStreaming = false
    
    // 强制触发Vue响应式更新
    messages.value = [...messages.value]
    
    scrollToBottom()
  } catch (error) {
    console.error('AI服务错误:', error)
    ArcMessage.error('AI服务暂时不可用，请稍后重试')
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: '抱歉，我现在无法回答您的问题。请稍后再试。',
      rendered: '<p>抱歉，我现在无法回答您的问题。请稍后再试。</p>',
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
  } finally {
    // 确保加载状态关闭（如果还没关闭的话）
    if (isTyping.value) {
      isTyping.value = false
    }
    // 保存消息到store
    aiChatStore.saveMessageToChat(messages.value)
    await nextTick()
    scrollToBottom()
  }
  } catch (error) {
    console.error('发送消息失败:', error)
    ArcMessage.error('发送消息失败，请重试')
    isTyping.value = false
  }
}
// #endregion

// #region 聊天管理
let isCreatingChat = false

const createNewChat = () => {
  // 防止重复创建
  if (isCreatingChat) return
  
  isCreatingChat = true
  
  try {
    // 先保存当前消息
    aiChatStore.saveMessageToChat(messages.value)
    
    // 创建新聊天
    aiChatStore.createNewChat()
    
    // 清空当前消息
    messages.value = []
  } finally {
    // 使用setTimeout确保在下一个事件循环中重置标志
    setTimeout(() => {
      isCreatingChat = false
    }, 100)
  }
}

// 切换对话
const switchChat = async (chatId) => {
  // 保存当前聊天的消息
  aiChatStore.saveMessageToChat(messages.value)
  
  // 切换聊天
  aiChatStore.switchChat(chatId)
  
  // 加载新聊天的消息
  messages.value = aiChatStore.getCurrentChatMessages()
  
  // 等待DOM更新后滚动到底部
  await nextTick()
  setTimeout(() => {
    scrollToBottom()
  }, 100)
}

// 删除对话
const isDeletingChat = ref(false)

const deleteChat = (chatId) => {
  // 防止重复删除
  if (isDeletingChat.value) return
  
  isDeletingChat.value = true
  
  try {
    const success = aiChatStore.deleteChat(chatId)
    if (success) {
      // 如果删除成功，重新加载当前聊天的消息
      messages.value = aiChatStore.getCurrentChatMessages()
    }
  } finally {
    // 使用setTimeout确保在下一个事件循环中重置标志
    setTimeout(() => {
      isDeletingChat.value = false
    }, 300)
  }
}
// #endregion

// #region 工具函数
// 高频滚动函数
let scrollTimeout = null
const scrollToBottom = () => {
  if (scrollTimeout) return // 防止频繁滚动
  
  scrollTimeout = setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
    scrollTimeout = null
  }, 8) // 约120fps的更新频率，更流畅
}

// 通用Date对象转换函数
const ensureDate = (date) => {
  if (!date) return null
  
  if (date instanceof Date) {
    return date
  } else if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date)
  } else if (date.__type === 'Date') {
    // 处理自定义序列化的Date对象
    return new Date(date.value)
  }
  
  return null
}

// 格式化日期时间（完整格式）
const formatDateTime = (date) => {
  const dateObj = ensureDate(date)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '未知时间'
  }
  
  return dateObj.toLocaleDateString('zh-CN', {
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
  const dateObj = ensureDate(date)
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '未知时间'
  }
  
  const now = new Date()
  const diff = now - dateObj
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 流式完成回调
const onStreamComplete = async (message) => {
  // 流式完成后进行代码高亮
  await nextTick()
  setTimeout(() => {
    hljs.highlightAll()
    scrollToBottom()
  }, 100)
}

// 复制消息内容
const copyMessageContent = (content) => {
  if (!content) return

  navigator.clipboard.writeText(content).then(() => {
    ArcMessage.success('消息内容已复制到剪贴板');
  }).catch(err => {
    console.error('复制失败:', err);
    ArcMessage.error('复制失败，请手动复制');
  });
}

// #region 功能按钮处理
// 切换RAG下拉框显示
const toggleRagDropdown = () => {
  showRagDropdown.value = !showRagDropdown.value
  // 关闭其他下拉框
  showModelDropdown.value = false
  showMcpDropdown.value = false
  showPromptDropdown.value = false
  showWorkflowDropdown.value = false
}

// 切换模型下拉框
const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value
  // 关闭其他下拉框
  showRagDropdown.value = false
  showMcpDropdown.value = false
  showPromptDropdown.value = false
  showWorkflowDropdown.value = false
}

// 切换MCP下拉框
const toggleMcpDropdown = () => {
  showMcpDropdown.value = !showMcpDropdown.value
  // 关闭其他下拉框
  showRagDropdown.value = false
  showModelDropdown.value = false
  showPromptDropdown.value = false
  showWorkflowDropdown.value = false
}

// 切换提示词下拉框
const togglePromptDropdown = () => {
  showPromptDropdown.value = !showPromptDropdown.value
  // 关闭其他下拉框
  showRagDropdown.value = false
  showModelDropdown.value = false
  showMcpDropdown.value = false
  showWorkflowDropdown.value = false
}

// 切换工作流下拉框
const toggleWorkflowDropdown = () => {
  showWorkflowDropdown.value = !showWorkflowDropdown.value
  // 关闭其他下拉框
  showRagDropdown.value = false
  showModelDropdown.value = false
  showMcpDropdown.value = false
  showPromptDropdown.value = false
}

// 选择AI模型
const selectModel = (modelId) => {
  currentModel.value = modelId
  showModelDropdown.value = false
  ArcMessage.success(`已切换到 ${availableModels.value.find(m => m.id === modelId)?.name}`)
}

// 使用MCP工具
const useMcpTool = (toolId) => {
  showMcpDropdown.value = false
  const tool = mcpTools.value.find(t => t.id === toolId)
  ArcMessage.success(`正在启用 ${tool?.name}`)
}

// 使用提示词模板
const usePromptTemplate = (templateId) => {
  showPromptDropdown.value = false
  const template = promptTemplates.value.find(t => t.id === templateId)
  ArcMessage.success(`已应用 ${template?.name} 模板`)
}

// 执行工作流
const executeWorkflow = (workflowId) => {
  showWorkflowDropdown.value = false
  const workflow = workflows.value.find(w => w.id === workflowId)
  ArcMessage.success(`正在执行 ${workflow?.name} 工作流`)
}

// #region RAG文件处理

// 拖拽进入
const handleDragOver = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

// 拖拽离开
const handleDragLeave = (e) => {
  e.preventDefault()
  isDragOver.value = false
}

// 文件拖拽放置
const handleFileDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

// 点击触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 文件选择处理
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
  // 清空input值，允许重复选择同一文件
  e.target.value = ''
}

// 处理文件
const processFiles = (files) => {
  const validFiles = files.filter(file => {
    const validTypes = ['.txt', '.pdf', '.doc', '.docx', '.md']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    return validTypes.includes(fileExtension)
  })
  
  if (validFiles.length !== files.length) {
    ArcMessage.error('部分文件格式不支持，仅支持 TXT、PDF、DOC、DOCX、MD 格式')
  }
  
  // 检查重复文件
  const newFiles = validFiles.filter(file => {
    return !uploadedFiles.value.some(uploaded => uploaded.name === file.name)
  })
  
  if (newFiles.length !== validFiles.length) {
    ArcMessage.error('部分文件已存在，跳过重复文件')
  }
  
  uploadedFiles.value.push(...newFiles)
  
  if (newFiles.length > 0) {
    ArcMessage.success(`成功添加 ${newFiles.length} 个文件到知识库`)
  }
}

// 移除单个文件
const removeFile = (index) => {
  const fileName = uploadedFiles.value[index].name
  uploadedFiles.value.splice(index, 1)
  ArcMessage.success(`已移除文件: ${fileName}`)
}

// 清空所有文件
const clearAllFiles = () => {
  uploadedFiles.value = []
  ArcMessage.success('已清空所有文件')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// #region 信息卡片API调用
// 获取天气数据
const fetchWeatherData = async () => {
  loadingWeather.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    weatherData.value = {
      temperature: 22,
      description: "晴朗",
      humidity: 65,
      windSpeed: 12
    }
  } catch (error) {
    ArcMessage.error('获取天气数据失败')
  } finally {
    loadingWeather.value = false
  }
}

// 获取今日提示数据
const fetchTipsData = async () => {
  loadingTips.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // 从localStorage获取todos数据
    const todosData = localStorage.getItem('todos')
    let todoTasks = []
    
    if (todosData) {
      try {
        const parsedData = JSON.parse(todosData)
        // 提取未完成的任务
        todoTasks = parsedData.filter(task => !task.done)
        
        // 如果没有未完成任务，则包含所有任务
        if (todoTasks.length === 0) {
          todoTasks = parsedData
        }
      } catch (parseError) {
        console.warn('解析todos数据失败:', parseError)
      }
    }
    
    if (todoTasks.length > 0) {
      // 从todos中随机选择一个任务
      const randomTask = todoTasks[Math.floor(Math.random() * todoTasks.length)]
      
      // 根据任务分类设置类别显示
      const getCategoryByType = (category) => {
        switch (category) {
          case 'main': return '主线任务'
          case 'branch': return '支线任务'
          case 'schedule': return '时间行程'
          case 'pending': return '待决定'
          default: return '待办任务'
        }
      }
      
      // 根据任务完成状态添加提示前缀
      const getContentPrefix = (done) => {
        return done ? '已完成：' : '别忘了：'
      }
      
      tipsData.value = {
        content: `${getContentPrefix(randomTask.done)}${randomTask.text}`,
        category: getCategoryByType(randomTask.category)
      }
    } else {
      // 如果没有todos数据，使用默认提示
      const defaultTips = [
        { content: "保持好奇心，每天学习新知识能让大脑更加活跃", category: "学习建议" },
        { content: "适当的休息比连续工作更能提高效率", category: "工作技巧" },
        { content: "多喝水有助于保持身体健康和精神状态", category: "健康提醒" },
        { content: "定期整理工作空间能提升专注力", category: "生活技巧" }
      ]
      
      tipsData.value = defaultTips[Math.floor(Math.random() * defaultTips.length)]
    }
  } catch (error) {
    ArcMessage.error('获取今日提示失败')
  } finally {
    loadingTips.value = false
  }
}

// 刷新方法
const refreshWeather = () => fetchWeatherData()
const refreshTips = () => fetchTipsData()

// 初始化数据
const initializeCardData = async () => {
  await Promise.all([
    fetchWeatherData(),
    fetchTipsData()
  ])
}
// #endregion

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

// #region 主题切换优化
/**
 * 优化主题切换性能
 */
const optimizeThemeTransition = () => {
  // 添加过渡类
  document.body.classList.add('theme-transition');
  
  // 清除之前的定时器
  if (themeTransitionTimer.value) {
    clearTimeout(themeTransitionTimer.value);
  }
  
  // 300ms后移除过渡类，避免影响其他动画
  themeTransitionTimer.value = setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 300);
};
// #endregion

// #region 生命周期钩子
onMounted(async () => {
  // 加载当前聊天的消息
  messages.value = aiChatStore.getCurrentChatMessages()
  
  // 等待DOM更新后再滚动
  await nextTick()
  setTimeout(() => {
    scrollToBottom()
  }, 100)

  // 初始化信息卡片数据
  if (messages.value.length === 0) {
    initializeCardData()
  }

  // 添加点击外部关闭下拉框的事件监听
  document.addEventListener('click', (e) => {
    if (showRagDropdown.value && !e.target.closest('.rag-button-container')) {
      showRagDropdown.value = false
    }
  })

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

  // 监听主题切换，优化性能
  watch(isDarkMode, () => {
    optimizeThemeTransition();
  });
})

onUnmounted(() => {
  // 保存当前消息到store
  aiChatStore.saveMessageToChat(messages.value)
  
  // 清理全局函数
  delete window.copyCode
  delete window.toggleCodeBlock
  
  // 清理主题切换定时器
  if (themeTransitionTimer.value) {
    clearTimeout(themeTransitionTimer.value);
  }
})

window.copyCode = (codeBlockId) => {
  const codeBlock = document.getElementById(codeBlockId);
  if (codeBlock) {
    const codeContent = codeBlock.querySelector('code');
    if (codeContent) {
      const text = codeContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        ArcMessage.success('代码已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
        ArcMessage.error('复制失败，请手动复制');
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
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px 16px;
  padding-top: 32px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  position: relative;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}



:deep(.title-info h2) {
  margin: 0;
  font-weight: 600;
  color: rgb(104, 104, 241) !important;  
  
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
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #5079e9;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 18px;
  color: rgba(45, 55, 72, 0.8);
  margin: 0 0 40px 0;
  line-height: 1.6;
  font-weight: 400;
}

.dark-mode .welcome-section {
  background: transparent;
}

.dark-mode .welcome-subtitle {
  color: rgba(226, 232, 240, 0.8);
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
  box-shadow: 0 1px 12px rgba(33, 150, 243, 0.08);

}


/* 头像样式 */
.message-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.user-avatar-bg {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.ai-avatar-bg {
  background: #3b82f6;
  color: white;
}

.avatar-circle:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 暗色模式适配 */
.dark-mode .chat-container {
  background: transparent;
}

.dark-mode .ai-message-user .message-bubble {
  background: linear-gradient(135deg, #553c9a 0%, #b794f6 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .ai-message-ai .message-bubble {
  background: rgba(45, 55, 72, 0.9);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-mode .message-time {
  color: rgba(226, 232, 240, 0.6);
}

.dark-mode .user-avatar-bg {
  background: #374151;
  color: #f9fafb;
  border: 2px solid #4b5563;
}

.dark-mode .ai-avatar-bg {
  background: #2563eb;
  color: white;
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
  font-size: 11px;
  color: rgba(107, 114, 126, 0.8);
  padding: 4px 8px;
  margin-top: 4px;
  font-weight: 400;
  letter-spacing: 0.3px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.message:hover .message-time {
  opacity: 1;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.9);
  border-radius: 18px;
  margin: 8px 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 12px rgba(33, 150, 243, 0.08);
  max-width: 80%;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 暗色模式下的加载指示器 */
.dark-mode .typing-indicator {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark-mode .typing-indicator span {
  background: #a0aec0;
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
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark-mode .history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

/* 删除按钮样式 - 悬浮时才显示 */
.delete-button-hover {
  opacity: 0;
}

.history-item:hover .delete-button-hover {
  opacity: 1;
}

.delete-button-hover:hover {
  transform: scale(0.9) !important;
  box-shadow: 0 4px 8px rgba(255, 71, 87, 0.3);
}

:root[data-theme='dark'] .sidebar {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
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
}

.ai-message-user,
.ai-message-ai {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: messageSlideIn 0.4s ease-out;
}

.ai-message-user {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.ai-message-ai {
  flex-direction: row;
  justify-content: flex-start;
}

/* 消息滑入动画 */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  box-shadow: 0 2px 12px rgba(33, 150, 243, 0.08);
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





:deep(pre code) {
  background: #fffbe6 !important;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 18px 0;
  overflow-x: auto;
  display: block;
}

:deep(.hljs) {
  background: transparent;
}
:deep(.hljs-function) {
  color: #2bda1b;
}
:deep(.hljs-params) {
  color: #2bda1b;
}
:deep(.hljs-link) {
  color: #3ac7bb;
}

/*  文字日夜颜色适配 */
:deep(.ai-markdown-message) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 80%;
  font-weight: 400;
  letter-spacing: 0.01em;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 16px 20px;
  margin: 8px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

:deep(.ai-markdown-message p) {
  margin: 0.3em 0;
  font-weight: 500;
  text-align: justify;
  text-justify: inter-ideograph;
}

:deep(.ai-markdown-message ul),
:deep(.ai-markdown-message ol) {
  margin: 0.2em 0 0.2em 1.2em;
  padding-left: 0.8em;
}

:deep(.ai-markdown-message li) {
  margin: 0.1em 0;
  line-height: 1.4;
  font-weight: 500;
}

:deep(.ai-markdown-message strong) {
  font-weight: 800;
  color: #585858;
}

:deep(.ai-markdown-message blockquote) {
  font-size: 17px;
  font-family:apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
  border-left: 4px solid #7bb1fa;
  padding: 0.7em 1.2em;
  margin: 1em 0;
  border-radius: 8px;
  font-style: italic;
  background-color: #708cc2 !important;
}

:deep(.ai-markdown-message h1),
:deep(.ai-markdown-message h2),
:deep(.ai-markdown-message h3),
:deep(.ai-markdown-message h4) {
  font-weight: 600;
  color: #4299e1;
  margin: 0.8em 0 0.4em 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

:deep(.ai-markdown-message a) {
  color: #5894f5;
  text-decoration: underline;
  transition: color 0.2s;
}

:deep(.ai-markdown-message a:hover) {
  color: #174ea6;
}



:deep(.ai-markdown-message table) {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
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


:deep(.ai-markdown-message pre code) {
  background: #f8fafc !important;
  color: #2d3748 !important;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  font-size: 13px;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  line-height: 1.5;
  margin: 12px 0;
  overflow-x: auto;
  display: block;
  font-weight: 400;
}
:deep(.ai-markdown-message blockquote code) {
  padding: 4px 5px;
  color: #ffffff !important;

  font-weight:800;
  background: linear-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 8px;
}
:deep(.ai-markdown-message blockquote code:hover) {
  background: linear-gradient(rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%) !important;
  cursor: pointer;
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
  font-weight: 500;
}

/* 暗色模式下的AI消息气泡 */
:deep(.dark-mode .ai-markdown-message) {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode .ai-markdown-message p) {
  color: #e2e8f0;
  font-weight: 500;
}

:deep(.dark-mode .ai-markdown-message h1),
:deep(.dark-mode .ai-markdown-message h2),
:deep(.dark-mode .ai-markdown-message h3),
:deep(.dark-mode .ai-markdown-message h4) {
  color: #81e6d9;
}

:deep(.dark-mode .ai-markdown-message a) {
  color: #90cdf4;
}

:deep(.dark-mode .ai-markdown-message a:hover) {
  color: #63b3ed;
}

:deep(.dark-mode .ai-markdown-message pre code) {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%) !important;
  color: #f7fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.dark-mode .ai-markdown-message table) {
  background: #2d3748;
}

:deep(.dark-mode .ai-markdown-message th),
:deep(.dark-mode .ai-markdown-message td) {
  border: 1px solid #4a5568;
  color: #e2e8f0;
}

/* 复制按钮容器 */
.copy-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 0 8px;
}

/* StreamingText组件样式覆盖 */
:deep(.streaming-text-container .streaming-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif !important;
  font-size: 16px !important;
  color: #2d3748 !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  line-height: 1.6 !important;
}

:deep(.streaming-text-container .streaming-cursor) {
  color: #3b82f6 !important;
  animation: pulse 0.8s infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes pulse {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}



:deep(.dark-mode .streaming-text-container .streaming-cursor) {
  color: #60a5fa !important;
}

/* 功能按钮组样式 */
.function-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.button-container {
  position: relative;
}

/* 统一的功能按钮样式 */
.function-btn, .rag-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
}

.function-btn:hover, .rag-toggle-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.function-btn.active, .rag-toggle-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

/* RAG按钮特殊样式 */
.rag-button-container {
  position: relative;
}

/* 通用下拉框样式 */
.function-dropdown, .rag-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: dropdownSlide 0.3s ease-out;
}

.dropdown-content, .rag-dropdown-content {
  padding: 16px;
}

.dropdown-header {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.file-count {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.rag-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  min-width: 500px;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: dropdownSlide 0.3s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.rag-dropdown-content {
  padding: 20px;
}

/* RAG文件拖拽区域样式 */
.rag-container {
  width: 100%;
}

.rag-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.rag-dropzone:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.rag-dropzone.drag-over {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  transform: scale(1.02);
}

.rag-icon {
  color: #6b7280;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.rag-dropzone:hover .rag-icon {
  color: #3b82f6;
}

.rag-dropzone.drag-over .rag-icon {
  color: #10b981;
}

.rag-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.rag-text p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
}

.rag-hint {
  font-size: 12px;
  color: #9ca3af;
}

/* 已上传文件列表 */
.uploaded-files {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(243, 244, 246, 0.9);
  transform: translateX(2px);
}

.file-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  word-break: break-all;
}

.file-size {
  font-size: 11px;
  color: #9ca3af;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 暗色模式下的RAG样式 */
:root[data-theme='dark'] .rag-dropzone {
  background: rgba(31, 41, 55, 0.8);
  border-color: #4b5563;
}

:root[data-theme='dark'] .rag-dropzone:hover {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

:root[data-theme='dark'] .rag-dropzone.drag-over {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}

:root[data-theme='dark'] .rag-text h3 {
  color: #f9fafb;
}

:root[data-theme='dark'] .rag-text p {
  color: #d1d5db;
}

:root[data-theme='dark'] .uploaded-files {
  background: rgba(31, 41, 55, 0.9);
  border-color: #4b5563;
}

:root[data-theme='dark'] .files-header {
  color: #f3f4f6;
}

:root[data-theme='dark'] .file-item {
  background: rgba(55, 65, 81, 0.8);
  border-color: #4b5563;
}

:root[data-theme='dark'] .file-item:hover {
  background: rgba(55, 65, 81, 0.9);
}

:root[data-theme='dark'] .file-name {
  color: #f3f4f6;
}

:root[data-theme='dark'] .file-icon {
  color: #9ca3af;
}

/* 暗色模式下的功能按钮 */
:root[data-theme='dark'] .function-btn,
:root[data-theme='dark'] .rag-toggle-btn {
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

:root[data-theme='dark'] .function-btn:hover,
:root[data-theme='dark'] .rag-toggle-btn:hover {
  background: rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.4);
}

:root[data-theme='dark'] .function-btn.active,
:root[data-theme='dark'] .rag-toggle-btn.active {
  background: rgba(96, 165, 250, 0.25);
  border-color: rgba(96, 165, 250, 0.5);
}

:root[data-theme='dark'] .function-dropdown,
:root[data-theme='dark'] .rag-dropdown {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.5);
}

:root[data-theme='dark'] .dropdown-header {
  color: #f3f4f6;
  border-bottom-color: #4b5563;
}

/* 信息卡片网格样式 */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 32px;
  width: 100%;
  max-width: 1200px;
}

.info-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-icon {
  color: #6b7280;
}

.refresh-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-content {
  min-height: 120px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
  height: 80px;
}

/* 天气卡片样式 */
.weather-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-main {
  text-align: center;
}

.temperature {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.weather-desc {
  font-size: 16px;
  color: #6b7280;
}

.weather-details {
  display: flex;
  justify-content: space-between;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.weather-item span:first-child {
  font-size: 12px;
  color: #9ca3af;
}

.weather-item span:last-child {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* 提示卡片样式 */
.tips-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 16px 8px;
}

.tip-text {
  color: #033a88;

  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 16px;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
}

.tip-category {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 16px;
  border-radius: 16px;
  display: inline-block;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* 暗色模式下的信息卡片 */
:root[data-theme='dark'] .info-card {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
}

:root[data-theme='dark'] .card-header {
  border-bottom-color: rgba(75, 85, 99, 0.5);
}

:root[data-theme='dark'] .card-header h3 {
  color: #f3f4f6;
}

:root[data-theme='dark'] .temperature,
:root[data-theme='dark'] .weather-item span:last-child,
:root[data-theme='dark'] .tip-text {
  color: #f9fafb;
}

:root[data-theme='dark'] .tip-category {
  color: #d1d5db;
  background: rgba(96, 165, 250, 0.15);
  border-color: rgba(96, 165, 250, 0.3);
}

:root[data-theme='dark'] .refresh-btn:hover:not(:disabled) {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

/* 主题切换过渡优化 */
.theme-transition,
.theme-transition *,
.theme-transition *:before,
.theme-transition *:after {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  transition-delay: 0 !important;
}

/* 禁用主题切换时的其他动画 */
.theme-transition .chat-message,
.theme-transition .message-bubble,
.theme-transition .info-card {
  animation: none !important;
}
</style>
