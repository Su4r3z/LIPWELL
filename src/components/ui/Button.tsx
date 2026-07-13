import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-btn active:scale-95";
  
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-light shadow-card hover:shadow-card-hover",
    secondary: "bg-mint text-teal hover:bg-[#9ee0c6]",
    danger: "bg-salmon text-dark hover:bg-[#ff9a9e]",
    ghost: "bg-transparent text-teal hover:bg-teal/10 dark:hover:bg-white/10 dark:text-white",
    outline: "border-2 border-teal text-teal hover:bg-teal hover:text-white"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg w-full"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      {children}
    </button>
  );
}
