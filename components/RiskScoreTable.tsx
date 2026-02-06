
import React from 'react';
import { RiskMetric } from '../types';
import { AlertTriangle, Info, Target as TargetIcon } from 'lucide-react';

interface RiskScoreTableProps {
  metrics: RiskMetric[];
  compositeScore: number;
  onWeightChange: (metricName: string, newWeight: number) => void;
  onTargetChange: (metricName: string, newTarget: number) => void;
}

export const RiskScoreTable: React.FC<RiskScoreTableProps> = ({ metrics, compositeScore, onWeightChange, onTargetChange }) => {
  const formatValue = (metric: RiskMetric, val: number) => {
    if (metric.isCurrency) return `€${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (metric.isPercentage) return `${(val * 100).toFixed(2)}%`;
    return val.toFixed(2);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Operator Risk Thresholds</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info size={14} />
          <span>Configurable KPI Targets</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100">
              <th className="px-6 py-4">Metric</th>
              <th className="px-6 py-4">Actual Performance</th>
              <th className="px-6 py-4">Threshold Target</th>
              <th className="px-6 py-4">Risk Logic</th>
              <th className="px-4 py-4 text-center">Weight</th>
              <th className="px-6 py-4 text-right">Penalties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {metrics.map((m, idx) => {
              const isOverTarget = m.score > 0;
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{m.name}</td>
                  <td className={`px-6 py-4 text-sm font-mono ${isOverTarget ? 'text-red-600 font-bold' : 'text-emerald-600'}`}>
                    {formatValue(m, m.actual)}
                  </td>
                  <td className="px-6 py-4">
                     <div className="relative flex items-center group/input">
                        <TargetIcon size={12} className="absolute left-2 text-gray-300 pointer-events-none group-hover/input:text-blue-400 transition-colors" />
                        <input
                          type="number"
                          value={m.target}
                          onChange={(e) => onTargetChange(m.name, parseFloat(e.target.value) || 0)}
                          className="w-24 pl-6 pr-2 py-1 text-sm font-mono bg-gray-50 border border-transparent rounded-md focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          step={m.isPercentage ? "0.01" : "1"}
                        />
                     </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-blue-500 bg-blue-50/20 uppercase tracking-tighter">
                    {m.formula}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      value={m.weight}
                      onChange={(e) => onWeightChange(m.name, parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 text-center text-sm font-bold bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      min="0"
                      step="0.5"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs ${
                      m.score > 3 ? 'bg-red-500 text-white shadow-sm shadow-red-200' : 
                      m.score > 0 ? 'bg-amber-400 text-white shadow-sm shadow-amber-200' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {m.score > 0 ? `+${m.score}` : 'OK'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800 text-white">
              <td colSpan={5} className="px-6 py-6 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                Composite Campaign Risk Index
              </td>
              <td className="px-6 py-6 text-right">
                <span className={`text-2xl font-black px-4 py-1 rounded-xl shadow-inner ${
                  compositeScore > 15 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {compositeScore.toFixed(1)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
