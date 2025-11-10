import request from '/src/utils/request.js'

/**
 * 获取用户活跃度数据
 * @returns {Promise} 用户活跃度数据
 */
export const getUserActivityData = () => {
  return request.get('/analytics/user/activity')
}

/**
 * 获取好友等级分布
 * @returns {Promise} 好友等级分布数据
 */
export const getFriendLevelDistribution = () => {
  return request.get('/analytics/friend/level-distribution')
}

/**
 * 获取好友聊天排行
 * @returns {Promise} 好友聊天排行数据
 */
export const getFriendChatRanking = () => {
  return request.get('/analytics/friend/chat-ranking')
}
