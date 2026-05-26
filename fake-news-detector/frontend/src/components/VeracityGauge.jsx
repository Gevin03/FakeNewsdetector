import React from 'react';
import { motion } from 'framer-motion';

const VeracityGauge = ({ score, label }) => {
  const getColor = (s) => {
    if (s >= 70) return '#22c55e'; // Green
    if (s >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card overflow-hidden relative">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
          />
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold text-white"
          >
            {Math.round(score)}%
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Veracity Score</span>
        </div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-2 ${
          score >= 70 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          score >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {label}
        </div>
      </motion.div>
    </div>
  );
};

export default VeracityGauge;
