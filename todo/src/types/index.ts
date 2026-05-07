/**
 * 优先级枚举
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * 分类类型
 */
export type Category = 'work' | 'study' | 'life' | 'other';

/**
 * 任务状态
 */
export type TodoStatus = 'all' | 'completed' | 'uncompleted';

/**
 * 筛选条件接口
 */
export interface Filter {
  category: Category | 'all';
  priority: Priority | 'all';
  status: TodoStatus;
}

/**
 * Todo 任务接口
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

/**
 * 创建 Todo 的 DTO（不包含自动生成的字段）
 */
export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'completed'>;

/**
 * 更新 Todo 的 DTO（所有字段可选）
 */
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt'>>;
