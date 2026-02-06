
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
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BonusInputs, SimulationResult, AnalysisStatus } from './types';
import { DEFAULT_INPUTS, CHART_COLORS } from './constants';
import { runSimulation, generateHistogramData } from './utils/simulator';
import { analyzeBonus } from './services/geminiService';
import { InputGroup } from './components/InputGroup';
import { MetricCard } from './components/MetricCard';
import { RiskScoreTable } from './components/RiskScoreTable';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BonusInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'casino' | 'sportsbook'>('casino');
  const [analysis, setAnalysis] = useState<string>('');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleWeightChange = (metricName: string, newWeight: number) => {
    setInputs(prev => ({
      ...prev,
      metricWeights: {
        ...prev.metricWeights,
        [metricName]: newWeight,
      },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* Header */}
      <header className="bg-slate-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors text-blue-400">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-600 px-2 py-1 rounded transition-colors">
            <h1 className="text-lg font-semibold tracking-tight">Bonus risk calculator</h1>
            <ChevronDown size={16} className="text-slate-400 bg-slate-800 rounded-full p-0.5" />
          </div>
        </div>
        <button className="text-blue-400 font-semibold text-base hover:text-blue-300 transition-colors">
          Done
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="bg-gray-200 p-1 rounded-xl flex items-center shadow-inner">
            <button 
              onClick={() => setActiveTab('casino')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'casino' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Landmark size={14} />
              Casino
            </button>
            <button 
              onClick={() => setActiveTab('sportsbook')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'sportsbook' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy size={14} />
              Sportsbook
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
              Match % <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
              <Save size={16} className="text-gray-400" />
              Load Preset
            </button>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Inputs Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Inputs</h2>
              
              <div className="space-y-4">
                <InputGroup
                  label="Deposit (€):"
                  name="deposit"
                  value={inputs.deposit}
                  onChange={handleInputChange}
                  min={10}
                  step={10}
                />
                <InputGroup
                  label="Match percent (%):"
                  name="matchPercent"
                  value={inputs.matchPercent}
                  onChange={handleInputChange}
                  min={0}
                  step={5}
                />
                <InputGroup
                  label="Match up to (€):"
                  name="matchUpTo"
                  value={inputs.matchUpTo}
                  onChange={handleInputChange}
                  min={0}
                  step={50}
                />
                <InputGroup
                  label="Wager multiplier (x):"
                  name="wagerMultiplier"
                  value={inputs.wagerMultiplier}
                  onChange={handleInputChange}
                  min={1}
                  step={1}
                />
                <InputGroup
                  label="RTP with active bonus (%):"
                  name="rtp"
                  value={inputs.rtp}
                  onChange={handleInputChange}
                  min={80}
                  max={99.9}
                  step={0.1}
                />
                <div className="pt-2">
                  <InputGroup
                    label="Volatility (0–1):"
                    name="volatility"
                    value={inputs.volatility}
                    onChange={handleInputChange}
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                <InputGroup
                  label="Risk score:"
                  name="riskScore"
                  value={inputs.riskScore}
                  onChange={handleInputChange}
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                />
                
                <div className="pt-4">
                  <button
                    onClick={handleCalculate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Calculator size={20} />
                    Calculate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Simulation Overview</h2>
            
            {results && (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <MetricCard
                    label="Expected Value"
                    value={`€${results.ev.toFixed(2)}`}
                    subValue={`${((results.ev / inputs.deposit) * 100).toFixed(1)}% ROI`}
                    icon={DollarSign}
                    trend={results.ev >= 0 ? 'positive' : 'negative'}
                  />
                  <MetricCard
                    label="Win Rate"
                    value={`${results.winRate.toFixed(1)}%`}
                    subValue="Completed Wager"
                    icon={Target}
                    trend={results.winRate > 40 ? 'positive' : results.winRate > 20 ? 'neutral' : 'negative'}
                  />
                  <MetricCard
                    label="Bust Probability"
                    value={`${results.bustRate.toFixed(1)}%`}
                    subValue="Risk of Ruin"
                    icon={ShieldAlert}
                    trend={results.bustRate < 50 ? 'positive' : 'negative'}
                  />
                  <MetricCard
                    label="Avg End Balance"
                    value={`€${results.averageEndBalance.toFixed(0)}`}
                    subValue={`Median: €${results.medianEndBalance.toFixed(0)}`}
                    icon={Activity}
                    color="text-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Distribution Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Outcome Distribution</h3>
                        <p className="text-sm text-gray-500">Frequency of ending balances</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                        <BarChart3 size={20} />
                      </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="range" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                          />
                          <Bar dataKey="count" fill={profitColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col h-full shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={120} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <BrainCircuit size={20} />
                        <h3 className="text-lg font-bold">AI Strategic Insight</h3>
                      </div>
                      {analysisStatus === AnalysisStatus.IDLE && (
                        <button 
                          onClick={handleAnalysis}
                          className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
                        >
                          Generate
                        </button>
                      )}
                    </div>

                    <div className="relative z-10 flex-1 overflow-y-auto max-h-48">
                      {analysisStatus === AnalysisStatus.LOADING && (
                        <div className="flex flex-col items-center justify-center h-full animate-pulse">
                          <Dna size={24} className="mb-2 animate-spin" />
                          <span className="text-xs opacity-80">Synthesizing data...</span>
                        </div>
                      )}
                      
                      {analysisStatus === AnalysisStatus.SUCCESS && (
                        <div className="text-sm leading-relaxed opacity-90">
                          {analysis}
                        </div>
                      )}

                      {analysisStatus === AnalysisStatus.IDLE && (
                        <p className="text-sm opacity-70">
                          Click generate to receive an AI-powered breakdown of the risk profile and strategic recommendations for this bonus configuration.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* New Risk Matrix Table */}
                <RiskScoreTable 
                  metrics={results.riskMetrics} 
                  compositeScore={results.compositeRiskScore}
                  onWeightChange={handleWeightChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;