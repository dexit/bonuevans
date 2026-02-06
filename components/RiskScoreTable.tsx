
import React from 'react';
import { RiskMetric } from '../types';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskScoreTableProps {
  metrics: RiskMetric[];
  compositeScore: number;
}

export const RiskScoreTable: React.FC<RiskScoreTableProps> = ({ metrics, compositeScore }) => {
  const formatValue = (metric: RiskMetric, val: number) => {
    if (metric.isCurrency) return `€${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (metric.isPercentage) return `${(val * 1).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
    return val.toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-bold text-gray-900">Operator Risk Matrix</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info size={14} />
          <span>Calculated per simulation run</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">
              <th className="px-6 py-3 border-b border-gray-100">Metric</th>
              <th className="px-6 py-3 border-b border-gray-100">Actual</th>
              <th className="px-6 py-3 border-b border-gray-100">Target</th>
              <th className="px-6 py-3 border-b border-gray-100">Risk Formula</th>
              <th className="px-6 py-3 border-b border-gray-100 text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {metrics.map((m, idx) => {
              const isOverTarget = m.score > 0;
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                  <td className={`px-6 py-4 text-sm font-mono ${isOverTarget ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                    {formatValue(m, m.actual)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {formatValue(m, m.target)}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-blue-600 bg-blue-50/30 group-hover:bg-blue-50 transition-colors">
                    {m.formula}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                      m.score > 3 ? 'bg-red-100 text-red-700' : 
                      m.score > 0 ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {m.score}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td colSpan={4} className="px-6 py-4 text-sm font-bold uppercase tracking-widest">
                Composite Risk Score
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`text-xl font-black ${
                  compositeScore > 10 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {compositeScore}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
