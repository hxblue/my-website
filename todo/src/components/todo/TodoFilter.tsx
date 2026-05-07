import { useTodoStore } from '../../store/useTodoStore';
import type { Priority, Category, TodoStatus } from '../../types';
import { Search, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * 筛选器组件
 * 包含搜索框和多条件筛选下拉菜单
 */
export const TodoFilter = (): JSX.Element => {
  const { searchQuery, filter, setSearchQuery, setFilters } = useTodoStore(
    (state) => ({
      searchQuery: state.searchQuery,
      filter: state.filter,
      setSearchQuery: state.setSearchQuery,
      setFilters: state.setFilters,
    })
  );

  // 分类选项
  const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: '全部分类' },
    { value: 'work', label: '工作' },
    { value: 'study', label: '学习' },
    { value: 'life', label: '生活' },
    { value: 'other', label: '其他' },
  ];

  // 优先级选项
  const priorities: { value: Priority | 'all'; label: string }[] = [
    { value: 'all', label: '全部优先级' },
    { value: 'high', label: '高优先级' },
    { value: 'medium', label: '中优先级' },
    { value: 'low', label: '低优先级' },
  ];

  // 状态选项
  const statuses: { value: TodoStatus; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'completed', label: '已完成' },
    { value: 'uncompleted', label: '未完成' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务标题或描述..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
          />
        </div>

        {/* 筛选下拉菜单组 */}
        <div className="flex flex-wrap gap-3">
          {/* 分类筛选 */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Tag className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={filter.category}
              onChange={(e) =>
                setFilters({ category: e.target.value as Category | 'all' })
              }
              className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-sm transition-all duration-200 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 优先级筛选 */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={filter.priority}
              onChange={(e) =>
                setFilters({ priority: e.target.value as Priority | 'all' })
              }
              className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-sm transition-all duration-200 appearance-none cursor-pointer"
            >
              {priorities.map((pri) => (
                <option key={pri.value} value={pri.value}>
                  {pri.label}
                </option>
              ))}
            </select>
          </div>

          {/* 状态筛选 */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={filter.status}
              onChange={(e) =>
                setFilters({ status: e.target.value as TodoStatus })
              }
              className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-sm transition-all duration-200 appearance-none cursor-pointer"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* 清除筛选按钮 */}
          {(searchQuery ||
            filter.category !== 'all' ||
            filter.priority !== 'all' ||
            filter.status !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ category: 'all', priority: 'all', status: 'all' });
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
