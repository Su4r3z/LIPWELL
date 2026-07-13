import { EveningCheckin } from '@/components/diary/EveningCheckin';

export default function EveningCheckinPage() {
  return (
    <div className="max-w-3xl mx-auto px-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-salmon font-sans tracking-tight">Boa noite! 🌙</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Como foi o comportamento das incertezas do Lipedema no final deste dia?</p>
      </div>
      
      <EveningCheckin />
    </div>
  );
}
