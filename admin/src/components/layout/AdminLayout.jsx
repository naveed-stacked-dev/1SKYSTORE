import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '@/context/SidebarContext';

export default function AdminLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div
        className="transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
