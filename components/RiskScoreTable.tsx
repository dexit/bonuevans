
import React, { useState } from 'react';
import { RiskMetric, MetricConfig, MetricBaseFormula } from '../types';
import { 
  AlertTriangle, Info, Target as TargetIcon, Zap, ChevronRight, 
  Trash2, Plus, GripVertical, ChevronUp, ChevronDown, Edit3, Save 
} from 'lucide-react';

interface RiskScoreTableProps {
  metrics: RiskMetric[];
  compositeScore: number;
  onMetricsChange: (updatedMetrics: MetricConfig[]) => void;
}

const FORMULA_OPTIONS: { label: string; value: MetricBaseFormula; desc: string }[] = [
  { label: 'Hold %', value: 'HOLD_PERCENT', desc: '(D + B - End) / Wagered' },
  { label: 'Bonus Cost', value: 'BONUS_COST', desc: 'Bonus / Wagered' },
  { label: 'Cannibalization', value: 'CANNIBALIZATION', desc: 'Bonus / Deposit' },
  { label: 'Net Contribution', value: 'NET_CONTRIBUTION', desc: 'NGR - Cost' },
  { label: 'Churn Rate', value: 'CHURN_PROB', desc: 'P(Bust)' },
  { label: 'Offer ROI', value: 'ROI_PERCENT', desc: 'EV / Deposit' },
];

export const RiskScoreTable: React.FC<RiskScoreTableProps> = ({ metrics, compositeScore, onMetricsChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatValue = (metric: RiskMetric, val: number) => {
    if (metric.isCurrency) return `€${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (metric.isPercentage) return `${(val * 100).toFixed(2)}%`;
    return val.toFixed(2);
  };

  const addMetric = () => {
    const newM: MetricConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New KPI',
      formulaType: 'HOLD_PERCENT',
      target: 0.1,
      weight: 1,
      isPercentage: true
    };
    onMetricsChange([...metrics, newM]);
  };

  const deleteMetric = (id: string) => {
    onMetricsChange(metrics.filter(m => m.id !== id));
  };

  const updateMetric = (id: string, updates: Partial<MetricConfig>) => {
    onMetricsChange(metrics.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const moveMetric = (index: number, direction: 'up' | 'down') => {
    const newMetrics = [...metrics];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMetrics.length) return;
    [newMetrics[index], newMetrics[targetIndex]] = [newMetrics[targetIndex], newMetrics[index]];
    onMetricsChange(newMetrics.map(({actual, formulaString, score, ...rest}) => rest as MetricConfig));
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl"><AlertTriangle size={20} className="text-amber-500" /></div>
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Operator Risk Matrix</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Dynamic Thresholds & Compliance Auditing</p>
          </div>
        </div>
        <button onClick={addMetric} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20">
          <Plus size={14} /> NEW KPI
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border-b border-slate-50">
              <th className="px-6 py-6 w-12 text-center">#</th>
              <th className="px-8 py-6">METRIC CONFIGURATION</th>
              <th className="px-8 py-6">PERFORMANCE</th>
              <th className="px-8 py-6">THRESHOLD TARGET</th>
              <th className="px-4 py-6 text-center">WEIGHT</th>
              <th className="px-8 py-6 text-right">PENALTIES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {metrics.map((m, idx) => {
              const isOverTarget = m.score > 0;
              const isEditing = editingId === m.id;
              
              return (
                <tr key={m.id} className={`transition-all duration-300 ${isEditing ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => moveMetric(idx, 'up')} 
                        disabled={idx === 0}
                        className={`p-1 hover:text-blue-600 disabled:opacity-0 ${idx === 0 ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        onClick={() => moveMetric(idx, 'down')} 
                        disabled={idx === metrics.length - 1}
                        className={`p-1 hover:text-blue-600 disabled:opacity-0 ${idx === metrics.length - 1 ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 min-w-[200px] animate-in slide-in-from-left-2 duration-300">
                        <input 
                          value={m.name} 
                          autoFocus
                          placeholder="KPI Name"
                          onChange={(e) => updateMetric(m.id, { name: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-black border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white" 
                        />
                        <select 
                          value={m.formulaType} 
                          onChange={(e) => updateMetric(m.id, { formulaType: e.target.value as MetricBaseFormula })}
                          className="w-full px-3 py-2 text-[10px] font-black border-2 border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500"
                        >
                          {FORMULA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{m.name}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{m.formulaString}</span>
                          {/* Wrap Info icon in a span to use 'title' attribute and fix TS error */}
                          <span className="text-slate-300 cursor-help" title={`Calculation Basis: ${m.formulaString}`}>
                            <Info size={12} />
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className={`px-8 py-6 text-sm font-mono tracking-tighter ${isOverTarget ? 'text-red-600 font-black' : 'text-emerald-600 font-bold'}`}>
                    <div className="flex items-center gap-2">
                       {formatValue(m, m.actual)}
                       {isOverTarget && <ChevronRight size={14} className="text-red-400 animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5 relative group/input max-w-[140px]">
                      <TargetIcon size={14} className="text-slate-300 shrink-0" />
                      <input
                        type="number"
                        value={m.target}
                        onChange={(e) => updateMetric(m.id, { target: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 text-sm font-black bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all tabular-nums"
                        step={m.isPercentage ? "0.01" : "1"}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <input
                      type="number"
                      value={m.weight}
                      onChange={(e) => updateMetric(m.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-20 p-2 text-center text-sm font-black bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none shadow-sm transition-all tabular-nums"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className={`flex items-center justify-center min-w-[60px] h-9 px-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-sm ${
                        isOverTarget ? 'bg-red-500 text-white shadow-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {isOverTarget ? (
                          <div className="flex items-center gap-1.5">
                             <Zap size={10} fill="currentColor" />
                             <span>+{ (m.score * m.weight).toFixed(1) } P</span>
                          </div>
                        ) : (
                          'OK'
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingId(isEditing ? null : m.id)} 
                          className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-blue-50 text-slate-400 hover:text-blue-600'}`}
                          title={isEditing ? 'Save' : 'Edit Configuration'}
                        >
                          {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteMetric(m.id)} 
                          className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                          title="Delete Metric"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white border-t-2 border-slate-800">
              <td colSpan={5} className="px-8 py-10 text-xs font-black uppercase tracking-[0.5em] text-slate-500">
                Composite Campaign Compliance Score
              </td>
              <td className="px-8 py-10 text-right">
                <div className="inline-flex flex-col items-end">
                  <span className={`text-5xl font-black tracking-tighter tabular-nums ${compositeScore > 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {compositeScore.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-2 mt-1 uppercase font-bold text-[10px] text-slate-500 tracking-widest">
                    <span>Audit Grade</span>
                    <div className={`w-2 h-2 rounded-full ${compositeScore > 15 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
