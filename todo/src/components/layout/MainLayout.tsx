import { Sidebar } from './Sidebar';

/**
 * MainLayout 组件属性
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件
 * 左右分栏布局：左侧 Sidebar，右侧主内容区
 */
export const MainLayout = ({ children }: MainLayoutProps): JSX.Element => {
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* 左侧 Sidebar */}
      <Sidebar />

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};
