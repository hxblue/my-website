import { useState } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import type { CreateTodoInput, Priority, Category } from '../../types';
import { Plus, Calendar, Tag, AlertCircle } from 'lucide-react';

/**
 * 添加任务表单组件
 */
export const AddTodo = (): JSX.Element => {
  const addTodo = useTodoStore((state) => state.addTodo);

  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // 分类选项
  const categories: { value: Category; label: string }[] = [
    { value: 'work', label: '工作' },
    { value: 'study', label: '学习' },
    { value: 'life', label: '生活' },
    { value: 'other', label: '其他' },
  ];

  // 优先级选项
  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'high', label: '高', color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'medium', label: '中', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: 'low', label: '低', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ];

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // 基础验证：标题不能为空
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }

    // 清除错误
    setError('');

    // 创建新任务
    const newTodo: CreateTodoInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null,
    };

    // 添加到 Store
    addTodo(newTodo);

    // 重置表单
    setTitle('');
    setDescription('');
    setCategory('work');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">新建任务</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 标题输入 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            任务标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入任务标题..."
            className={`w-full px-4 py-2 rounded-lg border ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-800'
            } focus:outline-none focus:ring-2 transition-all duration-200`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* 描述输入 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            任务描述
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入任务描述（可选）..."
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
          />
        </div>

        {/* 分类、优先级、截止日期 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 分类选择 */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"
            >
              <Tag className="w-4 h-4" />
              分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 优先级选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              优先级
            </label>
            <div className="flex gap-2">
              {priorities.map((pri) => (
                <button
                  key={pri.value}
                  type="button"
                  onClick={() => setPriority(pri.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    priority === pri.value
                      ? pri.color
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pri.label}
                </button>
              ))}
            </div>
          </div>

          {/* 截止日期 */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              截止日期
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            添加任务
          </button>
        </div>
      </form>
    </div>
  );
};
