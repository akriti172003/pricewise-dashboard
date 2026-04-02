import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Settings as SettingsIcon, Calculator, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { AIAssistant } from './AIAssistant';
import { cn } from '../lib/utils';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Zap className="text-white w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">PriceWise</span>
            </NavLink>

            <div className="flex items-center gap-1 sm:gap-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Calculator className="w-4 h-4" />
                <span>Simulator</span>
              </NavLink>
              
              <NavLink 
                to="/settings" 
                className={({ isActive }) => cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
          PriceWise Optimization Engine • v2.0
        </p>
      </footer>

      <AIAssistant />
    </div>
  );
};
