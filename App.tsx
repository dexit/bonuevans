
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShieldAlert, 
  BrainCircuit, 
  Target, 
  DollarSign, 
  Activity,
  Dna,
  Menu,
  ChevronDown,
  Save,
  Trophy,
  Landmark,
  Sparkles,
  BarChart3,
  Clock,
  Trash2,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BonusInputs, SimulationResult, AnalysisStatus, Preset } from './types';
import { DEFAULT_INPUTS, CHART_COLORS } from './constants';
import { runSimulation, generateHistogramData } from './utils/simulator';
import { analyzeBonus } from './services/geminiService';
import { InputGroup } from './components/InputGroup';
import { MetricCard } from './components/MetricCard';
import { RiskScoreTable } from './components/RiskScoreTable';

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  return (
    <>
      {content.split('\n\n').map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-3 last:mb-0">
          {paragraph.split('\n').map((line, lIndex, lineArr) => (
            <React.Fragment key={lIndex}>
              {line.split('**').map((part, partIndex) =>
                partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
              )}
              {lIndex < lineArr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BonusInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showPresets, setShowPresets] = useState(false);

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bonus_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const savePreset = () => {
    const name = prompt("Enter a name for this preset:");
    if (!name) return;
    const newPreset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      inputs,
      timestamp: Date.now()
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('bonus_presets', JSON.stringify(updated));
  };

  const loadPreset = (preset: Preset) => {
    setInputs(preset.inputs);
    setShowPresets(false);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('bonus_presets', JSON.stringify(updated));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' || type === 'range' ? parseFloat(value) : value)
    }));
  };

  const handleWeightChange = (metricName: string, newWeight: number) => {
    setInputs(prev => ({
      ...prev,
      metricWeights: { ...prev.metricWeights, [metricName]: newWeight },
    }));
  };

  const handleTargetChange = (metricName: string, newTarget: number) => {
    setInputs(prev => ({
      ...prev,
      metricTargets: { ...prev.metricTargets, [metricName]: newTarget },
    }));
  };

  const handleCalculate = useCallback(() => {
    const simResults = runSimulation(inputs);
    setResults(simResults);
    setAnalysis(''); 
    setAnalysisStatus(AnalysisStatus.IDLE);
  }, [inputs]);

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleAnalysis = async () => {
    if (!results) return;
    setAnalysisStatus(AnalysisStatus.LOADING);
    const text = await analyzeBonus(inputs, results);
    setAnalysis(text);
    setAnalysisStatus(AnalysisStatus.SUCCESS);
  };

  const histogramData = results ? generateHistogramData(results.resultsDistribution) : [];
  const profitColor = (results?.ev || 0) >= 0 ? CHART_COLORS.primary : CHART_COLORS.danger;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-slate-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors text-blue-400">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-600 px-2 py-1 rounded transition-colors">
            <h1 className="text-lg font-semibold tracking-tight">BonusEvans Calculator</h1>
            <ChevronDown size={16} className="text-slate-400 bg-slate-800 rounded-full p-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <button 
               onClick={() => setShowPresets(!showPresets)}
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-blue-300 rounded hover:bg-slate-500 transition-colors text-sm font-medium"
             >
               <Clock size={16} /> Presets
             </button>
             {showPresets && (
               <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-900 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                 <div className="p-3 border-b border-gray-100 font-bold text-xs uppercase tracking-widest text-gray-400 flex justify-between">
                   Your Presets
                   <button onClick={() => setShowPresets(false)}>×</button>
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                    {presets.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">No saved presets</div>
                    ) : (
                      presets.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => loadPreset(p)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-semibold">{p.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{p.inputs.mode}</p>
                          </div>
                          <button onClick={(e) => deletePreset(p.id, e)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                 </div>
               </div>
             )}
           </div>
           <button 
             onClick={savePreset}
             className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium"
           >
             <Save size={16} /> Save
           </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="bg-gray-200 p-1 rounded-xl flex items-center shadow-inner">
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'casino'}))}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                inputs.mode === 'casino' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Landmark size={14} /> Casino
            </button>
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'sportsbook'}))}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                inputs.mode === 'sportsbook' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy size={14} /> Sportsbook
            </button>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg border border-gray-200">
             Total Requirement: <span className="text-blue-600 font-bold">€{results?.totalWageringRequired.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                 Config <Sparkles size={18} className="text-blue-400" />
              </h2>
              
              <div className="space-y-4">
                <InputGroup label="Deposit (€):" name="deposit" value={inputs.deposit} onChange={handleInputChange} min={1} step={10} />
                <InputGroup label="Match percent (%):" name="matchPercent" value={inputs.matchPercent} onChange={handleInputChange} min={0} step={5} />
                <InputGroup label="Match up to (€):" name="matchUpTo" value={inputs.matchUpTo} onChange={handleInputChange} min={0} step={50} />
                <InputGroup label="Wager multiplier (x):" name="wagerMultiplier" value={inputs.wagerMultiplier} onChange={handleInputChange} min={1} step={1} />
                
                {inputs.mode === 'casino' ? (
                  <>
                    <InputGroup label="Game RTP (%):" name="rtp" value={inputs.rtp} onChange={handleInputChange} min={80} max={99.9} step={0.1} />
                    <InputGroup label="Volatility (0–1):" name="volatility" value={inputs.volatility} onChange={handleInputChange} type="range" min={0} max={1} step={0.1} />
                  </>
                ) : (
                  <>
                    <InputGroup label="Min Odds (decimal):" name="minOdds" value={inputs.minOdds} onChange={handleInputChange} min={1.01} step={0.1} />
                    <InputGroup label="Bookie Margin (%):" name="bookieMargin" value={inputs.bookieMargin} onChange={handleInputChange} min={0} max={20} step={0.5} />
                    <div className="flex items-center gap-2 pt-2 pb-1">
                      <input type="checkbox" id="isFreeBet" name="isFreeBet" checked={inputs.isFreeBet} onChange={handleInputChange} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="isFreeBet" className="text-sm font-medium text-gray-700">Is Free Bet?</label>
                    </div>
                  </>
                )}

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">Simulation Bet</label>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-400 font-bold uppercase">Manual</span>
                       <input type="checkbox" name="useManualBet" checked={inputs.useManualBet} onChange={handleInputChange} className="toggle-switch" />
                    </div>
                  </div>
                  {inputs.useManualBet ? (
                    <InputGroup label="Bet Size (€):" name="manualBetSize" value={inputs.manualBetSize} onChange={handleInputChange} min={0.1} step={0.1} />
                  ) : (
                    <InputGroup label="Player Aggression (1-10):" name="riskScore" value={inputs.riskScore} onChange={handleInputChange} type="range" min={1} max={10} step={1} />
                  )}
                </div>

                <div className="pt-4">
                  <button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 group">
                    <Calculator size={20} className="group-hover:rotate-12 transition-transform" /> Calculate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {results && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <MetricCard label="Expected Value" value={`€${results.ev.toFixed(2)}`} subValue={`${((results.ev / inputs.deposit) * 100).toFixed(1)}% ROI`} icon={DollarSign} trend={results.ev >= 0 ? 'positive' : 'negative'} />
                  <MetricCard label="Win Rate" value={`${results.winRate.toFixed(1)}%`} subValue="Wager Completed" icon={Target} trend={results.winRate > 40 ? 'positive' : results.winRate > 20 ? 'neutral' : 'negative'} />
                  <MetricCard label="Bust Prob" value={`${results.bustRate.toFixed(1)}%`} subValue="Risk of Ruin" icon={ShieldAlert} trend={results.bustRate < 50 ? 'positive' : 'negative'} />
                  <MetricCard label="Avg End Balance" value={`€${results.averageEndBalance.toFixed(0)}`} subValue={`Median: €${results.medianEndBalance.toFixed(0)}`} icon={Activity} color="text-blue-600" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Outcome Distribution</h3>
                        <p className="text-sm text-gray-500">End bankroll frequency</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-500"><BarChart3 size={20} /></div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="range" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                          <Bar dataKey="count" fill={profitColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col h-full shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} /></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-2"><BrainCircuit size={20} /><h3 className="text-lg font-bold">AI Strategic Insight</h3></div>
                      {analysisStatus === AnalysisStatus.IDLE && (
                        <button onClick={handleAnalysis} className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30">Generate</button>
                      )}
                    </div>
                    <div className="relative z-10 flex-1 overflow-y-auto max-h-48 text-sm leading-relaxed opacity-90 pr-2 custom-scrollbar">
                      {analysisStatus === AnalysisStatus.LOADING ? (
                        <div className="flex flex-col items-center justify-center h-full animate-pulse"><Dna size={24} className="mb-2 animate-spin" /><span className="text-xs opacity-80">Synthesizing data...</span></div>
                      ) : analysisStatus === AnalysisStatus.SUCCESS ? (
                        <SimpleMarkdownRenderer content={analysis} />
                      ) : (
                        <p>Receive an AI-powered breakdown of the risk profile and strategic recommendations for this configuration.</p>
                      )}
                    </div>
                  </div>
                </div>

                <RiskScoreTable 
                  metrics={results.riskMetrics} 
                  compositeScore={results.compositeRiskScore}
                  onWeightChange={handleWeightChange}
                  onTargetChange={handleTargetChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
      <style>{`
        .toggle-switch {
          appearance: none;
          width: 34px;
          height: 20px;
          background: #cbd5e1;
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: 0.3s;
          outline: none;
        }
        .toggle-switch:checked { background: #3b82f6; }
        .toggle-switch::before {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: 0.3s;
        }
        .toggle-switch:checked::before { left: 16px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
