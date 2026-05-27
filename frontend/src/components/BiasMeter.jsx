import React from 'react';
import { motion } from 'framer-motion';

const BiasMeter = ({ bias }) => {
  // Handle both string (old) and object (new) formats for robustness
  const topLabel = typeof bias === 'string' ? bias : bias?.top_label || 'Neutral';
  const breakdown = bias?.breakdown || {
    "Left Leaning": topLabel.includes('Left') ? 70 : 15,
    "Center / Neutral": topLabel.includes('Center') ? 70 : 15,
    "Right Leaning": topLabel.includes('Right') ? 70 : 15
  };

  const getBiasValue = (label) => {
    if (label.includes('Left')) return 20;
    if (label.includes('Right')) return 80;
    return 50;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Political Bias Breakdown</h3>
        <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase">
          {topLabel}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Left Leaning Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
            <span className="text-blue-400">Left Leaning</span>
            <span className="text-slate-300">{breakdown["Left Leaning"]}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${breakdown["Left Leaning"]}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            />
          </div>
        </div>

        {/* Center Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
            <span className="text-slate-400">Center / Neutral</span>
            <span className="text-slate-300">{breakdown["Center / Neutral"]}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${breakdown["Center / Neutral"]}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.3)]"
            />
          </div>
        </div>

        {/* Right Leaning Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
            <span className="text-red-400">Right Leaning</span>
            <span className="text-slate-300">{breakdown["Right Leaning"]}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${breakdown["Right Leaning"]}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            />
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-[9px] text-slate-500 leading-relaxed italic">
        Analysis determines the linguistic alignment with political discourse patterns. 
        Higher percentages indicate stronger correlation with that specific leaning.
      </p>
    </div>
  );
};

export default BiasMeter;
