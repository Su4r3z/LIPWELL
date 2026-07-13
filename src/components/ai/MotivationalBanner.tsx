'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export function MotivationalBanner() {
  const [quote, setQuote] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ai/quote');
        if (res.ok) {
          const data = await res.json();
          setQuote(data.quote);
        }
      } catch {
        setQuote('Seu corpo merece cuidado e amor todos os dias.');
      }
    })();
  }, []);

  if (!quote || !isVisible) return null;

  return (
    <div className="relative overflow-hidden mb-6 rounded-2xl bg-gradient-to-r from-orange-400 via-salmon to-pink-400 p-px shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white/95 dark:bg-dark-card/95 backdrop-blur-md rounded-2xl p-5 flex items-start sm:items-center gap-4 relative">
        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-salmon/20 to-orange-400/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 pr-6">
          <p className="text-xs text-orange-400 font-semibold mb-0.5 uppercase tracking-wider">Coach LipWell do dia</p>
          <p className="text-gray-800 dark:text-gray-100 font-semibold italic text-sm sm:text-base leading-relaxed">
            "{quote}"
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-salmon rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
