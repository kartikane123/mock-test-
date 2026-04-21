import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { TestConfig } from '../types';

interface TestConfigFormProps {
  onBack: () => void;
  onGenerate: (config: TestConfig) => void;
}

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;

export default function TestConfigForm({ onBack, onGenerate }: TestConfigFormProps) {
  const [subject, setSubject] = useState('');
  const [chaptersInput, setChaptersInput] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !chaptersInput.trim()) return;

    setIsGenerating(true);
    
    // We pass it up to App.tsx to do the generation so we can manage loading state broadly if needed, 
    // or we can just send the config. Let's send the config.
    const chapters = chaptersInput.split(',').map(c => c.trim()).filter(Boolean);
    
    await onGenerate({
      subject,
      chapters,
      difficulty,
      numQuestions
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-white transition-colors mb-8"
        disabled={isGenerating}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 rounded-xl p-8 md:p-12 border border-slate-800"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-cyan-950/20 text-cyan-400 border border-cyan-900/50 rounded flex items-center justify-center">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-light text-white tracking-tighter">Configure <span className="font-black italic">Test</span></h2>
            <p className="text-slate-400 mt-1">Specify parameters for your AI mock test</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subject / Topic</label>
            <input 
              type="text" 
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Physics, Data Structures, Marketing..."
              className="w-full px-5 py-4 bg-[#0D1117] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white transition-all text-lg placeholder:text-slate-600"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Chapters (comma separated)</label>
            <textarea 
              required
              value={chaptersInput}
              onChange={e => setChaptersInput(e.target.value)}
              placeholder="e.g. Kinematics, Laws of Motion, Work Energy Power"
              className="w-full px-5 py-4 bg-[#0D1117] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white transition-all text-lg resize-none h-32 placeholder:text-slate-600"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Difficulty</label>
              <div className="grid grid-cols-2 gap-3">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    disabled={isGenerating}
                    className={`py-3 px-4 rounded capitalize font-medium transition-all ${
                      difficulty === diff 
                        ? 'bg-cyan-600 text-slate-900' 
                        : 'bg-[#0D1117] text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Number of Questions: <span className="text-cyan-400">{numQuestions}</span></label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="5"
                value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full mt-4 accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>5 (Quick)</span>
                <span>30 (Full Test)</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-5 rounded-none bg-cyan-600 text-slate-900 uppercase font-black tracking-tighter text-lg hover:bg-cyan-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Extremely Accurate Test...
                </>
              ) : (
                'Generate Mock Test'
              )}
            </button>
            <p className="text-center text-sm text-slate-400 mt-4">This uses advanced reasoning models and may take up to 30 seconds.</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
