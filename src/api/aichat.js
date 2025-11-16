import { useUserInfoStore } from '@/stores/user'

/**
 * 创建AI会话ID
 * @returns {Promise<string>} 返回会话ID
 */
export async function createAiContact() {
  try {
    // 获取用户 token
    const userInfoStore = useUserInfoStore()
    const token = userInfoStore.userInfo?.token
    
    console.log('准备创建AI会话，token:', token ? '已提供' : '未提供');
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 如果有 token，添加到请求头
    if (token) {
      headers.Authorization = token
    }
    
    console.log('发送请求到:', '/api/client/ai/contactId');
    console.log('请求头:', headers);
    
    const response = await fetch('/api/client/ai/contactId', {
      method: 'POST',
      headers
    });
    
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP错误响应:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('创建AI会话响应:', result);
    
    // 根据后端Result格式判断
    if (result.success === true || result.code === 200) {
      console.log('创建AI会话成功，ID:', result.data);
      return result.data;
    } else {
      const errorMsg = result.msg || result.message || '创建AI会话失败';
      console.error('业务逻辑错误:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('创建AI会话失败:', error);
    throw error;
  }
}

/**
 * AI聊天流式接口
 * @param {Object} data - 聊天数据
 * @param {string} data.msg - 消息内容
 * @param {string} data.memoryId - 会话ID
 * @param {string} data.prompt - 系统提示词（可选）
 * @returns {Promise<Response>} 返回流式响应
 */
export async function aiChatStream(data) {
  try {
    // 获取用户 token
    const userInfoStore = useUserInfoStore()
    const token = userInfoStore.userInfo?.token
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 如果有 token，添加到请求头
    if (token) {
      headers.Authorization = token
    }
    
    const response = await fetch('/api/client/ai/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('AI聊天请求失败:', error);
    throw error;
  }
}