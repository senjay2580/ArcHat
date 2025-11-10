<template>
  <div class="data-visualization">
    <div class="visualization-header">
      <h3 class="visualization-title">数据统计</h3>
      <div class="time-filter">
        <el-select v-model="selectedTimeRange" placeholder="选择时间范围" @change="handleTimeRangeChange">
          <el-option label="最近7天" value="7" />
          <el-option label="最近30天" value="30" />
          <el-option label="最近90天" value="90" />
        </el-select>
      </div>
    </div>

    <div class="charts-container">
      <!-- 好友聊天排行图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4 class="chart-title">好友聊天排行</h4>
         
        </div>
        <div class="chart-content">
          <v-chart 
            ref="friendChatChart"
            class="chart" 
            :option="friendChatOption" 
            :loading="friendChatLoading"
            autoresize
            @mounted="handleChartResize"
            style="width:100%;height:100%;"
          />
        </div>
      </div>

      <!-- 用户活跃度图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4 class="chart-title">活跃度统计</h4>
        
        </div>
        <div class="chart-content">
          <v-chart 
            ref="activityChart"
            class="chart" 
            :option="activityOption" 
            :loading="activityLoading"
            autoresize
            @mounted="handleChartResize"
          />
        </div>
      </div>

      <!-- 好友等级占比饼图 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h4 class="chart-title">好友等级分布</h4>
       
        </div>
        <div class="chart-content">
          <v-chart 
            ref="friendLevelChart"
            class="chart" 
            :option="friendLevelOption" 
            :loading="friendLevelLoading"
            autoresize
            @mounted="handleChartResize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { 
  getUserActivityData, 
  getFriendLevelDistribution, 
  getFriendChatRanking 
} from '@/api/analytics';
import emitter from '@/utils/eventBus';
import { calculateLevel } from '@/utils/exp';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
]);

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  friendList: {
    type: Array,
    default: () => []
  }
});

// 获取用户标识符（可能是用户名或用户ID）
const getUserIdentifier = () => {
  return props.userId;
};

// 响应式数据
const selectedTimeRange = ref('30');
const friendChatLoading = ref(false);
const activityLoading = ref(false);
const friendLevelLoading = ref(false);

// 图表实例引用
const friendChatChart = ref(null);
const activityChart = ref(null);
const friendLevelChart = ref(null);

// 模拟数据 - 实际项目中这些数据应该从API获取
const friendChatData = ref([
  { name: '张三', count: 156 },
  { name: '李四', count: 89 },
  { name: '王五', count: 67 },
  { name: '赵六', count: 45 },
  { name: '钱七', count: 34 }
]);

const activityData = ref([]);
// 统计好友等级分布
const friendLevelData = computed(() => {
  // 统计每个等级的人数
  const levelCount = {};
  let total = 0;
  props.friendList.forEach(friend => {
    const level = calculateLevel(friend.exp || 0);
    const key = level + '级';
    levelCount[key] = (levelCount[key] || 0) + 1;
    total++;
  });
  // 只显示1-8级
  const result = [];
  for (let i = 1; i <= 8; i++) {
    const key = i + '级';
    const count = levelCount[key] || 0;
    result.push({
      level: key,
      count,
      percentage: total ? Math.round((count / total) * 1000) / 10 : 0
    });
  }
  return result;
});

// 生成活跃度数据
const generateActivityData = () => {
  const data = [];
  const days = parseInt(selectedTimeRange.value);
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1 // 模拟数据
    });
  }
  return data;
};



// 好友聊天排行图配置
const friendChatOption = computed(() => ({
  title: {
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: '{b}: {c} 条消息'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: friendChatData.value.map(item => item.name),
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '消息数量'
  },
  series: [
    {
      name: '聊天记录',
      type: 'bar',
      data: friendChatData.value.map(item => item.count),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#67C23A' }
          ]
        }
      },
      emphasis: {
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#66B1FF' },
              { offset: 1, color: '#85CE61' }
            ]
          }
        }
      }
    }
  ]
}));

// 活跃度图表配置
const activityOption = computed(() => ({
  title: {

    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>上线次数: {c} 次'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: activityData.value.map(item => item.date),
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '上线次数'
  },
  series: [
    {
      name: '上线次数',
      type: 'line',
      data: activityData.value.map(item => item.count),
      smooth: true,
      lineStyle: {
        color: '#409EFF',
        width: 3
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      }
    }
  ]
}));

// 好友等级分布饼图配置
const friendLevelOption = computed(() => ({
  title: {
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: friendLevelData.value.map(item => item.level),
    textStyle: {
      fontSize: 16,
      color: getLegendTextColor()
    }
  },
  series: [
    {
      name: '好友等级',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: friendLevelData.value.map(item => ({
        name: item.level,
        value: item.count,
        itemStyle: {
          color: getLevelColor(item.level)
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: true,
        formatter: '{b}: {c}人 ({d}%)',
        fontSize: 16,
        fontWeight: 'bold',
        color: getLabelTextColor(),
        fontFamily: 'PingFang SC, Microsoft YaHei, Arial',
        rich: {
          b: {
            color: getLabelTextColor(),
            fontFamily: 'PingFang SC, Microsoft YaHei, Arial',
          }
        }
      }
    }
  ]
}));

// 获取等级颜色
const getLevelColor = (level) => {
  const colors = {
    '1级': '#FF6B6B',
    '2级': '#4ECDC4',
    '3级': '#45B7D1',
    '4级': '#96CEB4',
    '5级': '#FFEAA7',
    '6级': '#DDA0DD',
    '7级': '#FFA500', // 新增7级橙色
    '8级': '#8A2BE2'  // 新增8级蓝紫色
  };
  return colors[level] || '#409EFF';
};

// 饼图标签和图例颜色适配日夜间模式
function getLabelTextColor() {
  return '#0077ff';
}
function getLegendTextColor() {
  return '#00000';
}


// 事件处理
const handleTimeRangeChange = () => {
  loadData();
};

// 处理图表重新渲染
const handleChartResize = async () => {
  await nextTick();
  // 添加延迟确保DOM更新完成
  setTimeout(() => {
    if (friendChatChart.value) {
      friendChatChart.value.resize();
    }
    if (activityChart.value) {
      activityChart.value.resize();
    }
    if (friendLevelChart.value) {
      friendLevelChart.value.resize();
    }
  }, 50);
};

// 数据加载函数
const loadData = async () => {
  try {
    // 加载活跃度数据
    activityLoading.value = true;
    try {
      // TODO: 取消注释以下代码以调用真实API
      // const response = await getUserActivityData(getUserIdentifier(), selectedTimeRange.value);
      // if (response.code === 200) {
      //   activityData.value = response.data;
      // } else {
      //   throw new Error(response.msg || '获取活跃度数据失败');
      // }
      
      // 使用模拟数据
      activityData.value = generateActivityData();
    } catch (error) {
      console.error('获取活跃度数据失败:', error);
      // 使用模拟数据作为备选
      activityData.value = generateActivityData();
    }
    
    // 加载好友等级数据
    friendLevelLoading.value = true;
    try {
      // TODO: 取消注释以下代码以调用真实API
      // const levelResponse = await getFriendLevelDistribution(getUserIdentifier());
      // if (levelResponse.code === 200) {
      //   friendLevelData.value = levelResponse.data;
      // } else {
      //   throw new Error(levelResponse.msg || '获取好友等级分布数据失败');
      // }
      
      // 使用模拟数据
      // friendLevelData.value 保持不变，使用默认的模拟数据
    } catch (error) {
      console.error('获取好友等级分布数据失败:', error);
      // 使用默认的模拟数据作为备选
    }
    
    // 加载好友聊天数据
    friendChatLoading.value = true;
    try {
      // TODO: 取消注释以下代码以调用真实API
      // const chatResponse = await getFriendChatRanking(getUserIdentifier(), selectedTimeRange.value);
      // if (chatResponse.code === 200) {
      //   friendChatData.value = chatResponse.data;
      // } else {
      //   throw new Error(chatResponse.msg || '获取好友聊天排行数据失败');
      // }
      
      // 使用模拟数据
      // friendChatData.value 保持不变，使用默认的模拟数据
    } catch (error) {
      console.error('获取好友聊天排行数据失败:', error);
      // 使用默认的模拟数据作为备选
    }
    
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('数据加载失败，请稍后重试');
  } finally {
    activityLoading.value = false;
    friendLevelLoading.value = false;
    friendChatLoading.value = false;
  }
};

// 监听时间范围变化
watch(selectedTimeRange, () => {
  loadData();
});

// 监听窗口大小变化
let resizeTimer = null;
const handleWindowResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    handleChartResize();
  }, 200);
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize);
  // 监听侧边栏状态变化
  emitter.on('sidebar-toggle', handleChartResize);
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  window.removeEventListener('resize', handleWindowResize);
  // 清理侧边栏事件监听器
  emitter.off('sidebar-toggle', handleChartResize);
});
</script>

<style scoped>
.data-visualization {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.visualization-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.time-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}


.chart-content {
  flex: 1 1 0;
  width: 100%;
  min-height: 250px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart {
  width: 100% !important;
  height: 100% !important;
  min-height: 250px;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
}



/* 暗色模式适配 */
.dark-mode .data-visualization {
  background: #2b2d3a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .visualization-title {
  color: #e5eaf3;
}

.dark-mode .visualization-header {
  border-bottom-color: #363636;
}

.dark-mode .chart-card {
  background: #1a1d2d;
  border-color: #363636;
}

.dark-mode .chart-title {
  color: #e5eaf3;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .visualization-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .chart-card {
    min-height: 250px;
  }
  
  .chart {
    min-height: 180px;
  }
}

/* 确保图表在容器变化时平滑过渡 */
.charts-container {
  transition: all 0.3s ease;
}

.chart-card {
  transition: all 0.3s ease;
}
</style> 

