import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, MessageSquare, ExternalLink, RefreshCcw, Edit3, HelpCircle, FileText, Link as LinkIcon, BookOpen } from 'lucide-react';
import VeracityGauge from './VeracityGauge';
import BiasMeter from './BiasMeter';

// Single result panel — renders one analysis result
const SingleResultPanel = ({ data, label, accentColor }) => {
  if (!data) return null;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} className="space-y-6">
      {/* Label Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${accentColor}`}>
        {label === 'Text Analysis' ? <FileText className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
        {label}
      </div>

      {/* Title if URL scan */}
      {data.title && (
        <h3 className="text-lg font-semibold text-white -mt-2 line-clamp-2">{data.title}</h3>
      )}

      {/* Veracity Gauge */}
      <VeracityGauge 
        score={data.prediction?.realness_score || 0} 
        label={data.prediction?.verdict || 'Unknown'} 
      />

      {/* Data Mining Perspectives */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Data Mining Perspectives</h3>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Calculated based on the research paper's multi-factor model construction.
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
            <div className="text-2xl font-black text-indigo-400">{data.prediction?.factors?.knowledge_consistency}%</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Knowledge</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
            <div className="text-2xl font-black text-purple-400">{data.prediction?.factors?.style_objectivity}%</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">Style</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
            <div className="text-2xl font-black text-cyan-400">{data.prediction?.factors?.ml_confidence}%</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">ML Conf.</div>
          </div>
        </div>
      </div>
      
      {/* Bias Meter */}
      <BiasMeter bias={data.bias} />

      {/* Claims */}
      {data.claims_breakdown?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            Key Claims
          </div>
          {data.claims_breakdown?.map((claim, idx) => (
            <div key={idx} className="glass-card p-4 flex gap-3 items-start">
              {claim.verdict?.toLowerCase().includes('real') ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : claim.verdict?.toLowerCase().includes('neutral') || claim.verdict?.toLowerCase().includes('unverified') ? (
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="text-slate-200 text-xs font-medium mb-1">{claim.claim}</p>
                <p className="text-slate-500 text-[10px]">{claim.reasoning || 'Verified against available news sources.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live News */}
      {data.live_news?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Live Context
          </div>
          {data.live_news?.slice(0, 3).map((news, idx) => (
            <a 
              key={idx} 
              href={news.url} 
              target="_blank" 
              rel="noreferrer"
              className="glass-card p-3 block hover:bg-white/10 transition-colors group"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-slate-200 text-xs font-medium line-clamp-2">{news.title}</p>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
              </div>
              <p className="text-slate-500 text-[10px] mt-1">{news.source || 'Live News Source'}</p>
            </a>
          ))}
        </div>
      )}

      {/* Reddit */}
      {data.reddit_discussions?.length > 0 && (
        <div className="space-y-3">
          {data.reddit_discussions.slice(0, 2).map((post, idx) => (
            <div key={idx} className="glass-card p-3 border-l-4 border-orange-500/50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-1">
                <MessageSquare className="w-3 h-3" />
                Reddit
              </div>
              <p className="text-slate-200 text-xs">{post.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Wikipedia */}
      {data.wikipedia_references?.length > 0 && (
        <div className="space-y-3">
          {data.wikipedia_references.slice(0, 2).map((ref, idx) => (
            <a 
              key={idx} 
              href={ref.url} 
              target="_blank" 
              rel="noreferrer"
              className="glass-card p-3 block hover:bg-white/10 transition-colors group border-l-4 border-indigo-500/50"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase mb-1">
                <BookOpen className="w-3 h-3" />
                Wikipedia Context
              </div>
              <div className="flex justify-between items-start gap-2">
                <p className="text-slate-200 text-xs font-semibold">{ref.title}</p>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
              </div>
              <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">{ref.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};


const ResultsDashboard = ({ data, onReset, onEdit }) => {
  if (!data) return null;

  // Determine if it's dual mode
  const isDual = data.textResult || data.urlResult;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto w-full space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          {isDual ? 'Dual Analysis Results' : 'Analysis Results'}
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit News
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      {isDual ? (
        /* ========== DUAL RESULTS: Side by side ========== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.textResult && (
            <SingleResultPanel 
              data={data.textResult} 
              label="Text Analysis" 
              accentColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
            />
          )}
          {data.urlResult && (
            <SingleResultPanel 
              data={data.urlResult} 
              label="URL Analysis" 
              accentColor="bg-purple-500/10 text-purple-400 border-purple-500/30"
            />
          )}
        </div>
      ) : (
        /* ========== SINGLE RESULT: Original full-width layout ========== */
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item} className="md:col-span-1">
              <VeracityGauge 
                score={data.prediction?.realness_score || 0} 
                label={data.prediction?.verdict || 'Unknown'} 
              />
            </motion.div>
            
            <motion.div variants={item} className="md:col-span-2 space-y-6">
              <div className="glass-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Data Mining Perspectives</h3>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                      Calculated based on the research paper's multi-factor model construction.
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="text-3xl font-black text-indigo-400">{data.prediction?.factors?.knowledge_consistency}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-tighter">Knowledge-Based</div>
                    <div className="text-[9px] text-slate-600 mt-1 text-center">Live News Consistency</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="text-3xl font-black text-purple-400">{data.prediction?.factors?.style_objectivity}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-tighter">Style-Based</div>
                    <div className="text-[9px] text-slate-600 mt-1 text-center">Objectivity & Tone</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="text-3xl font-black text-cyan-400">{data.prediction?.factors?.ml_confidence}%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-tighter">Social Context</div>
                    <div className="text-[9px] text-slate-600 mt-1 text-center">Structural AI Confidence</div>
                  </div>
                </div>
              </div>
              
              <BiasMeter bias={data.bias} />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                Key Claims Breakdown
              </div>
              <div className="space-y-3">
                {data.claims_breakdown?.map((claim, idx) => (
                  <div key={idx} className="glass-card p-4 flex gap-4 items-start">
                    {claim.verdict?.toLowerCase().includes('real') ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : claim.verdict?.toLowerCase().includes('neutral') || claim.verdict?.toLowerCase().includes('unverified') ? (
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-slate-200 text-sm font-medium mb-1">{claim.claim}</p>
                      <p className="text-slate-500 text-xs">{claim.reasoning || 'Verified against available news sources.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-white mb-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Social & Live Context
              </div>
              <div className="space-y-3">
                {data.live_news?.slice(0, 3).map((news, idx) => (
                  <a 
                    key={idx} 
                    href={news.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="glass-card p-4 block hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-slate-200 text-sm font-medium line-clamp-2">{news.title}</p>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-slate-500 text-xs mt-2">{news.source || 'Live News Source'}</p>
                  </a>
                ))}
                
                {data.reddit_discussions?.slice(0, 2).map((post, idx) => (
                  <div key={idx} className="glass-card p-4 border-l-4 border-orange-500/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-2">
                      <MessageSquare className="w-3 h-3" />
                      Reddit Discussion
                    </div>
                    <p className="text-slate-200 text-sm">{post.title}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>{post.ups || 0} upvotes</span>
                      <span>{post.num_comments || 0} comments</span>
                    </div>
                  </div>
                ))}
                
                {data.wikipedia_references?.slice(0, 2).map((ref, idx) => (
                  <a 
                    key={idx} 
                    href={ref.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="glass-card p-4 block hover:bg-white/10 transition-colors group border-l-4 border-indigo-500/50"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase mb-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      Wikipedia Context
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-slate-200 text-sm font-semibold">{ref.title}</p>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{ref.snippet}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ResultsDashboard;
