import React from 'react';
import { Shield, Info, Globe, Clock } from 'lucide-react';

const Navbar = ({ onToggleHistory }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-4 md:px-6 py-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Shield className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
          <span className="text-lg md:text-xl font-bold gradient-text">TruthGuard AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#" className="hover:text-white transition-colors">Analyzer</a>
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onToggleHistory}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
            title="View Recent Scans"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button className="hidden xs:flex p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
            <Globe className="w-5 h-5" />
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors whitespace-nowrap">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
