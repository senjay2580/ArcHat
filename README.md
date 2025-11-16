<div align="center">
  <img width="200px" height="180px" src="public/favicon.ico" alt="ArcChat Logo" style="
    margin-bottom: 20px;
    filter: brightness(1.05) contrast(1.1);
    transition: all 0.3s ease;
  " />
  <h1 style="
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
    font-size: 4.5rem; 
    font-weight: 700; 
    background: linear-gradient(135deg, #007AFF 0%, #2ba1d8ff 50%, #0e76fdff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 10px 0 20px 0;
    letter-spacing: -3px;
    line-height: 1.1;
    text-align: center;
  ">ArcHat</h1>
</div>
<div align="center">基于vite、vue3、javaScript、pinia 构建的现代化即时通讯系统</div>




<div align="center">
  <p>
    <a href="https://github.com/Senjay2580/ArcHat/stargazers">
      <img src="https://img.shields.io/github/stars/Senjay2580/ArcHat?style=social" alt="GitHub Stars">
    </a>
    <a href="https://github.com/Senjay2580/ArcHat/forks">
      <img src="https://img.shields.io/github/forks/Senjay2580/ArcHat?style=social" alt="GitHub Forks">
    </a>
    <a href="https://github.com/Senjay2580/ArcHat/watchers">
      <img src="https://img.shields.io/github/watchers/Senjay2580/ArcHat?style=social" alt="GitHub Watchers">
    </a>
  </p>
</div>


<div align="center">
  <p>
    <img src="https://img.shields.io/badge/Vue3-35495E?logo=vue.js&logoColor=4FC08D">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff">
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff">
    <img src="https://img.shields.io/badge/Element_Plus-409EFF?logo=element&logoColor=fff">
    <img src="https://img.shields.io/badge/Pinia-FFD666?logo=vue.js&logoColor=fff">
    <img src="https://img.shields.io/badge/Sass-CC6699?logo=sass&logoColor=fff">
    <img src="https://img.shields.io/badge/WebRTC-333333?logo=webrtc&logoColor=fff">
  </p>
</div>


## **🌐 支持平台**

| **平台** | **支持版本** |
|------|---------|
| **Chrome/Edge** | **Chrome 90+, Edge 90+** |
| **Firefox** | **Firefox 88+** |
| **Safari** | **Safari 14+ (WebRTC 支持有限)** |
| **移动端浏览器** | **iOS Safari 14+, Chrome Mobile 90+** |
| **不支持** | **IE 11 及更早版本** |

## **📝 项目介绍**

**ArcHat 是一款基于 Vite、Vue 3 和 TypeScript 构建的现代化即时通讯系统。它利用了 Vite 的快速构建能力和 Vue 3 的组合式 API，结合了 TypeScript 的类型安全特性，为用户提供了一个高效、美观和易用的通讯解决方案。**



### **安装部署**

#### **方式一：本地开发（推荐）**
```bash
# 1. 克隆项目
git clone https://github.com/your-username/ArcHat.git
cd ArcHat/Client-site

# 2. 安装依赖
npm install
# 或使用 pnpm（推荐）
pnpm install

# 3. 配置环境变量
# 复制环境配置文件
cp .env.development .env

# 编辑 .env 文件，配置后端 API 地址和 WebSocket 地址
# VITE_WEBSOCKET_URL=ws://localhost:8090

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3010
```

#### **方式二：Docker 部署**
```bash
# 1. 构建镜像
docker build -t archat-client .

# 2. 运行容器
docker run -d -p 80:80 --name archat archat-client

# 访问 http://localhost
```



## 🖼️ 项目预览

### 🏠 登录注册 & 主页

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="preview/Login^register.png" alt="登录注册" />
        <p align="center"><b>登录注册界面</b></p>
      </td>
      <td width="50%">
        <img src="preview/home.png" alt="主页" />
        <p align="center"><b>主页（日间模式）</b></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="preview/home-night.png" alt="主页-夜间" />
        <p align="center"><b>主页（夜间模式）</b></p>
      </td>
      <td width="50%">
        <img src="preview/search.png" alt="搜索功能" />
        <p align="center"><b>好友/群聊全局搜索</b></p>
      </td>
    </tr>
  </table>
</div>


### 💬 聊天功能

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="preview/chat.png" alt="私聊" />
        <p align="center"><b>私聊界面</b></p>
      </td>
      <td width="50%">
        <img src="preview/groupchat1.png" alt="群聊" />
        <p align="center"><b>群聊界面</b></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="preview/groupchat2.png" alt="群聊消息" />
        <p align="center"><b>群聊信息</b></p>
      </td>
      <td width="50%">
        <img src="preview/groupManage.png" alt="群组管理" />
        <p align="center"><b>群聊管理</b></p>
      </td>
    </tr>
  </table>
</div>


### 🤖 AI 智能助手

<div align="center">
  <table>
    <tr>
      <td width="33.3%">
        <img src="preview/AiWelcome.png" alt="AI欢迎界面" />
        <p align="center"><b>AI 欢迎界面</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/Aichat1.png" alt="AI聊天1" />
        <p align="center"><b>AI 对话界面(一)</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/Aichat2.png" alt="AI聊天2" />
        <p align="center"><b>AI 对话界面（二）</b></p>
      </td>
    </tr>
  </table>
</div>


### 📞 音视频通话

<div align="center">
  <table>
    <tr>
      <td width="33.3%">
        <img src="preview/audio_call.png" alt="语音通话" />
        <p align="center"><b>语音通话待机</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/video_call1.png" alt="视频通话1" />
        <p align="center"><b>视频通话待机</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/video_call2.png" alt="视频通话2" />
        <p align="center"><b>视频通话界面</b></p>
      </td>
    </tr>
  </table>
</div>


### 👤 用户中心 & 效率工具

<div align="center">
  <table>
    <tr>
      <td width="33.3%">
        <img src="preview/userHub.png" alt="用户中心" />
        <p align="center"><b>用户中心</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/mail.png" alt="邮箱" />
        <p align="center"><b>消息中心</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/todo.png" alt="待办事项" />
        <p align="center"><b>数据统计和其他功能</b></p>
      </td>
    </tr>
    <tr>
      <td width="33.3%">
        <img src="preview/TodoList.png" alt="待办列表" />
        <p align="center"><b>待办列表详情</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/note1.png" alt="笔记" />
        <p align="center"><b>笔记编辑器</b></p>
      </td>
      <td width="33.3%">
        <img src="preview/note2.png" alt="笔记列表" />
        <p align="center"><b>笔记管理</b></p>
      </td>
    </tr>
    <tr>
      <td colspan="3" align="center">
        <img src="preview/note3.png" alt="笔记富文本" style="max-width: 66%;" />
        <p align="center"><b>富文本笔记编辑</b></p>
      </td>
    </tr>
  </table>
</div>










## **✨ 功能特性**

### **🎯 开发进度一览**


### **🔐 用户认证系统**
| **描述** | **状态** |
|------|------|
| **账号密码登录** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **现代化登录界面** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **Token 认证机制** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **💬 消息通信**
| **描述** | **状态** |
|------|------|
| **一对一私聊** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **群组聊天** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **消息撤回** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **@提醒功能** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **消息已读状态** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **表情包功能** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **消息右键菜单** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **文件上传下载** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **图片预览** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **消息搜索** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **🤝 社交管理**
| **描述** | **状态** |
|------|------|
| **好友添加与删除** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **好友搜索** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **群组创建与管理** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **用户详情卡片** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **群组详情页面** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **📞 音视频通话**
| **描述** | **状态** |
|------|------|
| **语音通话** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **视频通话** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **静音/取消静音** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **摄像头开关** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **设备切换** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **来电提醒** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **通话悬浮气泡** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **✏️ 富文本编辑**
| **描述** | **状态** |
|------|------|
| **基础格式化** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **@提醒列表** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **代码块高亮** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **链接插入** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **图片插入** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **表格支持** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **表情支持** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **🎨 界面与交互**
| **描述** | **状态** |
|------|------|
| **日间/夜间模式** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **自定义主题色** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **响应式布局** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **流畅动画** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **消息通知** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **图片查看器** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **👤 用户中心**
| **描述** | **状态** |
|------|------|
| **签到系统** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **等级体系** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **数据可视化** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **待办事项** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **资源收藏** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **签到日历** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **🤖 AI 集成**
| **描述** | **状态** |
|------|------|
| **AI 聊天助手** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **Markdown 渲染** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **代码高亮** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **流式输出** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **上下文记忆** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

### **📬 消息中心**
| **描述** | **状态** |
|------|------|
| **通知中心** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **邮箱功能** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |
| **好友申请通知** | **![完成](https://img.shields.io/badge/✅-完成-008080?style=flat&labelColor=e6f7f7&color=008080)** |

---

## **🛠 技术选型**

### **核心技术栈**
| **技术** | **版本** | **用途** |
|------|------|------|
| **Vue 3** | **3.5.13** | **渐进式前端框架，使用 Composition API** |
| **Vite** | **6.2.4** | **新一代构建工具，开发体验极佳** |
| **Element Plus** | **2.9.10** | **Vue 3 组件库，提供基础 UI 组件** |
| **Pinia** | **3.0.1** | **官方状态管理库** |
| **Vue Router** | **4.5.0** | **官方路由管理器** |
| **Axios** | **1.9.0** | **HTTP 客户端** |

### **特色技术库**
| **技术** | **用途** | **选型理由** |
|------|------|----------|
| **Tiptap** | **富文本编辑器** | **基于 ProseMirror，扩展性强** |
| **Highlight.js** | **代码语法高亮** | **支持 200+ 语言** |
| **ECharts** | **数据可视化** | **配置灵活，图表类型丰富** |
| **Marked** | **Markdown 解析** | **轻量级，解析速度快** |
| **Tippy.js** | **工具提示** | **高性能 Tooltip 库** |
| **Lucide Vue** | **图标库** | **现代化图标集** |

### **WebRTC 技术方案**
- **信令服务器：复用 WebSocket 连接传输 SDP/ICE 候选**
- **STUN/TURN：使用 Google 公共 STUN 服务器**
- **编码器：Opus（音频）/ VP8（视频）**
- **NAT穿透：支持 P2P 直连 + TURN 中继降级**

