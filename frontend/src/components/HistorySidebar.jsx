import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, AlertTriangle, ShieldCheck, HelpCircle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://fakenewsdetector-3-hvog.onrender.com';

const HistorySidebar = ({ isOpen, onClose, onSelectHistoryItem }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistoryItems(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Could not retrieve analysis history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const deleteHistoryItem = async (itemId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE_URL}/history/${itemId}`);
        fetchHistory();
      } catch (err) {
        console.error('Error deleting history item:', err);
        alert('Failed to delete history item');
      }
    }
  };

  const deleteAllHistory = async () => {
    if (window.confirm('Are you sure you want to delete ALL history? This cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/history`);
        fetchHistory();
      } catch (err) {
        console.error('Error clearing history:', err);
        alert('Failed to clear history');
      }
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getVerdictStyle = (verdict) => {
    const v = verdict ? verdict.toLowerCase() : '';
    if (v.includes('confirmed true') || v.includes('likely true')) {
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    }
    if (v.includes('confirmed fake') || v.includes('likely fake')) {
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    }
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  const getScoreColorClass = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-slate-900/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Scans</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchHistory}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {historyItems.length > 0 && (
              <button 
                onClick={deleteAllHistory}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Delete All History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-400 text-sm">Loading historical scans...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && historyItems.length === 0 && (
            <div className="text-center py-20">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4 stroke-1" />
              <p className="text-slate-400 font-medium">No previous scans found</p>
              <p className="text-slate-600 text-xs mt-1">Scan some news content to populate your history dashboard.</p>
            </div>
          )}

          {!isLoading && !error && historyItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                onSelectHistoryItem(item);
                onClose();
              }}
              className="group p-5 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/25 transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col gap-3 relative"
            >
              {/* Top Row: Verdict Tag & Timestamp */}
              <div className="flex justify-between items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getVerdictStyle(item.verdict)}`}>
                  {item.verdict}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(item.timestamp)}
                </span>
              </div>

              {/* Title / Content */}
              <div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                  {item.title || 'Untitled Text Analysis'}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.content}
                </p>
              </div>

              {/* Footer: Score & Bias Leaning */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span>Score:</span>
                  <span className={`text-xs font-black ${getScoreColorClass(item.realness_score)}`}>
                    {Math.round(item.realness_score)}%
                  </span>
                </div>
                {item.bias_label && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Bias:</span>
                    <span className="text-indigo-400">{item.bias_label}</span>
                  </div>
                )}
              </div>

              {/* External Link indicator if URL scan */}
              {item.url && (
                <div className="absolute right-4 bottom-14 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => deleteHistoryItem(item.id, e)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete this item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default HistorySidebar;
