import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function Chip({ selected = false, children, className = '', ...props }: ChipProps) {
  const baseStyle = "inline-flex items-center justify-center rounded-chip px-4 py-2 text-sm font-medium min-h-[36px] transition-all duration-300 border active:scale-95";
  const unselectedStyle = "bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-dark-card";
  const selectedStyle = "bg-mint/20 text-teal dark:text-mint border-teal dark:border-mint shadow-card";

  return (
    <button 
      type="button"
      className={`${baseStyle} ${selected ? selectedStyle : unselectedStyle} ${className}`}
      {...props}
    >
      {selected && <Check className="mr-1.5 h-4 w-4" />}
      {children}
    </button>
  );
}
