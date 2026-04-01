import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  BarChart3,
  Settings,
  Image,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { label: 'Blogs', path: '/admin/blogs', icon: FileText },
  { label: 'Media', path: '/admin/media', icon: Image },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
