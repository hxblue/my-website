# 技术设计文档 (TECH_DESIGN)

## 1. 技术选型
* **核心框架:** React 18+ (使用 Functional Components 和 Hooks)
* **开发语言:** TypeScript (要求严格的类型检查)
* **构建工具:** Vite
* **状态管理:** Zustand (轻量级，替代 Redux，负责管理跨组件的 Todos 状态、筛选条件和搜索词)
* **样式方案:** Tailwind CSS (实用优先的 CSS 框架，快速构建响应式 UI)
* **日期处理:** `date-fns` (轻量级时间格式化与计算)
* **图标库:** `lucide-react` (推荐，符合现代极简设计风格)

## 2. 状态管理设计 (Zustand Store)
需要创建一个全局 Store，包含以下状态和动作：
* **State:** `todos` (任务列表), `searchQuery` (搜索词), `filter` (当前的筛选条件对象)。
* **Actions:** `addTodo`, `deleteTodo`, `updateTodo`, `toggleTodoStatus`, `setSearchQuery`, `setFilters`。
* **Derived State (派生状态):** Store 内需提供一个计算属性或选择器 `filteredTodos`，用于返回经过搜索和多条件筛选后的任务列表。

## 3. 目录结构规划
```text
src/
├── assets/          # 静态资源
├── components/      # UI 组件
│   ├── layout/      # 布局组件 (Sidebar, Header, MainContainer)
│   ├── todo/        # 业务组件 (TodoItem, TodoList, AddTodoForm)
│   ├── common/      # 通用组件 (Button, Input, Select, Badge)
├── store/           # 状态管理
│   └── useTodoStore.ts # Zustand store 定义
├── types/           # TypeScript 类型定义
│   └── index.ts     # 全局类型 (Todo 接口等)
├── utils/           # 工具函数
│   └── storage.ts   # LocalStorage 封装
├── App.tsx          # 根组件
└── main.tsx         # 入口文件