/**
 * 页脚组件
 * 简单的版权信息展示
 */
const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">
          © {currentYear} Developer. All rights reserved.
        </p>
        <p className="text-gray-600 text-sm">
          Made with{' '}
          <span className="text-purple-400">♥</span>
          {' '}using React & Tailwind CSS
        </p>
      </div>
    </footer>
  )
}

export default Footer
