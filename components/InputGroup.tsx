
import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  tooltip?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step,
  suffix,
  tooltip
}) => {
  return (
    <div className="flex flex-col space-y-2 group">
      <div className="flex justify-between items-center px-0.5">
        <label htmlFor={name} className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
          {label}
        </label>
        {tooltip && (
          <span className="text-[10px] text-slate-400 font-bold hover:text-blue-500 cursor-help border border-slate-200 rounded-full w-4 h-4 flex items-center justify-center" title={tooltip}>?</span>
        )}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`
            w-full transition-all duration-300
            ${type === 'range' 
              ? 'h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600' 
              : 'bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-slate-800 font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm group-hover:shadow-md'
            }
          `}
        />
        {suffix && type !== 'range' && (
          <span className="absolute right-4 top-3.5 text-slate-400 text-xs font-black uppercase tracking-tighter pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {type === 'range' && (
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">
          <span>MIN {min}</span>
          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{value}</span>
          <span>MAX {max}</span>
        </div>
      )}
    </div>
  );
};
