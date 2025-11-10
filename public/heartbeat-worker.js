// heartbeat-worker.js - WebSocket心跳Web Worker
// 运行在独立线程中，不受浏览器后台节流影响

let heartbeatInterval = null;
let isRunning = false;

// 监听主线程消息
self.addEventListener('message', function(e) {
  const { type, interval } = e.data;
  
  switch(type) {
    case 'START_HEARTBEAT':
      startHeartbeat(interval || 20000); // 默认20秒
      break;
    case 'STOP_HEARTBEAT':
      stopHeartbeat();
      break;
    case 'PING':
      // 响应主线程的ping，确认Worker正常工作
      self.postMessage({ type: 'PONG', timestamp: Date.now() });
      break;
  }
});

function startHeartbeat(interval) {
  console.log(`[Worker] Starting heartbeat with ${interval}ms interval`);
  
  // 停止现有的心跳
  stopHeartbeat();
  
  isRunning = true;
  
  // 立即发送第一个心跳
  sendHeartbeat();
  
  // 设置定时器
  heartbeatInterval = setInterval(() => {
    if (isRunning) {
      sendHeartbeat();
    }
  }, interval);
}

function stopHeartbeat() {
  console.log('[Worker] Stopping heartbeat');
  
  isRunning = false;
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function sendHeartbeat() {
  // 发送心跳信号给主线程
  self.postMessage({
    type: 'HEARTBEAT_TICK',
    timestamp: Date.now()
  });
}

// Worker启动时发送就绪信号
self.postMessage({
  type: 'WORKER_READY',
  timestamp: Date.now()
});
