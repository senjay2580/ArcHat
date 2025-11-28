import { signInService, getSignInDetailService } from '@/api/signIn'
import ArcMessage from '@/utils/ArcMessage';

// 签到处理
export const handleSignIn = async () => {
  try {
    const res = await signInService()
    if (res.code === 200) {
      return true
    } else {
      ArcMessage.error(res.msg || '签到失败')
      return false
    }
  } catch (error) {
    console.error('签到错误:', error)
    ArcMessage.error('签到失败，请稍后重试')
    return false
  }
}

// 获取当月签到详情
export const getSignInDetail = async () => {
  try {
    const res = await getSignInDetailService()
    if (res.code === 200) {
      return res.data
    } else {
      console.error('获取签到详情失败:', res.msg)
      return 0
    }
  } catch (error) {
    console.error('获取签到详情错误:', error)
    return 0
  }
}

// 检查今天是否已签到
export const checkTodaySignIn = (signInDetail) => {
  if (!signInDetail) return false
  
  const today = new Date().getDate()
  return (BigInt(signInDetail) & (1n << BigInt(today - 1))) !== 0n
}

// 获取已签到的日期数组
export const getSignedDates = (signInDetail) => {
  if (!signInDetail) return []
  
  const signedDates = []
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  for (let day = 1; day <= new Date(currentYear, currentMonth, 0).getDate(); day++) {
    const bitIndex = day - 1 // 从0开始计算
    if ((BigInt(signInDetail) & (1n << BigInt(bitIndex))) !== 0n) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      signedDates.push(dateStr)
    }
  }
  
  return signedDates
}

// 获取连续签到天数
export const getConsecutiveSignInDays = (signInDetail) => {
  if (!signInDetail) return 0
  
  const today = new Date().getDate()
  let consecutiveDays = 0
  
  for (let day = today; day >= 1; day--) {
    const bitIndex = day - 1
    if ((BigInt(signInDetail) & (1n << BigInt(bitIndex))) !== 0n) {
      consecutiveDays++
    } else {
      break
    }
  }
  
  return consecutiveDays
}

// 获取本月签到总天数
export const getTotalSignInDays = (signInDetail) => {
  if (!signInDetail) return 0
  
  let totalDays = 0
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  
  for (let day = 1; day <= daysInMonth; day++) {
    const bitIndex = day - 1
    if ((BigInt(signInDetail) & (1n << BigInt(bitIndex))) !== 0n) {
      totalDays++
    }
  }
  
  return totalDays
} 