'use client';

import { DiaryCalendar } from '@/components/diary/DiaryCalendar';

export default function DiaryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-teal dark:text-mint font-sans tracking-tight">Meu Diário</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Acompanhe seu histórico de bem-estar contínuo.
          </p>
        </div>
      </div>

      <DiaryCalendar />
    </div>
  );
}
