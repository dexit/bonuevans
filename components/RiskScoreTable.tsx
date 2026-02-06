
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
    onMetricsChange(newMetrics);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl"><AlertTriangle size={20} className="text-amber-500" /></div>
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Operator Risk Matrix</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Editable Thresholds & KPI Weights</p>
          </div>
        </div>
        <button onClick={addMetric} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"><Plus size={14} /> New KPI</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border-b border-slate-50">
              <th className="px-8 py-6 w-10">#</th>
              <th className="px-8 py-6">Metric Configuration</th>
              <th className="px-8 py-6">Performance</th>
              <th className="px-8 py-6">Threshold Target</th>
              <th className="px-4 py-6 text-center">Weight</th>
              <th className="px-8 py-6 text-right">Penalties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {metrics.map((m, idx) => {
              const isOverTarget = m.score > 0;
              const isEditing = editingId === m.id;
              
              return (
                <tr key={m.id} className={`hover:bg-slate-50/80 transition-all duration-300 ${isEditing ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 items-center">
                      <button onClick={() => moveMetric(idx, 'up')} className="text-slate-300 hover:text-blue-500"><ChevronUp size={14} /></button>
                      <button onClick={() => moveMetric(idx, 'down')} className="text-slate-300 hover:text-blue-500"><ChevronDown size={14} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          value={m.name} 
                          onChange={(e) => updateMetric(m.id, { name: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs font-bold border rounded-lg outline-none focus:border-blue-500" 
                        />
                        <select 
                          value={m.formulaType} 
                          onChange={(e) => updateMetric(m.id, { formulaType: e.target.value as MetricBaseFormula })}
                          className="w-full px-3 py-1.5 text-[10px] font-bold border rounded-lg bg-white"
                        >
                          {FORMULA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.desc})</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{m.name}</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mt-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-max">{m.formulaString}</span>
                      </div>
                    )}
                  </td>
                  <td className={`px-8 py-6 text-sm font-mono tracking-tighter ${isOverTarget ? 'text-red-600 font-black' : 'text-emerald-600 font-bold'}`}>
                    {formatValue(m, m.actual)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 group/input">
                      <TargetIcon size={14} className="text-slate-300" />
                      <input
                        type="number"
                        value={m.target}
                        onChange={(e) => updateMetric(m.id, { target: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 text-sm font-black bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                        step={m.isPercentage ? "0.01" : "1"}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <input
                      type="number"
                      value={m.weight}
                      onChange={(e) => updateMetric(m.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-16 p-2 text-center text-sm font-black bg-white border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none shadow-sm transition-all"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition-all ${
                        isOverTarget ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {isOverTarget ? `+${(m.score * m.weight).toFixed(1)} P` : 'OK'}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingId(isEditing ? null : m.id)} className="p-2 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all">{isEditing ? <Save size={16} /> : <Edit3 size={16} />}</button>
                        <button onClick={() => deleteMetric(m.id)} className="p-2 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td colSpan={5} className="px-8 py-8 text-sm font-black uppercase tracking-[0.4em] text-slate-500">Aggregated Campaign Risk Index</td>
              <td className="px-8 py-8 text-right">
                <div className="inline-flex flex-col items-end">
                  <span className={`text-4xl font-black tabular-nums ${compositeScore > 15 ? 'text-red-400' : 'text-emerald-400'}`}>{compositeScore.toFixed(1)}</span>
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
