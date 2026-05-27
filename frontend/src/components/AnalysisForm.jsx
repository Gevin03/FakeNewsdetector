import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, FileText, Sparkles, Loader2 } from 'lucide-react';

const AnalysisForm = ({ onAnalyze, isLoading, loadingStep, steps, initialText, initialUrl }) => {
  const [textValue, setTextValue] = useState(initialText || '');
  const [urlValue, setUrlValue] = useState(initialUrl || '');

  useEffect(() => {
    if (initialText !== undefined) setTextValue(initialText);
    if (initialUrl !== undefined) setUrlValue(initialUrl);
  }, [initialText, initialUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasText = textValue.trim().length > 0;
    const hasUrl = urlValue.trim().length > 0;
    if (!hasText && !hasUrl) return;
    onAnalyze(textValue.trim(), urlValue.trim());
  };

  const hasAnyInput = textValue.trim().length > 0 || urlValue.trim().length > 0;
  const hasBoth = textValue.trim().length > 0 && urlValue.trim().length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="glass-card mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dual Input Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paste Text Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-indigo-400" />
                Paste Text
              </div>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Paste news content here for AI verification..."
                className="w-full h-44 bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-sm"
              />
              {textValue.trim() && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 text-[10px] text-green-400/70 font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Text ready for analysis
                </motion.div>
              )}
            </div>

            {/* URL Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <LinkIcon className="w-4 h-4 text-purple-400" />
                Article URL
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com/news-article"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-12 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                />
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              {urlValue.trim() && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 text-[10px] text-purple-400/70 font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                  URL ready for analysis
                </motion.div>
              )}
            </div>
          </div>

          {/* Divider with info */}
          {hasBoth && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Dual Analysis Mode</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !hasAnyInput}
            className="btn-primary w-full flex flex-col items-center justify-center gap-2 py-4"
          >
            {isLoading ? (
              <>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing{hasBoth ? ' both analyses' : ''}...</span>
                </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={loadingStep}
                  className="text-xs text-indigo-200 font-normal mt-1"
                >
                  {steps[loadingStep]}
                </motion.span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>{hasBoth ? 'Analyze Both' : 'Analyze Veracity'}</span>
              </div>
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Deep Veracity Engine
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          Political Bias Analysis
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Real-time Fact Checking
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisForm;
