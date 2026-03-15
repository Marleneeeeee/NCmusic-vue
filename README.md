# NCmusic-vue 🎵

一款基于 **Vue 3** + **Pinia** + **Vite** 构建的高颜值音乐流媒体 Web 应用。

> **🚧 项目声明**：本项目目前仍处于 **Active Development (积极开发与完善中)** 阶段。部分功能正在迭代，UI 细节也在持续优化，欢迎 Fork 或提 Issue 交流。

---

## ✨ 项目亮点

* **沉浸式红黑视觉**：深度还原网易云音乐经典配色方案，打造极简、硬朗的黑胶质感。
* **全局状态管理**：利用 **Pinia** 维护全局播放状态，实现跨页面的无缝播放体验。
* **极致滚动优化**：针对 `.main-content` 容器定制化滚动逻辑，解决 Tab 切换与详情页返回的滚动条重置难题。
* **高性能列表渲染**：采用 `IntersectionObserver` 实现搜索结果的懒加载与无限滚动。

---

## 🛠️ 技术栈

| 工具 | 作用 |
| :--- | :--- |
| **Vue 3 (Composition API)** | 核心开发框架 |
| **Vite** | 下一代前端构建工具 |
| **Pinia** | 极简、类型安全的全局状态管理 |
| **Vue Router** | 单页应用路由控制（支持嵌套路由） |
| **Axios** | 异步请求封装与 API 通信 |

---

## 🚀 快速启动

在运行本项目之前，**请务必确保你的本地环境已部署并运行了网易云音乐后台 API**。

### 1. 运行后端 API
本项目依赖于 [NeteaseCloudMusicApi](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)。
默认 API 端口为 http://localhost:3000

### 2.运行本项目
```bash
# 1. 安装项目依赖
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 访问项目
# 打开浏览器访问 http://localhost:5173
```

