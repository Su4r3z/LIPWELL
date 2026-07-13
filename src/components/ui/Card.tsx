import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
}

export function Card({ children, className = '', glass = false, ...props }: CardProps) {
  const baseStyle = "rounded-card p-5 transition-all duration-300";
  const standardStyle = "bg-white dark:bg-dark-card shadow-card hover:shadow-card-hover";
  // O glassStyle implementa o glassmorphism (Premium Look)
  const glassStyle = "bg-white/70 dark:bg-dark-card/60 backdrop-blur-lg border border-white/20 dark:border-white/5 shadow-header hover:shadow-card-hover";

  return (
    <div 
      className={`${baseStyle} ${glass ? glassStyle : standardStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
