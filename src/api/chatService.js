import request from '@/utils/request'

// 对数据库聊天记录进行crud

export const getFriendMessageList = (params) => {
  return request.post('/message/friend/list', params)
}

export const getMessageById = (id) => {
  return request.get(`/message/${id}`)
}

// 查询群聊前100条聊天记录
export const getGroupMessageList = (params) => {
  return request.post('/message/group/list', params)
} 

export const sendMsg = (params) => {
  return request.post('/chat/msg', params)
}

// 撤回消息
export const recallMsg = (params) => {
  return request.put('/chat/msg/recall', params)
}



