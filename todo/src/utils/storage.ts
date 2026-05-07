import type { Todo } from '../types';

const STORAGE_KEY = 'advanced-todo-app-data';

/**
 * 从 LocalStorage 获取 Todo 列表
 * 如果没有数据或解析失败，返回空数组
 */
export const getTodos = (): Todo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data) as Todo[];
    // 基本的数据验证
    if (!Array.isArray(parsed)) {
      console.warn('Storage data is not an array, returning empty array');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse todos from localStorage:', error);
    return [];
  }
};

/**
 * 将 Todo 列表保存到 LocalStorage
 */
export const setTodos = (todos: Todo[]): void => {
  try {
    const data = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
  }
};
