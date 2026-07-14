import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PortfolioLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
