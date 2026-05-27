import React from 'react';
import { motion } from 'framer-motion';
import { Search, Link as LinkIcon, FileText, Sparkles, Loader2, Info, ArrowRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
      title: "AI Analysis",
      desc: "Deep neural networks evaluate linguistic patterns and semantic context."
    },
    {
      icon: <Search className="w-6 h-6 text-blue-400" />,
      title: "Fact Checking",
      desc: "Cross-references claims with 50+ trusted global news sources in real-time."
    },
    {
      icon: <Info className="w-6 h-6 text-purple-400" />,
      title: "Bias Detection",
      desc: "Identifies political leanings and emotional manipulation tactics."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl">
      {features.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          className="glass-card p-8 group hover:border-indigo-500/30"
        >
          <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {f.icon}
          </div>
          <h3 className="text-xl font-bold mb-3">{f.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default Features;
