import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Bot, User as UserIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Message } from '../types';
import { cn } from '../lib/utils';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your PriceWise optimization assistant. How can I help you maximize your revenue today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const { pricing, suggestedPrice, revenue, autoOptimize } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "";
      const lowerText = text.toLowerCase();

      if (lowerText.includes('optimize pricing') || lowerText.includes('auto optimize')) {
        autoOptimize();
        response = `I've automatically optimized your pricing for maximum yield! At ₹${pricing.basePrice} price and ${pricing.occupancyRate}% occupancy, we've adjusted parameters to target a ${pricing.demandLevel} demand scenario. Your revenue is now projected at ₹${revenue.predicted.toLocaleString()}.`;
      } else if (lowerText.includes('improve occupancy') || lowerText.includes('occupancy tips')) {
        response = `To improve your current ${pricing.occupancyRate}% occupancy, consider a ${pricing.demandLevel === 'low' ? 'significant' : 'minor'} price reduction or targeted weekend promotions. At ₹${pricing.basePrice}, a 10% discount could boost occupancy by up to 15% in the current market.`;
      } else if (lowerText.includes('revenue') || lowerText.includes('increase')) {
        const lift = ((revenue.predicted / revenue.current - 1) * 100).toFixed(1);
        response = `At your current ₹${pricing.basePrice} price and ${pricing.occupancyRate}% occupancy, increasing price to ₹${suggestedPrice} can boost revenue by ${lift}%. This is especially effective given the ${pricing.demandLevel} demand and ${pricing.season} season.`;
      } else if (lowerText.includes('price') || lowerText.includes('set')) {
        response = `Our optimization engine suggests a price of ₹${suggestedPrice} (currently ₹${pricing.basePrice}). This takes into account the ${pricing.dayType} trends and ${pricing.season} seasonality.`;
      } else if (lowerText.includes('risk') || lowerText.includes('warning')) {
        if (pricing.occupancyRate > 90) {
          response = "WARNING: Your occupancy is extremely high (90%+). You are likely leaving money on the table by underpricing. Increase rates immediately.";
        } else if (pricing.occupancyRate < 30) {
          response = "RISK: Critically low occupancy (<30%). Your current price of ₹" + pricing.basePrice + " may be too high for the " + pricing.demandLevel + " demand level.";
        } else {
          response = "Market risks are currently low. Maintain your strategy but monitor the " + (pricing.dayType === 'weekday' ? 'upcoming weekend' : 'next week') + " closely.";
        }
      } else {
        response = "I can help you with pricing strategies, revenue simulations, and occupancy analysis. Try asking 'How can I increase revenue?' or 'What are the current risks?'";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center z-50"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PriceWise AI</h3>
                  <p className="text-[10px] opacity-80">Online • Optimization Engine</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.sender === 'user' ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-slate-200 dark:bg-slate-800"
                  )}>
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4 text-emerald-600" /> : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.sender === 'user' 
                      ? "bg-emerald-500 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {['Optimize Pricing', 'Improve Occupancy', 'Risk Analysis'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs rounded-full border border-slate-200 dark:border-slate-700 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none outline-none px-4 py-2 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
