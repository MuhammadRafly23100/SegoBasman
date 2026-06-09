'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ChefHat, ShoppingCart, List, UtensilsCrossed, Monitor, LogOut, UserCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // Sidebar collapse — hanya berlaku di tablet; di desktop selalu terbuka (override lg:)
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('sidebar_collapsed') === 'true') setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'KASIR') {
      router.push('/admin/menu');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) return null;
  if (!isAuthenticated()) return null;
  if (user?.role !== 'KASIR') return null;

  const navItems = [
    { href: '/kasir/transaksi', label: 'Transaksi', icon: ShoppingCart },
    { href: '/kasir/antrian', label: 'Antrian', icon: List },
    { href: '/kasir/menu', label: 'Ketersediaan Menu', icon: UtensilsCrossed },
    { href: '/display', label: 'Display Live', icon: Monitor },
  ];

  return (
    <div className="h-screen bg-[#f8f9fa] flex overflow-hidden font-sans">
      {/* Sidebar Modern Elegan - Tema Merah Kasir */}
      <aside className={`${collapsed ? 'w-16 lg:w-64' : 'w-64'} bg-gradient-to-b from-[#b91c1c] to-[#991b1b] border-r border-[#7f1d1d] flex flex-col shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.1)] transition-[width] duration-[250ms] ease-in-out`}>

        {/* Header / Brand Logo */}
        <div className={`${collapsed ? 'px-2 lg:px-6 justify-center lg:justify-start' : 'px-6'} py-6 border-b border-[#991b1b] flex items-center gap-3`}>
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0">
            <img
              src="/basman.png"
              alt="Logo"
              className="h-6 w-auto object-contain pointer-events-none select-none"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <div className={`flex-col ${collapsed ? 'hidden lg:flex' : 'flex'}`}>
            <span className="font-extrabold text-white leading-tight text-lg tracking-tight drop-shadow-sm">Sego Pedes</span>
            <span className="font-bold text-red-200 leading-tight text-sm drop-shadow-sm">Basman</span>
          </div>
        </div>

        {/* Tombol collapse/expand - tablet saja (desktop selalu terbuka) */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Perbesar menu' : 'Perkecil menu'}
          aria-label={collapsed ? 'Perbesar menu' : 'Perkecil menu'}
          className="lg:hidden flex items-center justify-center mx-2 mt-3 -mb-1 p-2 rounded-lg text-red-100 hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-2 lg:px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <p className={`px-3 text-[11px] font-bold uppercase tracking-wider text-red-300/80 mb-3 ${collapsed ? 'hidden lg:block' : 'block'}`}>Menu Kasir</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`group flex items-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  collapsed ? 'px-0 justify-center lg:justify-start lg:px-3' : 'px-3'
                } ${
                  isActive
                    ? 'text-white bg-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-white/10'
                    : 'text-red-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-red-200 group-hover:text-white'}`} />
                <span className={collapsed ? 'hidden lg:inline' : 'inline'}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-2 lg:p-4 border-t border-[#991b1b] bg-black/10">
          <div className={`flex items-center gap-3 mb-4 ${collapsed ? 'px-0 justify-center lg:justify-start lg:px-2' : 'px-2'}`}>
            <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div className={`flex-col min-w-0 ${collapsed ? 'hidden lg:flex' : 'flex'}`}>
              <p className="font-bold text-sm text-white truncate drop-shadow-sm">{user?.nama}</p>
              <div className="flex items-center mt-0.5">
                <span className="px-2 py-[2px] rounded-md bg-[#dc2626] text-white text-[10px] font-bold tracking-wide uppercase border border-red-400/30 shadow-sm">Kasir</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar Akun"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-50 bg-white/10 hover:bg-white/20 border border-white/10 w-full transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={collapsed ? 'hidden lg:inline' : 'inline'}>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#f8f9fa] flex flex-col">
        {children}
      </main>
    </div>
  );
}
