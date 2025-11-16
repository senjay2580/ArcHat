import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createAiContact } from '@/api/aichat'

export const useAiChatStore = defineStore('aiChat', () => {
  // #region 状态定义
  const currentChatId = ref(1)
  const chatHistory = ref([
    {
      id: 1,
      title: '新对话',
      lastMessage: '开始新的对话...',
      timestamp: new Date(),
      messages: [],
      memoryId: null
    }
  ])
  // #endregion

  // #region 聊天会话管理
  /**
   * 创建新聊天
   */
  const createNewChat = () => {
    // 使用时间戳 + 随机数生成更唯一的ID
    const newChatId = Date.now() + Math.floor(Math.random() * 1000)
    
    // 检查是否已经存在相同ID的聊天（防止重复创建）
    const existingChat = chatHistory.value.find(chat => chat.id === newChatId)
    if (existingChat) {
      currentChatId.value = newChatId
      return newChatId
    }
    
    const newChat = {
      id: newChatId,
      title: '新对话',
      lastMessage: '开始新的对话...',
      timestamp: new Date(),
      messages: [],
      memoryId: null
    }

    chatHistory.value.unshift(newChat)
    currentChatId.value = newChatId
    
    return newChatId
  }

  /**
   * 切换聊天
   */
  const switchChat = (chatId) => {
    currentChatId.value = chatId
  }

  /**
   * 删除聊天
   */
  const deleteChat = (chatId) => {
    if (chatHistory.value.length <= 1) return false

    // 检查要删除的聊天是否存在
    const chatToDelete = chatHistory.value.find(chat => chat.id === chatId)
    if (!chatToDelete) return false

    const originalLength = chatHistory.value.length
    chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId)

    // 确认删除成功（数组长度减少了1）
    if (chatHistory.value.length !== originalLength - 1) return false

    // 如果删除的是当前聊天，切换到第一个聊天
    if (currentChatId.value === chatId) {
      const firstChat = chatHistory.value[0]
      if (firstChat) {
        currentChatId.value = firstChat.id
      }
    }
    
    return true
  }

  /**
   * 更新聊天信息
   */
  const updateChatInfo = (message) => {
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

  /**
   * 保存消息到当前聊天
   */
  const saveMessageToChat = (messages) => {
    const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
    if (currentChat) {
      currentChat.messages = [...messages]
    }
  }

  /**
   * 获取当前聊天的消息
   */
  const getCurrentChatMessages = () => {
    const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
    return currentChat ? currentChat.messages : []
  }

  /**
   * 获取或创建会话记忆ID
   */
  const ensureMemoryId = async () => {
    const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
    if (!currentChat) {
      throw new Error('当前聊天会话不存在')
    }

    // 如果当前会话没有memoryId，创建一个
    if (!currentChat.memoryId) {
      try {
        currentChat.memoryId = await createAiContact()
        console.log('创建AI会话ID:', currentChat.memoryId)
      } catch (error) {
        console.error('创建AI会话失败:', error)
        throw new Error('创建AI会话失败，请重试')
      }
    }

    return currentChat.memoryId
  }

  /**
   * 获取当前聊天标题
   */
  const getCurrentChatTitle = () => {
    const currentChat = chatHistory.value.find(chat => chat.id === currentChatId.value)
    return currentChat ? currentChat.title : '新对话'
  }
  // #endregion

  return {
    // 状态
    currentChatId,
    chatHistory,
    
    // 方法
    createNewChat,
    switchChat,
    deleteChat,
    updateChatInfo,
    saveMessageToChat,
    getCurrentChatMessages,
    ensureMemoryId,
    getCurrentChatTitle
  }
}, {
  persist: {
    key: 'aiChat',
    storage: localStorage,
    paths: ['currentChatId', 'chatHistory'],
    serializer: {
      serialize: (state) => {
        // 自定义序列化，处理Date对象
        return JSON.stringify(state, (key, value) => {
          if (value instanceof Date) {
            return { __type: 'Date', value: value.toISOString() }
          }
          return value
        })
      },
      deserialize: (value) => {
        // 自定义反序列化，恢复Date对象
        return JSON.parse(value, (key, value) => {
          if (value && value.__type === 'Date') {
            return new Date(value.value)
          }
          return value
        })
      }
    }
  }
})
