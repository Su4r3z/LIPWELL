import { MorningCheckin } from '@/components/diary/MorningCheckin';

export default function MorningCheckinPage() {
  return (
    <div className="max-w-3xl mx-auto px-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-teal dark:text-mint font-sans tracking-tight">Bom dia! ☀️</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Vamos fazer a leitura do seu corpo para guiar seu Lipedema hoje.</p>
      </div>
      
      <MorningCheckin />
    </div>
  );
}
