
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  Settings,
  Bug,
  LayoutDashboard,
  Zap,
  History,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BonusInputs, SimulationResult, AnalysisStatus, Preset } from './types';
// Fixed: Added SIMULATION_ITERATIONS to the imports from constants.ts
import { DEFAULT_INPUTS, CHART_COLORS, SIMULATION_ITERATIONS } from './constants';
import { runSimulation, generateHistogramData } from './utils/simulator';
import { analyzeBonus } from './services/geminiService';
import { InputGroup } from './components/InputGroup';
import { MetricCard } from './components/MetricCard';
import { RiskScoreTable } from './components/RiskScoreTable';

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      {content.split('\n\n').map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-3 last:mb-0 leading-relaxed">
          {paragraph.split('\n').map((line, lIndex, lineArr) => (
            <React.Fragment key={lIndex}>
              {line.split('**').map((part, partIndex) =>
                partIndex % 2 === 1 ? <strong key={partIndex} className="text-white font-black">{part}</strong> : part
              )}
              {lIndex < lineArr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BonusInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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
    setIsSidebarOpen(false);
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
    setIsCalculating(true);
    // Simulate brief processing for UX "feel"
    setTimeout(() => {
      const simResults = runSimulation(inputs);
      setResults(simResults);
      setAnalysis(''); 
      setAnalysisStatus(AnalysisStatus.IDLE);
      setIsCalculating(false);
    }, 150);
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

  const histogramData = useMemo(() => 
    results ? generateHistogramData(results.resultsDistribution) : []
  , [results]);

  const profitColor = (results?.ev || 0) >= 0 ? CHART_COLORS.primary : CHART_COLORS.danger;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-800 tracking-tight">BonusEvans Pro</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">General</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold transition-all">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setShowPresets(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all group"
          >
            <History size={18} className="group-hover:text-blue-500" /> History & Presets
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all group">
            <Settings size={18} className="group-hover:text-blue-500" /> System Settings
          </button>
          
          <div className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Developer Tools</div>
          <button 
            onClick={() => { setShowDebug(!showDebug); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${showDebug ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bug size={18} /> {showDebug ? 'Hide Debug' : 'Show Debug Info'}
          </button>
        </nav>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Usage Analytics</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-2/3" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">Current Plan: Enterprise Pro</p>
          </div>
        </div>
      </aside>

      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl border-b border-slate-800">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-95 group"
          >
            <Menu size={22} className="text-slate-300 group-hover:text-blue-400" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <Calculator size={24} className="text-blue-400 relative" />
            </div>
            <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              BonusEvans <span className="text-blue-500 text-xs font-bold tracking-widest uppercase ml-1">v3.5</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={savePreset}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all text-sm font-semibold border border-slate-700"
           >
             <Save size={16} className="text-blue-400" /> Snapshot
           </button>
           <button className="p-2 hover:bg-slate-800 rounded-xl transition-all relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
              <History size={20} className="text-slate-400" />
           </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Presets Modal - Inline for quick switching */}
        {showPresets && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-black text-slate-800 text-lg">Load Configuration</h3>
                <button onClick={() => setShowPresets(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                {presets.length === 0 ? (
                  <div className="py-12 text-center">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">No saved configurations found.</p>
                  </div>
                ) : (
                  presets.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => loadPreset(p)}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${p.inputs.mode === 'casino' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.inputs.mode === 'casino' ? <Landmark size={20} /> : <Trophy size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(p.timestamp).toLocaleDateString()} • {p.inputs.mode}
                          </p>
                        </div>
                      </div>
                      <button onClick={(e) => deletePreset(p.id, e)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="p-1.5 bg-slate-200/50 backdrop-blur rounded-2xl flex items-center gap-1 border border-white/50 shadow-inner">
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'casino'}))}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                inputs.mode === 'casino' ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Landmark size={18} /> Casino Vertical
            </button>
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'sportsbook'}))}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                inputs.mode === 'sportsbook' ? 'bg-white text-emerald-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Trophy size={18} /> Sportsbook Vertical
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Exposure</span>
              <span className="text-xl font-black text-slate-800">€{results?.totalWageringRequired.toLocaleString()}</span>
            </div>
            <div className="h-10 w-px bg-slate-200 mx-2" />
            <div className="bg-blue-600/10 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 flex items-center gap-2 animate-pulse">
               <TrendingUp size={16} />
               <span className="text-sm font-bold">Live ROI Projection</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Main Calculation Overlay Loader */}
          {isCalculating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-40 rounded-3xl flex items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white p-8 rounded-full shadow-2xl flex items-center justify-center">
                <Activity size={40} className="text-blue-500 animate-spin" />
              </div>
            </div>
          )}

          <div className="lg:col-span-4 xl:col-span-3 h-full">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 sticky top-28 hover:shadow-xl hover:border-blue-100 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Campaign</h2>
                <div className="bg-blue-50 p-2 rounded-xl">
                  <Settings size={20} className="text-blue-500 animate-[spin_4s_linear_infinite]" />
                </div>
              </div>
              
              <div className="space-y-5">
                <InputGroup label="Principal Deposit" suffix="€" name="deposit" value={inputs.deposit} onChange={handleInputChange} min={1} step={10} />
                <InputGroup label="Bonus Match" suffix="%" name="matchPercent" value={inputs.matchPercent} onChange={handleInputChange} min={0} step={5} />
                <InputGroup label="Max Bonus Cap" suffix="€" name="matchUpTo" value={inputs.matchUpTo} onChange={handleInputChange} min={0} step={50} />
                <InputGroup label="Wager Factor" suffix="x" name="wagerMultiplier" value={inputs.wagerMultiplier} onChange={handleInputChange} min={1} step={1} />
                
                <div className="my-6 border-t border-slate-100 pt-6">
                  {inputs.mode === 'casino' ? (
                    <div className="space-y-5">
                      <InputGroup label="Target RTP" suffix="%" name="rtp" value={inputs.rtp} onChange={handleInputChange} min={80} max={99.9} step={0.1} />
                      <InputGroup label="Variance Index" name="volatility" value={inputs.volatility} onChange={handleInputChange} type="range" min={0} max={1} step={0.1} />
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <InputGroup label="Min. Slip Odds" suffix="dec" name="minOdds" value={inputs.minOdds} onChange={handleInputChange} min={1.01} step={0.1} />
                      <InputGroup label="Margin Load" suffix="%" name="bookieMargin" value={inputs.bookieMargin} onChange={handleInputChange} min={0} max={20} step={0.5} />
                      <div className="flex items-center justify-between px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <label htmlFor="isFreeBet" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stake Returned?</label>
                        <input type="checkbox" id="isFreeBet" name="isFreeBet" checked={inputs.isFreeBet} onChange={handleInputChange} className="toggle-switch" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Execution Strategy</label>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Manual Bet</span>
                       <input type="checkbox" name="useManualBet" checked={inputs.useManualBet} onChange={handleInputChange} className="toggle-switch" />
                    </div>
                  </div>
                  {inputs.useManualBet ? (
                    <InputGroup label="Unit Stake (€)" name="manualBetSize" value={inputs.manualBetSize} onChange={handleInputChange} min={0.1} step={0.1} />
                  ) : (
                    <InputGroup label="Player Aggression (1-10)" name="riskScore" value={inputs.riskScore} onChange={handleInputChange} type="range" min={1} max={10} step={0.1} />
                  )}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleCalculate} 
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-500" />
                    <Calculator size={22} className="relative group-hover:scale-110 transition-transform" /> 
                    <span className="relative">RE-RUN SIMULATION</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {results && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <MetricCard label="Expected Value" value={`€${results.ev.toFixed(2)}`} subValue={`${((results.ev / (inputs.deposit || 1)) * 100).toFixed(1)}% ROI`} icon={DollarSign} trend={results.ev >= 0 ? 'positive' : 'negative'} />
                  <MetricCard label="Success Prob." value={`${results.winRate.toFixed(1)}%`} subValue="Completion Rate" icon={Target} trend={results.winRate > 40 ? 'positive' : results.winRate > 20 ? 'neutral' : 'negative'} />
                  <MetricCard label="Risk of Ruin" value={`${results.bustRate.toFixed(1)}%`} subValue="P(Bust)" icon={ShieldAlert} trend={results.bustRate < 50 ? 'positive' : 'negative'} />
                  <MetricCard label="Terminal Avg" value={`€${results.averageEndBalance.toFixed(0)}`} subValue={`Median: €${results.medianEndBalance.toFixed(0)}`} icon={Activity} color="text-slate-800" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                  <div className="xl:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col hover:shadow-lg transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Terminal Distribution</h3>
                        <p className="text-sm text-slate-400 font-medium">Outcome frequencies from {SIMULATION_ITERATIONS.toLocaleString()} iterations</p>
                      </div>
                      <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                        <BarChart3 size={24} />
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                          <XAxis 
                            dataKey="range" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                          />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 'bold' }} 
                            cursor={{ fill: '#F8FAFC', radius: 8 }} 
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {histogramData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.value > inputs.deposit ? CHART_COLORS.primary : CHART_COLORS.danger} 
                                fillOpacity={0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="xl:col-span-5 bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-700 group">
                    <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                      <BrainCircuit size={280} />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/40 animate-pulse">
                          <Sparkles size={18} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">AI Audit Log</h3>
                      </div>
                      {analysisStatus === AnalysisStatus.IDLE && (
                        <button 
                          onClick={handleAnalysis} 
                          className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                        >
                          GENERATE INSIGHTS
                        </button>
                      )}
                    </div>
                    <div className="relative z-10 flex-1 overflow-y-auto max-h-[250px] text-sm leading-relaxed opacity-90 pr-4 custom-scrollbar scroll-smooth">
                      {analysisStatus === AnalysisStatus.LOADING ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                          <div className="flex items-center gap-2">
                             <Dna size={28} className="text-blue-400 animate-spin" />
                             <Activity size={20} className="text-emerald-400 animate-pulse" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Monte Carlo Datasets...</span>
                        </div>
                      ) : analysisStatus === AnalysisStatus.SUCCESS ? (
                        <SimpleMarkdownRenderer content={analysis} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                          <Info size={32} className="text-slate-700" />
                          <p className="text-slate-400 font-medium italic">Execute analysis to receive an AI-powered breakdown of mathematical risk and player psychology.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="animate-in slide-in-from-bottom-8 duration-1000">
                   <RiskScoreTable 
                    metrics={results.riskMetrics} 
                    compositeScore={results.compositeRiskScore}
                    onWeightChange={handleWeightChange}
                    onTargetChange={handleTargetChange}
                  />
                </div>
              </>
            )}

            {/* Debug Panel */}
            {showDebug && results && (
              <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Bug size={18} className="text-amber-500" />
                    <h3 className="text-white font-black tracking-widest uppercase text-xs">Internal State Debugger</h3>
                  </div>
                  <button onClick={() => setShowDebug(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Inputs</span>
                    <pre className="text-[10px] bg-black/40 p-4 rounded-xl text-emerald-400 font-mono overflow-auto max-h-48 border border-slate-800">
                      {JSON.stringify(inputs, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Metrics</span>
                    <pre className="text-[10px] bg-black/40 p-4 rounded-xl text-blue-400 font-mono overflow-auto max-h-48 border border-slate-800">
                      {JSON.stringify({
                        ev: results.ev,
                        winRate: results.winRate,
                        bustRate: results.bustRate,
                        compositeRisk: results.compositeRiskScore
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 mt-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-3">
             <Landmark size={24} className="text-slate-400" />
             <div className="h-6 w-px bg-slate-300" />
             <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Internal Audit Ready</p>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            © 2025 BonusEvans Predictive Analytics • Enterprise Tier
          </p>
        </div>
      </footer>

      <style>{`
        .toggle-switch {
          appearance: none;
          width: 44px;
          height: 24px;
          background: #E2E8F0;
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          border: 1px solid #CBD5E1;
        }
        .toggle-switch:checked { 
          background: #2563EB; 
          border-color: #2563EB;
        }
        .toggle-switch::before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toggle-switch:checked::before { left: 22px; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(148, 163, 184, 0.2); 
          border-radius: 10px; 
          border: 1px solid transparent;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { 
          background: rgba(148, 163, 184, 0.4); 
        }
      `}</style>
    </div>
  );
};

export default App;
