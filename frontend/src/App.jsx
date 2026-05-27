import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import Navbar from './components/Navbar';
import AnalysisForm from './components/AnalysisForm';
import ResultsDashboard from './components/ResultsDashboard';
import Features from './components/Features';
import HistorySidebar from './components/HistorySidebar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastText, setLastText] = useState('');
  const [lastUrl, setLastUrl] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSelectHistoryItem = (item) => {
    setResult({
      success: true,
      title: item.title || 'Untitled Text Analysis',
      isHistoryReport: true,
      prediction: {
        label: item.verdict.includes('TRUE') ? 'TRUE' : 'FAKE',
        score: item.realness_score / 100,
        realness_score: item.realness_score,
        verdict: item.verdict,
        factors: {
          style_objectivity: Math.round(item.realness_score * 0.92),
          knowledge_consistency: Math.min(100, Math.round(item.realness_score * 1.05)),
          ml_confidence: Math.round(item.realness_score)
        }
      },
      bias: {
        top_label: item.bias_label || 'Center / Neutral',
        breakdown: {
          "Left Leaning": item.bias_label?.includes('Left') ? 70 : 15,
          "Center / Neutral": item.bias_label?.includes('Center') || item.bias_label?.includes('Neutral') ? 70 : 15,
          "Right Leaning": item.bias_label?.includes('Right') ? 70 : 15
        }
      },
      live_news: [],
      claims_breakdown: [
        {
          claim: item.content?.length > 120 ? item.content.slice(0, 120) + "..." : item.content,
          verdict: item.verdict.includes('TRUE') ? 'Likely Real' : 'Likely Fake',
          reasoning: 'Archived history record from database.'
        }
      ],
      reddit_discussions: [],
      wikipedia_references: []
    });
  };

  const steps = [
    "Initializing neural engine...",
    "Extracting key claims from article...",
    "Searching live news databases...",
    "Analyzing political bias patterns...",
    "Cross-referencing social discussions...",
    "Finalizing veracity report..."
  ];

  const handleAnalyze = async (textValue, urlValue) => {
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);
    setLastText(textValue);
    setLastUrl(urlValue);

    const hasText = textValue.length > 0;
    const hasUrl = urlValue.length > 0;

    // Simulated progress for better UX
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      // Build parallel requests
      const requests = [];
      if (hasText) {
        requests.push(
          axios.post(`${API_BASE_URL}/analyze-text`, { text: textValue })
            .then(res => ({ type: 'text', data: res.data }))
            .catch(err => ({ type: 'text', error: err.message }))
        );
      }
      if (hasUrl) {
        requests.push(
          axios.post(`${API_BASE_URL}/analyze-url`, { url: urlValue })
            .then(res => ({ type: 'url', data: res.data }))
            .catch(err => ({ type: 'url', error: err.message }))
        );
      }

      // Run all in parallel
      const responses = await Promise.all(requests);

      // If both were submitted, build dual result
      if (hasText && hasUrl) {
        const textRes = responses.find(r => r.type === 'text');
        const urlRes = responses.find(r => r.type === 'url');

        const errors = [];
        if (textRes?.error || textRes?.data?.success === false) {
          errors.push(`Text: ${textRes?.error || textRes?.data?.error}`);
        }
        if (urlRes?.error || urlRes?.data?.success === false) {
          errors.push(`URL: ${urlRes?.error || urlRes?.data?.error}`);
        }

        if (errors.length === 2) {
          // Both failed
          setError(errors.join(' | '));
        } else {
          setResult({
            isDual: true,
            textResult: textRes?.data?.success !== false ? textRes?.data : null,
            urlResult: urlRes?.data?.success !== false ? urlRes?.data : null,
            partialError: errors.length === 1 ? errors[0] : null
          });
        }
      } else {
        // Single analysis
        const res = responses[0];
        if (res.error) {
          setError(res.error);
        } else if (res.data.success === false) {
          setError(res.data.error || 'An internal error occurred during analysis.');
        } else {
          setResult(res.data);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to connect to the AI engine. Please ensure the backend is running.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLastText('');
    setLastUrl('');
  };

  const handleEdit = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-50 selection:bg-indigo-500/30">
      <Background />
      <Navbar onToggleHistory={() => setIsHistoryOpen(prev => !prev)} />

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      <main className="relative z-10 pt-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.section 
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-1.5 mb-6 glass rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-400"
                >
                  Neural Verification Hub
                </motion.div>
                
                <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                  SEE BEYOND <br />
                  <span className="gradient-text">THE DECEPTION.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
                  TruthGuard AI uses state-of-the-art transformers to distinguish between 
                  credible journalism and malicious misinformation.
                </p>

                <div className="w-full max-w-4xl">
                  <AnalysisForm 
                    onAnalyze={handleAnalyze} 
                    isLoading={isLoading} 
                    loadingStep={loadingStep}
                    steps={steps}
                    initialText={lastText}
                    initialUrl={lastUrl}
                  />
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 glass border-red-500/20 bg-red-500/5 text-red-400 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Features />
              </motion.section>
            ) : (
              <>
                {/* Show partial error banner if one of two analyses failed */}
                {result.partialError && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-7xl mb-4 p-4 glass border-yellow-500/20 bg-yellow-500/5 text-yellow-400 rounded-xl text-sm"
                  >
                    ⚠️ Partial result: {result.partialError}
                  </motion.div>
                )}
                <ResultsDashboard 
                  key="results"
                  data={result} 
                  onReset={handleReset} 
                  onEdit={handleEdit}
                />
              </>
            )}
          </AnimatePresence>

        </div>
      </main>

      <footer className="relative z-10 py-12 px-6 mt-20 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <span className="text-lg font-bold gradient-text">TruthGuard AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 TruthGuard AI. All rights reserved. Built for a more informed world.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
