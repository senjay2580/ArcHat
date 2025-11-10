import emitter from '@/utils/eventBus';
import { ref } from 'vue';

class ChatWebSocket {
  constructor({ url, token, onMessage, onOpen, onClose, onError }) {
    console.log('[WS-DEBUG] ChatWebSocket constructor called.');
    this.url = url;
    this.token = token;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.ws = null;
    this.heartbeatInterval = null;
    this.reconnectTimeout = null;
    this.reconnectDelay = 3000;
    this.reconnectAttempts = 0;
    this.isLoggedOut = false;
    this.lastHeartbeatResponse = Date.now();
    this.heartbeatTimeout = null;
    this.isConnecting = false;
    this.connectionStatus = ref('disconnected');
    this.waitConnLoading = ref(false);
    this.healthCheckInterval = null;
    
    // 防止浏览器后台断开WebSocket连接
    this.isPageVisible = !document.hidden;
    console.log(`[WS-DEBUG] Initial visibility state: ${this.isPageVisible ? 'visible' : 'hidden'}`);
    this.backgroundHeartbeatInterval = null;
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.backgroundStartTime = null;
    this.lastConnectionTime = null;
    this.visibilityChangeTimeout = null; // 防抖定时器
    
    // Web Worker 心跳机制
    this.heartbeatWorker = null;
    this.workerHeartbeatActive = false;
    this.initHeartbeatWorker();
    
    console.log('[WS-DEBUG] Initializing connection and visibility listeners.');
    this.connect();
    this.addVisibilityListeners();
  }

  connect() {
    console.log(`[WS-DEBUG] connect() called. isLoggedOut: ${this.isLoggedOut}, isConnecting: ${this.isConnecting}`);
    if (this.isLoggedOut || this.isConnecting) {
      return;
    }
    
    // 清理旧连接
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
    
    this.stopHeartbeat();
    this.stopBackgroundHeartbeat();
    this.stopHealthCheck();
    this.isConnecting = true;
    
    try {
      this.connectionStatus.value = 'connecting';
      this.waitConnLoading.value = true;
    } catch (error) {
      console.error('设置连接状态失败:', error);
      this.connectionStatus = ref('connecting');
      this.waitConnLoading = ref(true);
    }
    
    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('[WS-DEBUG] WebSocket connection opened successfully.');
        const now = new Date();
        this.lastConnectionTime = now;
        this.isConnecting = false;
        
        try {
          this.connectionStatus.value = 'connected';
          this.waitConnLoading.value = false;
        } catch (error) {
          console.error('onopen: 设置连接状态失败:', error);
          this.connectionStatus = ref('connected');
          this.waitConnLoading = ref(false);
        }
        
        this.reconnectAttempts = 0;
        this.lastHeartbeatResponse = Date.now();
        
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isLoggedOut) {
            // 优先使用Worker心跳，如果不可用则使用传统心跳
            if (this.heartbeatWorker) {
              this.startWorkerHeartbeat(20000); // 20秒间隔
            } else {
              this.startHeartbeat();
            }
            setTimeout(() => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isLoggedOut) {
                this.startHealthCheck();
              }
            }, 5000);
          }
        }, 5000);
        
        this.onOpen && this.onOpen(event);
        
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            emitter.emit('websocket-connected');
          }
        }, 1000);
      };

      this.ws.onmessage = (event) => {
        // console.log('[WS-DEBUG] Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 2) {
            this.lastHeartbeatResponse = Date.now();
          }
          this.onMessage && this.onMessage(event);
        } catch (error) {
          console.error('处理消息失败:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.error(`[WS-DEBUG] WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}, WasClean: ${event.wasClean}`);
        const now = new Date();
        const connectionDuration = this.lastConnectionTime ? 
          Math.round((now - this.lastConnectionTime) / 1000) : 'unknown';
        
        console.warn(`WebSocket 连接关闭: ${event.code} ${event.reason} - ${now.toLocaleTimeString()}`);
        this.isConnecting = false;
        
        try {
          this.connectionStatus.value = 'disconnected';
          this.waitConnLoading.value = false;
        } catch (error) {
          console.error('onclose: 设置连接状态失败:', error);
          this.connectionStatus = ref('disconnected');
          this.waitConnLoading = ref(false);
        }
        
        this.stopHeartbeat();
        this.stopBackgroundHeartbeat();
        this.stopHealthCheck();
        this.onClose && this.onClose(event);
        
        if (!this.isLoggedOut && event.code !== 1000) {
          this.reconnect();
        } else {
          emitter.emit('websocket-reconnect');
        }
      };

      this.ws.onerror = (event) => {
        console.error('[WS-DEBUG] WebSocket error observed:', event);
        console.error('WebSocket 错误:', event);
        this.isConnecting = false;
        this.connectionStatus.value = 'disconnected';
        this.waitConnLoading.value = false;
        this.onError && this.onError(event);
      };
      
      this.addNetworkListeners();
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error);
      this.isConnecting = false;
      this.connectionStatus.value = 'disconnected';
      this.onError && this.onError(error);
      if (!this.isLoggedOut) {
        this.reconnect();
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WS-DEBUG] Sending data:', JSON.stringify(data));
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket 未连接，无法发送消息');
    }
  }

  startHealthCheck() {
    this.stopHealthCheck();
    this.healthCheckInterval = setInterval(() => {
      if (this.isLoggedOut) {
        this.stopHealthCheck();
        return;
      }
      
      if (this.ws && (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING)) {
        if (this.connectionStatus && this.connectionStatus.value === 'connected') {
          try {
            this.connectionStatus.value = 'disconnected';
          } catch (error) {
            console.error('更新连接状态失败:', error);
          }
        }
      }
    }, 60000);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  initHeartbeatWorker() {
    try {
      this.heartbeatWorker = new Worker('/heartbeat-worker.js');
      
      this.heartbeatWorker.onmessage = (e) => {
        const { type, timestamp } = e.data;
        
        switch(type) {
          case 'WORKER_READY':
            console.log('[WS-DEBUG] Heartbeat Worker ready');
            break;
          case 'HEARTBEAT_TICK':
            // Worker发送心跳信号，我们在主线程发送WebSocket心跳
            if (this.workerHeartbeatActive && this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.send({ type: 2 });
            }
            break;
          case 'PONG':
            console.log('[WS-DEBUG] Worker pong received');
            break;
        }
      };
      
      this.heartbeatWorker.onerror = (error) => {
        console.error('[WS-DEBUG] Heartbeat Worker error:', error);
        // 如果Worker失败，回退到传统心跳
        this.fallbackToTraditionalHeartbeat();
      };
    } catch (error) {
      console.error('[WS-DEBUG] Failed to create Heartbeat Worker:', error);
      this.fallbackToTraditionalHeartbeat();
    }
  }
  
  startWorkerHeartbeat(interval = 20000) {
    console.log(`[WS-DEBUG] Starting Worker heartbeat (${interval/1000}s interval).`);
    
    if (this.heartbeatWorker) {
      this.workerHeartbeatActive = true;
      this.heartbeatWorker.postMessage({ type: 'START_HEARTBEAT', interval });
    } else {
      this.fallbackToTraditionalHeartbeat();
    }
  }
  
  stopWorkerHeartbeat() {
    console.log('[WS-DEBUG] Stopping Worker heartbeat.');
    
    this.workerHeartbeatActive = false;
    if (this.heartbeatWorker) {
      this.heartbeatWorker.postMessage({ type: 'STOP_HEARTBEAT' });
    }
  }
  
  fallbackToTraditionalHeartbeat() {
    console.log('[WS-DEBUG] Falling back to traditional heartbeat.');
    this.startHeartbeat();
  }

  startHeartbeat() {
    console.log('[WS-DEBUG] Starting traditional heartbeat (20s interval).');
    this.stopHeartbeat();
    this.stopBackgroundHeartbeat(); // 确保停止后台心跳
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isLoggedOut) {
        this.stopHeartbeat();
        return;
      }
      
      if (!this.connectionStatus || this.connectionStatus.value !== 'connected') {
        this.stopHeartbeat();
        return;
      }
      
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.stopHeartbeat();
        return;
      }

      const now = Date.now();
      const timeSinceLastResponse = now - this.lastHeartbeatResponse;
      
      if (timeSinceLastResponse > 180000) {
        console.warn('心跳超时（3分钟无响应），关闭连接');
        this.ws.close(1001, '心跳超时');
        return;
      }
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 2 });
      }
    }, 20000); // 20秒间隔，传统备用心跳
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  startBackgroundHeartbeat() {
    console.log('[WS-DEBUG] Starting aggressive background heartbeat (5s interval).');
    this.stopBackgroundHeartbeat();
    this.stopHeartbeat(); // 确保停止前台心跳
    
    // 立即发送第一个后台心跳包
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 2 });
    }
    
    this.backgroundHeartbeatInterval = setInterval(() => {
      if (this.isLoggedOut) {
        this.stopBackgroundHeartbeat();
        return;
      }
      
      if (this.isPageVisible) {
        this.stopBackgroundHeartbeat();
        return;
      }
      
      if (!this.connectionStatus || this.connectionStatus.value !== 'connected') {
        this.stopBackgroundHeartbeat();
        return;
      }
      
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.stopBackgroundHeartbeat();
        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 2 });
      }
    }, 5000); // 5秒间隔，超短心跳对抗浏览器后台节流
  }

  stopBackgroundHeartbeat() {
    if (this.backgroundHeartbeatInterval) {
      clearInterval(this.backgroundHeartbeatInterval);
      this.backgroundHeartbeatInterval = null;
    }
  }

  reconnect() {
    if (this.reconnectTimeout || this.isLoggedOut || this.isConnecting) {
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts})...`);
    
    if (this.reconnectAttempts > 10) {
      console.warn('重连次数过多，停止重连');
      emitter.emit('websocket-reconnect');
      return;
    }
    
    let delay;
    if (this.reconnectAttempts <= 3) {
      delay = 3000;
    } else if (this.reconnectAttempts <= 6) {
      delay = 8000;
    } else {
      delay = 15000;
    }
    
    console.log(`将在 ${delay}ms 后重连`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  addVisibilityListeners() {
    console.log('[WS-DEBUG] addVisibilityListeners called.');
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      window.removeEventListener('focus', this.visibilityChangeHandler);
      window.removeEventListener('blur', this.visibilityChangeHandler);
    }
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('focus', this.visibilityChangeHandler);
    window.addEventListener('blur', this.visibilityChangeHandler);
  }

  removeVisibilityListeners() {
    console.log('[WS-DEBUG] removeVisibilityListeners called.');
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      window.removeEventListener('focus', this.visibilityChangeHandler);
      window.removeEventListener('blur', this.visibilityChangeHandler);
    }
  }

  handleVisibilityChange() {
    const isNowVisible = !document.hidden;
    console.log(`[WS-DEBUG] Page visibility changed: ${isNowVisible ? 'visible' : 'hidden'}`);
    
    this.isPageVisible = isNowVisible;
    
    // 使用Worker心跳时，不需要区分前后台，因为Worker不受节流影响
    if (!this.isPageVisible) {
      this.backgroundStartTime = Date.now();
      console.log('[WS-DEBUG] Page hidden - Worker heartbeat continues unaffected');
    } else {
      this.backgroundStartTime = null;
      console.log('[WS-DEBUG] Page visible - checking connection status');
      
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        console.warn('页面返回前台，发现WebSocket已断开，立即重连');
        this.reconnect();
      }
    }
  }

  addNetworkListeners() {
    this.removeNetworkListeners();
    
    if (typeof window !== 'undefined' && 'navigator' in window) {
      this.onlineHandler = () => {
        console.log('网络已连接，检查WebSocket状态');
        if (!this.isLoggedOut && (!this.connectionStatus || this.connectionStatus.value !== 'connected')) {
          setTimeout(() => {
            if (!this.isConnected()) {
              console.log('网络恢复后尝试重连');
              this.manualReconnect();
            }
          }, 1000);
        }
      };
      
      this.offlineHandler = () => {
        console.log('网络已断开');
        if (this.connectionStatus && typeof this.connectionStatus === 'object' && 'value' in this.connectionStatus) {
          this.connectionStatus.value = 'disconnected';
        }
      };
      
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  removeNetworkListeners() {
    if (typeof window !== 'undefined') {
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler);
        this.onlineHandler = null;
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler);
        this.offlineHandler = null;
      }
    }
  }

  close() {
    this.isLoggedOut = true;
    
    try {
      this.connectionStatus.value = 'disconnected';
    } catch (error) {
      console.error('close: 设置连接状态失败:', error);
      this.connectionStatus = ref('disconnected');
    }
    
    this.stopHeartbeat();
    this.stopBackgroundHeartbeat();
    this.stopWorkerHeartbeat();
    this.stopHealthCheck();
    this.removeNetworkListeners();
    this.removeVisibilityListeners();
    
    // 清理Worker
    if (this.heartbeatWorker) {
      this.heartbeatWorker.terminate();
      this.heartbeatWorker = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close(1000, '正常关闭');
      this.ws = null;
    }
  }

  logout() {
    console.log('用户登出，关闭WebSocket连接');
    console.log('[WS-DEBUG] User logout initiated.');
    this.close();
  }

  manualReconnect() {
    console.log('手动重连 WebSocket');
    if (this.isConnecting) {
      console.log('正在连接中，请勿重复点击');
      return;
    }
    this.reconnectAttempts = 0;
    this.stopHeartbeat();
    this.stopBackgroundHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
    }
    
    try {
      this.connectionStatus.value = 'disconnected';
      this.waitConnLoading.value = true;
    } catch (error) {
      console.error('重置连接状态失败:', error);
      this.connectionStatus = ref('disconnected');
      this.waitConnLoading = ref(true);
    }
    
    this.connect();
  }

  getConnectionStatus() {
    return this.connectionStatus.value;
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default ChatWebSocket;
