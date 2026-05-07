import { useMemo } from 'react';
import { useTodoStore } from '../../store/useTodoStore';
import { CheckCircle2, Circle, ListTodo, AlertCircle, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import type { Priority } from '../../types';

/**
 * 侧边栏组件
 * 显示统计信息和任务概览
 */
export const Sidebar = (): JSX.Element => {
  const todos = useTodoStore((state) => state.todos);

  // 计算统计数据
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const uncompleted = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const highPriority = todos.filter((t) => t.priority === 'high').length;
    const mediumPriority = todos.filter((t) => t.priority === 'medium').length;
    const lowPriority = todos.filter((t) => t.priority === 'low').length;

    return {
      total,
      completed,
      uncompleted,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
    };
  }, [todos]);

  // 优先级配置
  const priorityConfig: Record<Priority, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    high: {
      label: '高优先级',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    medium: {
      label: '中优先级',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    low: {
      label: '低优先级',
      icon: <ArrowUpCircle className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  };

  return (
    <aside className="w-72 bg-white h-full border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Todo App</h1>
            <p className="text-xs text-slate-500">任务管理系统</p>
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 总体统计 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
            任务概览
          </h2>
          <div className="space-y-2">
            <StatCard
              icon={<ListTodo className="w-4 h-4" />}
              label="总任务数"
              value={stats.total}
              color="bg-slate-100 text-slate-600"
            />
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="已完成"
              value={stats.completed}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={<Circle className="w-4 h-4" />}
              label="待完成"
              value={stats.uncompleted}
              color="bg-amber-100 text-amber-600"
            />
          </div>
        </section>

        {/* 完成率 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
            完成率
          </h2>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">整体进度</span>
              <span className="text-2xl font-bold text-slate-900">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </section>

        {/* 优先级分布 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
            优先级分布
          </h2>
          <div className="space-y-2">
            <PriorityRow
              config={priorityConfig.high}
              count={stats.highPriority}
              total={stats.total}
            />
            <PriorityRow
              config={priorityConfig.medium}
              count={stats.mediumPriority}
              total={stats.total}
            />
            <PriorityRow
              config={priorityConfig.low}
              count={stats.lowPriority}
              total={stats.total}
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Advanced Todo App v1.0
        </p>
      </div>
    </aside>
  );
};

/**
 * 统计卡片组件
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps): JSX.Element => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="text-lg font-semibold text-slate-900">{value}</span>
  </div>
);

/**
 * 优先级行组件
 */
interface PriorityRowProps {
  config: {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  };
  count: number;
  total: number;
}

const PriorityRow = ({ config, count, total }: PriorityRowProps): JSX.Element => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.bgColor} ${config.color}`}>
          {config.icon}
        </div>
        <span className="text-sm text-slate-600">{config.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-900">{count}</span>
        <span className="text-xs text-slate-400">({percentage}%)</span>
      </div>
    </div>
  );
};
