import { MainLayout } from './components/layout/MainLayout';
import { AddTodo } from './components/todo/AddTodo';
import { TodoFilter } from './components/todo/TodoFilter';
import { TodoList } from './components/todo/TodoList';

/**
 * 主应用组件
 * 整合所有子组件到 MainLayout 中
 */
function App(): JSX.Element {
  return (
    <MainLayout>
      {/* 页面标题区 */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">我的任务</h1>
        <p className="text-sm text-slate-500 mt-1">
          管理您的待办事项，提高工作效率
        </p>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 添加任务表单 */}
          <section>
            <AddTodo />
          </section>

          {/* 筛选器 */}
          <section>
            <TodoFilter />
          </section>

          {/* 任务列表 */}
          <section>
            <TodoList />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
