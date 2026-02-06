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
    <div className="flex flex-col space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {tooltip && (
          <span className="text-xs text-gray-400 cursor-help" title={tooltip}>?</span>
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
            w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm
            ${type === 'range' ? 'cursor-pointer accent-blue-500' : ''}
          `}
        />
        {suffix && type !== 'range' && (
          <span className="absolute right-3 top-2 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {type === 'range' && (
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>{min}</span>
          <span className="text-gray-700 font-medium">{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};