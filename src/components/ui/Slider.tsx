import { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  labelLeft?: string;
  labelRight?: string;
}

export function Slider({ value, min = 0, max = 10, onChange, labelLeft, labelRight, ...props }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full relative">
      {/* Camada que rastreia a evolução da barra (Preenchida com as Cores de Destruição/Saúde) */}
      <div 
        className="absolute top-[3px] left-0 h-3 bg-teal dark:bg-mint rounded-l-lg pointer-events-none z-0 transition-all duration-150"
        style={{ width: `${percentage}%` }}
      />
      {/* Input Transparente por Cima controlando a thumb nativa do Browser */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer relative z-10 transition-all"
        style={{
          // Deixa o "fundo preenchido nativo" transparente para vermos a barrinha animada embaixo
          backgroundColor: 'transparent',
          backgroundImage: `linear-gradient(to right, transparent ${percentage}%, transparent ${percentage}%)`
        }}
        {...props}
      />
      
      {/* Trazendo CSS Injected pra matar o Webkit background mantendo apenas a bolinha visivel */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #7FDBDA;
          cursor: pointer;
          margin-top: -5px; 
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
          border: 3px solid white;
          transition: transform 0.1s;
        }
        .dark input[type=range]::-webkit-slider-thumb {
          background: #A8E6CF;
          border-color: #1a1a2e;
        }
        input[type=range]::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 12px;
          cursor: pointer;
          background: transparent;
          border-radius: 6px;
        }
      `}} />

      {(labelLeft || labelRight) && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium uppercase tracking-wider">
          <span>{labelLeft}</span>
          <span>{labelRight}</span>
        </div>
      )}
      <div className="text-center mt-3 text-3xl font-bold text-teal dark:text-mint transition-colors">
        {value}
      </div>
    </div>
  );
}
