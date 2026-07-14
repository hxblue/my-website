import { Outlet } from 'react-router-dom';
import BlogHeader from '../components/blog/BlogHeader';
import Footer from '../components/Footer';

export default function BlogLayout() {
  return (
    <div className="blog-shell min-h-screen">
      <BlogHeader />
      <Outlet />
      <Footer />
    </div>
  );
}
