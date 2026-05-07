import { create } from 'zustand';
import type { Todo, Filter, CreateTodoInput, UpdateTodoInput } from '../types';
import { getTodos, setTodos } from '../utils/storage';

/**
 * Store 状态接口
 */
interface TodoState {
  // 核心状态
  todos: Todo[];
  searchQuery: string;
  filter: Filter;
}

/**
 * Store Actions 接口
 */
interface TodoActions {
  // CRUD Actions
  addTodo: (input: CreateTodoInput) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, input: UpdateTodoInput) => void;
  toggleComplete: (id: string) => void;

  // 筛选和搜索 Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filter: Partial<Filter>) => void;

  // 派生状态计算
  getFilteredTodos: () => Todo[];
}

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建 Zustand Store
 */
export const useTodoStore = create<TodoState & TodoActions>((set, get) => ({
  // 初始状态
  todos: getTodos(),
  searchQuery: '',
  filter: {
    category: 'all',
    priority: 'all',
    status: 'all',
  },

  // 添加 Todo
  addTodo: (input) => {
    const newTodo: Todo = {
      ...input,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updatedTodos = [...get().todos, newTodo];
    set({ todos: updatedTodos });
    setTodos(updatedTodos);
  },

  // 删除 Todo
  deleteTodo: (id) => {
    const updatedTodos = get().todos.filter((todo) => todo.id !== id);
    set({ todos: updatedTodos });
    setTodos(updatedTodos);
  },

  // 更新 Todo
  updateTodo: (id, input) => {
    const updatedTodos = get().todos.map((todo) =>
      todo.id === id ? { ...todo, ...input } : todo
    );
    set({ todos: updatedTodos });
    setTodos(updatedTodos);
  },

  // 切换完成状态
  toggleComplete: (id) => {
    const updatedTodos = get().todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    set({ todos: updatedTodos });
    setTodos(updatedTodos);
  },

  // 设置搜索词
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // 设置筛选条件
  setFilters: (filterUpdate) => {
    set((state) => ({
      filter: { ...state.filter, ...filterUpdate },
    }));
  },

  // 派生状态：获取经过筛选的 Todo 列表
  getFilteredTodos: () => {
    const { todos, searchQuery, filter } = get();

    return todos.filter((todo) => {
      // 搜索词筛选（标题和描述）
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = todo.title.toLowerCase().includes(query);
        const matchDescription = todo.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDescription) {
          return false;
        }
      }

      // 分类筛选
      if (filter.category !== 'all' && todo.category !== filter.category) {
        return false;
      }

      // 优先级筛选
      if (filter.priority !== 'all' && todo.priority !== filter.priority) {
        return false;
      }

      // 状态筛选
      if (filter.status === 'completed' && !todo.completed) {
        return false;
      }
      if (filter.status === 'uncompleted' && todo.completed) {
        return false;
      }

      return true;
    });
  },
}));
