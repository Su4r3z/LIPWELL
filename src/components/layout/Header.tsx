import Link from 'next/link';
import Image from 'next/image';
import { Settings, Clock } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  trialDaysLeft?: number;
}

export function Header({ userName, trialDaysLeft }: HeaderProps) {
  const firstName = userName?.split(' ')[0] ?? null;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md shadow-header z-40 md:left-64 flex items-center justify-between px-4 transition-all duration-300">
      {/* Logo mobile (esconde no desktop, onde a Sidebar tem o logo) */}
      <div className="flex items-center gap-2 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/icon-192.png" alt="LipWell" width={28} height={28} className="rounded-lg" />
          <span className="text-xl font-bold font-sans text-teal dark:text-mint tracking-tight">LipWell</span>
        </Link>
      </div>

      
      {/* Nome da usuária - visível em todos os tamanhos */}
      {firstName && (
        <div className="flex items-center gap-2 flex-1 md:flex-none ml-3 md:ml-0 md:flex-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Olá, <span className="font-semibold text-teal dark:text-mint">{firstName}</span>
          </span>
        </div>
      )}
      {!firstName && <div className="flex-1" />}


      <div className="flex items-center gap-3">
        {/* Badge do Trial (visível quando estiver nos últimos 3 dias) */}
        {trialDaysLeft !== undefined && trialDaysLeft <= 3 && trialDaysLeft >= 0 && (
          <div className="flex items-center gap-1.5 bg-salmon/10 dark:bg-salmon/20 text-salmon px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            <Clock className="w-3 h-3" />
            {trialDaysLeft === 0
              ? 'Último dia!'
              : `${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'} restantes`
            }
          </div>
        )}

        <Link href="/settings" className="p-2 -mr-2 text-gray-500 hover:text-teal dark:text-gray-400 dark:hover:text-mint transition-colors">
          <Settings className="h-6 w-6" />
        </Link>
      </div>
    </header>
  );
}
