import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicRoute from '@/routes/PublicRoute'; // IMPORT PUBLIC ROUTE
import BrandWordmark from '@/components/common/BrandWordmark';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard')); // NEW DASHBOARD ROUTE
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const BrandPage = lazy(() => import('@/pages/BrandPage'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Profile = lazy(() => import('@/pages/Profile'));
const BlogList = lazy(() => import('@/pages/BlogList'));
const BlogDetail = lazy(() => import('@/pages/BlogDetail'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AboutUs = lazy(() => import('@/pages/AboutUs'));
const ReturnPolicy = lazy(() => import('@/pages/ReturnPolicy'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/pages/TermsConditions'));
const Faq = lazy(() => import('@/pages/Faq'));
const ContactUs = lazy(() => import('@/pages/ContactUs'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas" role="status">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <BrandWordmark priority className="h-16" />
        <span className="relative h-px w-28 overflow-hidden bg-line" aria-hidden="true">
          <span className="animate-loader absolute inset-y-0 left-0 w-1/3 bg-ink" />
        </span>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main Layout containing Public and Auth routes that share Navbar */}
        <Route element={<MainLayout />}>
          {/* Public ONLY pages (anyone can view, but home might feel different if logged in, handled inside Home component) */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/brand/:slug" element={<BrandPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<ContactUs />} />
          
          {/* User must be logged in for these */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} /> {/* Make Cart protected */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        {/* Auth Layout for login/register (only accessible if NOT logged in) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
