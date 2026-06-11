import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Availability from './components/Availability';
import About from './components/About';
import Projects from './components/Projects';
import LatestPosts from './components/LatestPosts';
import Contact from './components/Contact';
import Footer from './components/Footer';

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
      <div className="min-h-screen bg-canvas text-ink">
        <Header />
        <Suspense fallback={<p className="editorial-section pt-32 font-mono text-sm text-muted">Loading page...</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<main className="pt-24"><Projects /></main>} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
