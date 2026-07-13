'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, isSameMonth, isToday, isFuture, startOfWeek, endOfWeek 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export function DiaryCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<{log_date: string; log_type: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Constantes de data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // O calendário sempre começa no domingo inicial da semana 1 e termina no sábado da última semana
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  useEffect(() => {
    async function fetchMonthEntries() {
      setIsLoading(true);
      const startDateIso = format(calendarStart, 'yyyy-MM-dd');
      const endDateIso = format(calendarEnd, 'yyyy-MM-dd');

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, log_type')
        .eq('user_id', user.id)
        .gte('log_date', startDateIso)
        .lte('log_date', endDateIso);

      if (!error && data) {
        setEntries(data);
      }
      setIsLoading(false);
    }

    fetchMonthEntries();
  }, [currentDate]); // Refetch when month changes


  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter((e) => e.log_date === dateStr);
    const hasMorning = dayEntries.some((e) => e.log_type === 'morning');
    const hasEvening = dayEntries.some((e) => e.log_type === 'evening');

    if (hasMorning && hasEvening) return 'complete'; // Verde
    if (hasMorning || hasEvening) return 'partial'; // Amarelo
    return 'none'; // Cinza
  };

  const handleFutureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast('Você não pode registrar um diário no futuro.', {
      position: 'bottom-center'
    });
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
        <button 
          onClick={prevMonth}
          className="p-2 text-gray-500 hover:text-teal dark:text-gray-400 dark:hover:text-mint transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-dark dark:text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          {isLoading && <Loader2 className="w-4 h-4 text-teal animate-spin" />}
        </div>
        
        <button 
          onClick={nextMonth}
          className="p-2 text-gray-500 hover:text-teal dark:text-gray-400 dark:hover:text-mint transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Grid Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-dark-border">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Dias do Mês */}
      <div className="grid grid-cols-7 relative">
        {calendarDays.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const isFutureDay = isFuture(day);
          const status = getDayStatus(day);
          const dateStr = format(day, 'yyyy-MM-dd');

          // Cores dos indicadores
          const dotColor = {
            complete: 'bg-teal dark:bg-mint',
            partial: 'bg-yellow-400',
            none: 'bg-gray-200 dark:bg-gray-700'
          }[status];

          return (
            <Link 
              key={day.toString()}
              href={`/diary/${dateStr}`}
              onClick={isFutureDay ? handleFutureClick : undefined}
              className={`
                min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-50 dark:border-[#323246] p-2 relative flex flex-col hover:bg-gray-50 dark:hover:bg-[#2e2e42] transition-colors
                ${!isCurrentMonth ? 'opacity-40' : ''}
              `}
            >
              {/* Número do Dia */}
              <span className={`
                text-sm sm:text-base font-medium self-end w-8 h-8 flex items-center justify-center rounded-full
                ${isDayToday ? 'ring-2 ring-teal dark:ring-mint text-teal dark:text-mint' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {format(day, 'd')}
              </span>

              {/* Bolinhas Indicadoras */}
              <div className="mt-auto flex justify-center pb-1">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${dotColor} transition-colors shadow-sm`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legenda Acessível */}
      <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#1a1a2e] border-t border-gray-100 dark:border-dark-border">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Legenda das cores:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg shadow-sm">
            <div className="w-4 h-4 rounded-full bg-teal dark:bg-mint flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completo (Manhã e Noite)</span>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg shadow-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Incompleto (Falta um check-in)</span>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg shadow-sm">
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sem registros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
