import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';

const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ProductList = lazy(() => import('@/pages/products/ProductList'));
const OrderList = lazy(() => import('@/pages/orders/OrderList'));
const OrderDetail = lazy(() => import('@/pages/orders/OrderDetail'));
const Customers = lazy(() => import('@/pages/Customers'));
const Coupons = lazy(() => import('@/pages/Coupons'));
const BlogList = lazy(() => import('@/pages/blogs/BlogList'));
const BlogDetail = lazy(() => import('@/pages/blogs/BlogDetail'));
const MediaGallery = lazy(() => import('@/pages/MediaGallery'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="blogs" element={<BlogList />} />
          <Route path="blogs/:id" element={<BlogDetail />} />
          <Route path="media" element={<MediaGallery />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  );
}
