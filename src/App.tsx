import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import HomePage from '@/pages/HomePage';
import PublishPage from '@/pages/PublishPage';
import OrdersPage from '@/pages/OrdersPage';
import WalletPage from '@/pages/WalletPage';
import ReviewsPage from '@/pages/ReviewsPage';
import MySpotsPage from '@/pages/MySpotsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container py-6 md:py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/my-spots" element={<MySpotsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
