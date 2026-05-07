import { useMemo } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import { TodoItem } from './TodoItem';
import { ClipboardList, SearchX } from 'lucide-react';

/**
 * Todo 列表组件
 * 获取派生后的过滤列表并循环渲染 TodoItem
 */
export const TodoList = (): JSX.Element => {
  const { todos, getFilteredTodos, searchQuery, filter } = useTodoStore(
    (state) => ({
      todos: state.todos,
      getFilteredTodos: state.getFilteredTodos,
      searchQuery: state.searchQuery,
      filter: state.filter,
    })
  );

  // 获取筛选后的列表
  const filteredTodos = useMemo(() => getFilteredTodos(), [getFilteredTodos]);

  // 判断是否启用了筛选
  const hasActiveFilters =
    searchQuery ||
    filter.category !== 'all' ||
    filter.priority !== 'all' ||
    filter.status !== 'all';

  // Empty State：无任务
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          暂无任务
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          您还没有创建任何任务。使用上方的表单添加一个新任务吧！
        </p>
      </div>
    );
  }

  // Empty State：筛选后无结果
  if (filteredTodos.length === 0 && hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <SearchX className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          没有找到匹配的任务
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          尝试调整筛选条件或搜索关键词，查看其他任务。
        </p>
      </div>
    );
  }

  // 渲染任务列表
  return (
    <div className="space-y-3">
      {/* 结果计数 */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          共 <span className="font-medium text-slate-900">{filteredTodos.length}</span> 个任务
          {hasActiveFilters && (
            <span className="text-slate-400">（筛选后）</span>
          )}
        </p>
      </div>

      {/* 任务项列表 */}
      <div className="space-y-3">
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};
