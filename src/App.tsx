import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Availability from './components/Availability';
import About from './components/About';
import Projects from './components/Projects';
import LatestPosts from './components/LatestPosts';
import Contact from './components/Contact';
import PortfolioLayout from './layouts/PortfolioLayout';
import BlogLayout from './layouts/BlogLayout';

const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

const HomePage = () => (
  <>
    <Hero />
    <Availability />
    <About />
    <Projects />
    <LatestPosts />
    <Contact />
  </>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<p className="editorial-section pt-32 font-mono text-sm text-muted">Loading page...</p>}>
        <Routes>
          <Route element={<PortfolioLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<main className="pt-24"><Projects /></main>} />
          </Route>
          <Route path="blog" element={<BlogLayout />}>
            <Route index element={<BlogPage />} />
            <Route path=":slug" element={<BlogPostPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
