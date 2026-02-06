
import React from 'react';
import { RiskMetric } from '../types';
import { AlertTriangle, Info, Target as TargetIcon, Zap, ChevronRight } from 'lucide-react';

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
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group/table">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Campaign KPI Risk Matrix</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Audit compliance and cost efficiency monitoring</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
           <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
             <Zap size={14} className="text-blue-500" />
             <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Dynamic Weighing active</span>
           </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border-b border-slate-50">
              <th className="px-8 py-6">Key Performance Indicator</th>
              <th className="px-8 py-6">Actual Load</th>
              <th className="px-8 py-6">Threshold Target</th>
              <th className="px-8 py-6">Logic Model</th>
              <th className="px-4 py-6 text-center">Weight</th>
              <th className="px-8 py-6 text-right">Risk Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {metrics.map((m, idx) => {
              const isOverTarget = m.score > 0;
              return (
                <tr key={idx} className="hover:bg-slate-50/80 transition-all group/row duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-6 rounded-full transition-all duration-500 ${isOverTarget ? 'bg-red-500' : 'bg-emerald-400'}`} />
                      <span className="text-sm font-black text-slate-700 tracking-tight group-hover/row:text-blue-600 transition-colors">{m.name}</span>
                    </div>
                  </td>
                  <td className={`px-8 py-6 text-sm font-mono tracking-tighter ${isOverTarget ? 'text-red-600 font-black' : 'text-emerald-600 font-bold'}`}>
                    <div className="flex items-center gap-2">
                       {formatValue(m, m.actual)}
                       {isOverTarget && <ChevronRight size={14} className="animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="relative flex items-center group/input">
                        <TargetIcon size={14} className="absolute left-3 text-slate-300 pointer-events-none group-hover/input:text-blue-500 transition-colors" />
                        <input
                          type="number"
                          value={m.target}
                          onChange={(e) => onTargetChange(m.name, parseFloat(e.target.value) || 0)}
                          className="w-32 pl-9 pr-3 py-2 text-sm font-black bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          step={m.isPercentage ? "0.01" : "1"}
                        />
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-lg uppercase tracking-widest border border-blue-100">
                      {m.formula}
                    </span>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <input
                      type="number"
                      value={m.weight}
                      onChange={(e) => onWeightChange(m.name, parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 text-center text-sm font-black bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
                      min="0"
                      step="0.1"
                    />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all shadow-sm ${
                      m.score > 3 ? 'bg-red-600 text-white shadow-red-200 hover:scale-105' : 
                      m.score > 0 ? 'bg-amber-400 text-white shadow-amber-200 hover:scale-105' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {m.score > 0 ? (
                        <>
                          <Zap size={10} fill="currentColor" />
                          <span>+{ (m.score * m.weight).toFixed(1) } Penalty</span>
                        </>
                      ) : (
                        <span>Optimal</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td colSpan={5} className="px-8 py-8 text-sm font-black uppercase tracking-[0.4em] text-slate-500">
                Aggregated Composite Risk Index (ACRI)
              </td>
              <td className="px-8 py-8 text-right">
                <div className="inline-flex flex-col items-end">
                  <span className={`text-4xl font-black tracking-tighter tabular-nums drop-shadow-lg ${
                    compositeScore > 15 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {compositeScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Score</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
