import { Outlet } from 'react-router';
import Navbar from '@/components/app/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-screen-2xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
