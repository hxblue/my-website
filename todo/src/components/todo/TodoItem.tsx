import { useTodoStore } from '../../store/useTodoStore';
import type { Todo, Priority, Category } from '../../types';
import {
  Check,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  AlertTriangle,
  ArrowUpCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * TodoItem 组件属性
 */
interface TodoItemProps {
  todo: Todo;
}

/**
 * 单条任务组件
 * 包含复选框（切换状态）、信息展示区和删除按钮
 */
export const TodoItem = ({ todo }: TodoItemProps): JSX.Element => {
  const { toggleComplete, deleteTodo } = useTodoStore((state) => ({
    toggleComplete: state.toggleComplete,
    deleteTodo: state.deleteTodo,
  }));

  // 优先级配置
  const priorityConfig: Record<
    Priority,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
  > = {
    high: {
      label: '高',
      icon: <AlertCircle className="w-3 h-3" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    medium: {
      label: '中',
      icon: <AlertTriangle className="w-3 h-3" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    low: {
      label: '低',
      icon: <ArrowUpCircle className="w-3 h-3" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  };

  // 分类配置
  const categoryConfig: Record<Category, string> = {
    work: '工作',
    study: '学习',
    life: '生活',
    other: '其他',
  };

  // 格式化日期
  const formattedDate = todo.dueDate
    ? format(new Date(todo.dueDate), 'MM月dd日', { locale: zhCN })
    : null;

  // 判断是否已过期
  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
        todo.completed
          ? 'bg-slate-50 border-slate-200 opacity-75'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* 复选框 */}
      <button
        onClick={() => toggleComplete(todo.id)}
        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          todo.completed
            ? 'bg-slate-800 border-slate-800'
            : 'border-slate-300 hover:border-slate-500'
        }`}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {/* 标题 */}
        <h3
          className={`font-medium text-base transition-all duration-200 ${
            todo.completed ? 'text-slate-500 line-through' : 'text-slate-900'
          }`}
        >
          {todo.title}
        </h3>

        {/* 描述 */}
        {todo.description && (
          <p
            className={`mt-1 text-sm truncate ${
              todo.completed ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {todo.description}
          </p>
        )}

        {/* 元信息标签 */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* 优先级标签 */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[todo.priority].bgColor} ${priorityConfig[todo.priority].color}`}
          >
            {priorityConfig[todo.priority].icon}
            {priorityConfig[todo.priority].label}优先级
          </span>

          {/* 分类标签 */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
            <Tag className="w-3 h-3" />
            {categoryConfig[todo.category]}
          </span>

          {/* 截止日期标签 */}
          {formattedDate && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                isOverdue
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formattedDate}
              {isOverdue && ' (已过期)'}
            </span>
          )}
        </div>
      </div>

      {/* 删除按钮 */}
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        title="删除任务"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};
