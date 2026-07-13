'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Diário', href: '/diary', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-50 md:hidden pb-safe">
      <ul className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="w-full">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 py-1"
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-mint/20 text-teal dark:bg-mint/10 dark:text-mint scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-teal/70'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-sans transition-colors ${isActive ? 'text-teal dark:text-mint font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
