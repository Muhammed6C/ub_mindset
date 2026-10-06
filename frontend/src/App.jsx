import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useCart } from './context/CartContext';

const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'));
const Lookbook = lazy(() => import('./pages/Lookbook'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Catalog = lazy(() => import('./pages/Catalog'));
const TryOn = lazy(() => import('./pages/TryOn'));
const Cart = lazy(() => import('./pages/Cart'));
const StudioFallback = () => <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#f2ede4', color: '#171717' }}><p className="ub-label">PRÉPARATION DU STUDIO…</p></main>;
const StorefrontFallback = () => <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#F2F1EF', color: '#171717' }}><p className="ub-label">CHARGEMENT DE LA PAGE…</p></main>;

// Admin
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminRoute from './admin/AdminRoute';
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories'));
const AdminStock = lazy(() => import('./admin/pages/AdminStock'));
const AdminCustomers = lazy(() => import('./admin/pages/AdminCustomers'));
const AdminPromotions = lazy(() => import('./admin/pages/AdminPromotions'));
const AdminShipping = lazy(() => import('./admin/pages/AdminShipping'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));

const AdminFallback = () => (
  <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F5F6F8', color: '#111827' }}>
    <p className="ub-label">CHARGEMENT DE L’ADMINISTRATION…</p>
  </main>
);

const ComingSoon = ({ label }) => (
  <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <p className="ub-label" style={{ color: '#3A3A3A', letterSpacing: '0.4em', fontSize: '0.65rem' }}>
      {label} — À VENIR
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* ── Admin ── */}
          <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </Suspense>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ── Storefront ── */}
          <Route path="/*" element={<Storefront />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

function Storefront() {
  const { cartCount } = useCart();
  const location = useLocation();
  const isTryOn = location.pathname === '/essayage';

  return (
    <>
      {!isTryOn && <Navbar cartCount={cartCount} />}
      <Suspense fallback={<StorefrontFallback />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/blog"      element={<Blog />} />
          <Route path="/catalog"   element={<Catalog />} />
          <Route path="/lookbook"  element={<Lookbook />} />
          <Route path="/notre-histoire" element={<OurStory />} />
          <Route path="/about"     element={<OurStory />} />
          <Route path="/cart"      element={<Suspense fallback={<StudioFallback />}><Cart /></Suspense>} />
          <Route path="/checkout"  element={<ComingSoon label="COMMANDE" />} />
          <Route path="/essayage"  element={<Suspense fallback={<StudioFallback />}><TryOn /></Suspense>} />
        </Routes>
      </Suspense>
      {!isTryOn && <Footer />}
    </>
  );
}
