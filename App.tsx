
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator, TrendingUp, ShieldAlert, BrainCircuit, Target, 
  DollarSign, Activity, Dna, Menu, ChevronDown, Save, Trophy, 
  Landmark, Sparkles, BarChart3, Clock, Trash2, X, Settings, 
  Bug, LayoutDashboard, Zap, History, Info, Plus, ChevronUp, GripVertical
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BonusInputs, SimulationResult, AnalysisStatus, Preset, MetricConfig, MetricBaseFormula } from './types';
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
  const [showHistory, setShowHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bonus_presets');
    if (saved) {
      try { setPresets(JSON.parse(saved)); } 
      catch (e) { console.error("Failed to parse presets", e); }
    }
  }, []);

  const savePreset = () => {
    const name = prompt("Enter a name for this snapshot:");
    if (!name) return;
    const newPreset: Preset = {
      id: Math.random().toString(36).substr(2, 9),
      name, inputs, timestamp: Date.now()
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('bonus_presets', JSON.stringify(updated));
  };

  const loadPreset = (preset: Preset) => {
    setInputs(preset.inputs);
    setShowHistory(false);
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

  const handleMetricUpdate = (updatedMetrics: MetricConfig[]) => {
    setInputs(prev => ({ ...prev, metrics: updatedMetrics }));
  };

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      const simResults = runSimulation(inputs);
      setResults(simResults);
      setAnalysis(''); 
      setAnalysisStatus(AnalysisStatus.IDLE);
      setIsCalculating(false);
    }, 150);
  }, [inputs]);

  useEffect(() => { handleCalculate(); }, []);

  const handleAnalysis = async () => {
    if (!results) return;
    setAnalysisStatus(AnalysisStatus.LOADING);
    const text = await analyzeBonus(inputs, results);
    setAnalysis(text);
    setAnalysisStatus(AnalysisStatus.SUCCESS);
  };

  const histogramData = useMemo(() => results ? generateHistogramData(results.resultsDistribution) : [], [results]);
  const profitColor = (results?.ev || 0) >= 0 ? CHART_COLORS.primary : CHART_COLORS.danger;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* Offcanvas Overlays */}
      {(isSidebarOpen || showHistory) && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => { setIsSidebarOpen(false); setShowHistory(false); }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Zap size={20} className="text-white" /></div>
            <h2 className="font-bold text-slate-800 tracking-tight">BonusEvans Pro</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="px-2 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">General</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold transition-all"><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => { setShowHistory(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all group"><History size={18} className="group-hover:text-blue-500" /> Audit History</button>
          <button onClick={() => { setShowDebug(!showDebug); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group ${showDebug ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}><Bug size={18} /> System Debug</button>
        </nav>
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase text-center">Version 3.6.0 Stable</div>
      </aside>

      {/* History Offcanvas */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2"><Clock size={16} /> Audit History</h3>
          <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {presets.length === 0 ? (
            <div className="py-20 text-center opacity-40"><History size={48} className="mx-auto mb-4" /><p className="font-bold uppercase tracking-widest text-xs">No Snapshots Found</p></div>
          ) : (
            presets.map(p => (
              <div key={p.id} onClick={() => loadPreset(p)} className="group flex flex-col p-4 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${p.inputs.mode === 'casino' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.inputs.mode}</span>
                  <button onClick={(e) => deletePreset(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
                <p className="font-bold text-slate-800">{p.name}</p>
                <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                   <span>{new Date(p.timestamp).toLocaleString()}</span>
                   <span className="text-blue-600">€{p.inputs.deposit.toLocaleString()} DEP</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-95 group"><Menu size={22} className="text-slate-300 group-hover:text-blue-400" /></button>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Calculator size={24} className="text-blue-400" />
            <h1 className="text-xl font-black tracking-tight hidden sm:block">BonusEvans <span className="text-blue-500 text-[10px] ml-1">V3.6</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={savePreset} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20"><Save size={16} /> Snapshot</button>
          <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-slate-800 rounded-xl transition-all"><History size={20} className="text-slate-400" /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-8 animate-in fade-in duration-1000">
        
        {/* Mode Selector */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="p-1.5 bg-slate-200/50 backdrop-blur rounded-2xl flex items-center gap-1 border border-white/50 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'casino'}))}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                inputs.mode === 'casino' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Landmark size={18} /> Casino
            </button>
            <button 
              onClick={() => setInputs(p => ({...p, mode: 'sportsbook'}))}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                inputs.mode === 'sportsbook' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Trophy size={18} /> Sportsbook
            </button>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Liability</span>
               <span className="text-xl font-black text-slate-800">€{results?.totalWageringRequired.toLocaleString()}</span>
             </div>
             <div className="bg-blue-600/10 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 flex items-center gap-2"><TrendingUp size={16} /><span className="text-sm font-bold">ROI+ Analyzed</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          {isCalculating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-40 rounded-3xl flex items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white p-8 rounded-full shadow-2xl"><Activity size={40} className="text-blue-500 animate-spin" /></div>
            </div>
          )}

          {/* Configuration Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 sticky top-28 transition-all duration-500">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">Campaign Config</h2>
              <div className="space-y-4">
                <InputGroup label="Deposit" suffix="€" name="deposit" value={inputs.deposit} onChange={handleInputChange} min={1} />
                <InputGroup label="Match %" suffix="%" name="matchPercent" value={inputs.matchPercent} onChange={handleInputChange} min={0} />
                <InputGroup label="Bonus Cap" suffix="€" name="matchUpTo" value={inputs.matchUpTo} onChange={handleInputChange} min={0} />
                <InputGroup label="Wager x" suffix="x" name="wagerMultiplier" value={inputs.wagerMultiplier} onChange={handleInputChange} min={1} />
                {inputs.mode === 'casino' ? (
                  <div className="space-y-4 pt-2">
                    <InputGroup label="Target RTP" suffix="%" name="rtp" value={inputs.rtp} onChange={handleInputChange} min={80} max={99.9} step={0.1} />
                    <InputGroup label="Volatility Index" name="volatility" value={inputs.volatility} onChange={handleInputChange} type="range" min={0} max={1} step={0.1} />
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <InputGroup label="Slip Odds" suffix="dec" name="minOdds" value={inputs.minOdds} onChange={handleInputChange} min={1.01} step={0.1} />
                    <InputGroup label="Margin %" suffix="%" name="bookieMargin" value={inputs.bookieMargin} onChange={handleInputChange} min={0} max={20} step={0.5} />
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Stake Back?</label>
                      <input type="checkbox" name="isFreeBet" checked={inputs.isFreeBet} onChange={handleInputChange} className="toggle-switch" />
                    </div>
                  </div>
                )}
                <div className="pt-6">
                  <button onClick={handleCalculate} className="w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group">
                    <Calculator size={20} className="group-hover:rotate-12 transition-transform" /> SIMULATE ROI
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {results && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <MetricCard label="Expected Value" value={`€${results.ev.toFixed(2)}`} subValue={`${((results.ev / (inputs.deposit || 1)) * 100).toFixed(1)}% ROI`} icon={DollarSign} trend={results.ev >= 0 ? 'positive' : 'negative'} />
                  <MetricCard label="Clearance" value={`${results.winRate.toFixed(1)}%`} subValue="Wager Done" icon={Target} trend={results.winRate > 40 ? 'positive' : 'neutral'} />
                  <MetricCard label="Ruin risk" value={`${results.bustRate.toFixed(1)}%`} subValue="P(Bust)" icon={ShieldAlert} trend={results.bustRate < 50 ? 'positive' : 'negative'} />
                  <MetricCard label="Terminal Avg" value={`€${results.averageEndBalance.toFixed(0)}`} icon={Activity} color="text-slate-800" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                  <div className="xl:col-span-7 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col group">
                    <div className="flex items-center justify-between mb-8">
                      <div><h3 className="text-xl font-black text-slate-800">Bankroll Distribution</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Terminal State Analysis</p></div>
                      <BarChart3 size={24} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ left: -30 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="range" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} cursor={{ fill: '#F8FAFC' }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {histogramData.map((e, i) => (<Cell key={i} fill={e.value > inputs.deposit ? CHART_COLORS.primary : CHART_COLORS.danger} fillOpacity={0.8} />))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="xl:col-span-5 bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden flex flex-col group shadow-2xl">
                    <BrainCircuit size={280} className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <h3 className="text-lg font-black tracking-tight flex items-center gap-2"><Sparkles size={18} className="text-blue-400" /> AI Audit</h3>
                      {analysisStatus === AnalysisStatus.IDLE && (
                        <button onClick={handleAnalysis} className="px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Audit Offer</button>
                      )}
                    </div>
                    <div className="relative z-10 flex-1 overflow-y-auto max-h-[250px] text-sm leading-relaxed opacity-90 pr-4 custom-scrollbar">
                      {analysisStatus === AnalysisStatus.LOADING ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 animate-pulse"><Dna size={28} className="text-blue-400 animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thinking...</span></div>
                      ) : analysisStatus === AnalysisStatus.SUCCESS ? (
                        <SimpleMarkdownRenderer content={analysis} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 italic text-xs"><Info size={24} className="mb-2 opacity-20" /><p>Request analysis for campaign insights.</p></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="animate-in slide-in-from-bottom-8 duration-700">
                  <RiskScoreTable 
                    metrics={results.riskMetrics} 
                    compositeScore={results.compositeRiskScore}
                    onMetricsChange={handleMetricUpdate}
                  />
                </div>
              </>
            )}

            {showDebug && results && (
              <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700 text-[10px] font-mono text-emerald-400 overflow-auto max-h-64 shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2"><span className="text-white font-black uppercase">System Logs</span><Bug size={14} /></div>
                <pre>{JSON.stringify({ inputs, results: { ev: results.ev, acri: results.compositeRiskScore } }, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 px-6 mt-12 text-center grayscale opacity-40">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">© 2025 BonusEvans Predictive • Confidential</p>
      </footer>

      <style>{`
        .toggle-switch { appearance: none; width: 44px; height: 24px; background: #E2E8F0; border-radius: 20px; position: relative; cursor: pointer; transition: 0.4s; outline: none; border: 1px solid #CBD5E1; }
        .toggle-switch:checked { background: #2563EB; border-color: #2563EB; }
        .toggle-switch::before { content: ''; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: 0.4s; shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .toggle-switch:checked::before { left: 22px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
