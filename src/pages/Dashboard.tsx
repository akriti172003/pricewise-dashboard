import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Zap,
  ArrowRight,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Sun,
  CloudRain,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AnimatedNumber: React.FC<{ value: number; prefix?: string }> = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 500;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
};

export const Dashboard: React.FC = () => {
  const { 
    pricing, 
    setPricing, 
    revenue, 
    suggestedPrice, 
    recommendationReason,
    confidenceLevel,
    autoOptimize,
    applyRecommendation,
    fetchAIStrategy,
    aiLoading,
    isAIGenerated
  } = useAppContext();
  
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 300);
    return () => clearTimeout(timer);
  }, [pricing]);

  const revenueChange = ((revenue.predicted / revenue.current - 1) * 100).toFixed(1);
  const isPositive = parseFloat(revenueChange) >= 0;

  const chartData = Array.from({ length: 12 }).map((_, i) => {
    const price = pricing.basePrice * (0.4 + i * 0.1);
    const occ = Math.max(5, Math.min(100, pricing.occupancyRate * (1.6 - (price / pricing.basePrice))));
    return {
      price: Math.round(price),
      revenue: Math.round(price * (occ / 100) * 30)
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header & Guidance */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3 h-3" />
          Production Grade Optimization
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          Maximize your property revenue with <span className="text-emerald-500">intelligent pricing decisions</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Simulate pricing strategies using real-time data to optimize revenue and occupancy. 
          Adjust the inputs to see how pricing decisions impact your revenue in real-time.
        </p>
      </div>

      {/* MAIN TOOL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: INPUTS */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                Control Center
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={fetchAIStrategy}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {aiLoading ? 'Asking AI...' : 'Get AI Strategy'}
                </button>
                <button 
                  onClick={autoOptimize}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-3 h-3" />
                  Auto Optimize
                </button>
                <button 
                  onClick={() => setPricing({ basePrice: 4500, occupancyRate: 65, demandLevel: 'medium', dayType: 'weekday', season: 'low' })}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-10">
              {/* Sliders */}
              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Base Price (₹)</label>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      <AnimatedNumber value={pricing.basePrice} prefix="₹" />
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="20000" 
                    step="100"
                    value={pricing.basePrice}
                    onChange={(e) => setPricing(prev => ({ ...prev, basePrice: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Occupancy (%)</label>
                    <div className="text-3xl font-black text-emerald-500">
                      <AnimatedNumber value={pricing.occupancyRate} />%
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={pricing.occupancyRate}
                    onChange={(e) => setPricing(prev => ({ ...prev, occupancyRate: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Demand</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setPricing(prev => ({ ...prev, demandLevel: level }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all",
                          pricing.demandLevel === level 
                            ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day Type</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                    {(['weekday', 'weekend'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPricing(prev => ({ ...prev, dayType: type }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all",
                          pricing.dayType === type 
                            ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seasonality</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                    {(['low', 'peak'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPricing(prev => ({ ...prev, season: s }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all",
                          pricing.season === s 
                            ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {s === 'low' ? 'Off-Season' : 'Peak Season'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* REVENUE BREAKDOWN */}
          <section className="grid grid-cols-3 gap-4">
            {[
              { label: 'Daily', value: revenue.breakdown.daily, icon: Sun },
              { label: 'Weekly', value: revenue.breakdown.weekly, icon: Calendar },
              { label: 'Monthly', value: revenue.breakdown.monthly, icon: TrendingUp },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-2">
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={item.value} prefix="₹" />
                </p>
              </div>
            ))}
          </section>
        </div>

        {/* RIGHT: OUTPUTS & ANALYSIS */}
        <div className="lg:col-span-5 space-y-8">
          {/* SUGGESTED PRICE CARD */}
          <section className="bg-slate-900 dark:bg-emerald-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-all" />
            
            <div className="relative space-y-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Recommendation</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-5xl font-black tracking-tighter" title="Revenue = Price × Occupancy × Estimated bookings">
                    <AnimatedNumber value={suggestedPrice} prefix="₹" />
                  </h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-slate-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                      Optimal price point calculated based on current market demand and occupancy trends.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">Optimal rate per night</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confidence Level:</span>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  confidenceLevel === 'High' ? "bg-emerald-500/20 text-emerald-400" :
                  confidenceLevel === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  {confidenceLevel}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Info className="w-3 h-3" />
                    Strategy Insight
                  </div>
                  {isAIGenerated && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Generated
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{recommendationReason}"
                </p>
              </div>

              <button 
                onClick={() => applyRecommendation(suggestedPrice > pricing.basePrice ? 'increase' : 'decrease', Math.abs(suggestedPrice - pricing.basePrice))}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 group"
              >
                Apply Strategy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* SCENARIO COMPARISON */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Scenario Comparison
              <div className="group relative">
                <Info className="w-3 h-3 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl normal-case font-medium">
                  Revenue = Price × Occupancy × Estimated bookings (30 days)
                </div>
              </div>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Revenue</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    <AnimatedNumber value={revenue.current} prefix="₹" />
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Optimized</p>
                  <p className="text-lg font-black text-emerald-500">
                    <AnimatedNumber value={revenue.predicted} prefix="₹" />
                  </p>
                </div>
              </div>

              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl border",
                isPositive 
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600" 
                  : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600"
              )}>
                <div className="flex items-center gap-2 font-black text-sm">
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  Revenue Impact
                </div>
                <div className="text-xl font-black">
                  {isPositive ? '+' : ''}{revenueChange}%
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CHART SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-6 bg-orange-500 rounded-full" />
            Yield Projection Curve
          </h2>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Projected Revenue
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="price" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  borderRadius: '16px',
                  color: '#fff',
                  padding: '12px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => `Price Point: ${formatCurrency(label)}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* RISK & OPPORTUNITY ANALYSIS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Risk Assessment
          </h3>
          <div className="space-y-4">
            {pricing.occupancyRate > 90 ? (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">High Occupancy Risk</p>
                <p className="text-[10px] text-orange-600 dark:text-orange-500 leading-relaxed">
                  Occupancy is above 90%. You are likely underpricing and missing out on significant yield. Increase rates by 15-20% immediately.
                </p>
              </div>
            ) : pricing.occupancyRate < 30 ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Low Occupancy Risk</p>
                <p className="text-[10px] text-red-600 dark:text-red-500 leading-relaxed">
                  Critical occupancy levels detected. Your current price point is not attracting enough volume for the {pricing.demandLevel} demand level.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Healthy Stability</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 leading-relaxed">
                  Your current occupancy of {pricing.occupancyRate}% is within the optimal range for {pricing.demandLevel} demand. No immediate risks detected.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Growth Opportunities
          </h3>
          <div className="space-y-4">
            {pricing.dayType === 'weekday' ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Corporate Upsell</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-500 leading-relaxed">
                  Weekday demand is typically driven by business travelers. Consider adding a "Business Bundle" to increase average transaction value.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Leisure Premium</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-500 leading-relaxed">
                  Weekend travelers are less price-sensitive. You can push rates 10% higher if you offer complimentary late check-out.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};