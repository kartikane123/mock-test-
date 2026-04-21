import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TestAttempt, TestData } from '../types';
import { generateTestAnalysis } from '../lib/gemini';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Target, TrendingUp, Lightbulb, Zap, Info } from 'lucide-react';
import { saveAttempt } from '../lib/storage';
import MathRenderer from './MathRenderer';

interface AnalysisReportProps {
  test: TestData;
  attempt: TestAttempt;
  onBack: () => void;
  onUpdateAttempt: (attempt: TestAttempt) => void;
}

export default function AnalysisReport({ test, attempt, onBack, onUpdateAttempt }: AnalysisReportProps) {
  const [analyzing, setAnalyzing] = useState(!attempt.analysis);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      if (attempt.analysis) return;
      
      try {
        setAnalyzing(true);
        const analysis = await generateTestAnalysis(test.questions, attempt.answers, test.config.subject);
        const updatedAttempt = { ...attempt, analysis };
        // We'll pass it up to override local storage or just to keep state aligned
        onUpdateAttempt(updatedAttempt);
      } catch (err: any) {
        setError(err.message || 'Failed to generate analysis');
      } finally {
        setAnalyzing(false);
      }
    }

    fetchAnalysis();
  }, [attempt, test, onUpdateAttempt]);

  const percentage = (attempt.score / attempt.totalQuestions) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 space-y-6">
        <svg className="animate-spin h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white tracking-tighter">AI is Analyzing your Performance...</h3>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-bold">Deep dive into your strengths and weaknesses.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center min-h-screen flex flex-col justify-center items-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={onBack} className="text-cyan-400 font-bold uppercase tracking-widest hover:text-white transition-colors">Back to Dashboard</button>
      </div>
    );
  }

  const analysis = attempt.analysis!;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-white uppercase font-bold tracking-widest text-sm transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </button>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Score</div>
          <div className="text-6xl font-light text-white">{percentage.toFixed(0)}<span className="text-3xl text-slate-600">%</span></div>
          <div className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs">{attempt.score} out of {attempt.totalQuestions}</div>
        </div>
        
        <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16}/> Correct</span>
            <span className="text-2xl font-light text-white">{attempt.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><XCircle size={16}/> Incorrect</span>
            <span className="text-2xl font-light text-white">{Object.values(attempt.answers).filter(a => a !== undefined).length - attempt.score}</span>
          </div>
          <div className="flex items-center justify-between opacity-50">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle size={16}/> Unattempted</span>
            <span className="text-2xl font-light text-white">{attempt.totalQuestions - Object.values(attempt.answers).filter(a => a !== undefined).length}</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">Time Taken</div>
          <div className="text-6xl font-light text-white">{formatTime(attempt.timeTakenSeconds)}</div>
          <div className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-xs capitalize">{test.config.difficulty} Mock Test</div>
        </div>
      </div>

      {/* AI Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0D1117] p-8 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded"><TrendingUp size={24}/></div>
            <h3 className="text-lg font-light tracking-tighter text-white">Strong <span className="font-black italic">Areas</span></h3>
          </div>
          <ul className="space-y-4">
            {analysis.strongAreas.map((area, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="font-light">{area}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0D1117] p-8 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded"><Target size={24}/></div>
            <h3 className="text-lg font-light tracking-tighter text-white">Weak <span className="font-black italic">Areas to Review</span></h3>
          </div>
          <ul className="space-y-4">
            {analysis.weakAreas.map((area, i) => (
              <li key={i} className="flex gap-3 text-slate-300">
                <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-light">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-cyan-950/20 p-8 rounded-xl border border-cyan-900/50">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Actionable Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {analysis.actionableTips.map((tip, i) => (
              <div key={i} className="bg-[#0A0C10]/80 p-6 rounded border border-cyan-900/30">
                <div className="text-cyan-600 font-mono text-sm mb-2">[{String(i+1).padStart(2, '0')}]</div>
                <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
      </div>

      <div className="bg-[#0D1117] p-8 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">Detailed AI Breakdown</h3>
        <MathRenderer content={analysis.detailedFeedback} className="font-light prose prose-invert max-w-none" />
      </div>

      {/* Answer Key */}
      <div className="pt-8 space-y-6">
        <h3 className="text-2xl font-light text-white tracking-tighter mb-8">Test Answer <span className="font-black italic">Key</span></h3>
        {test.questions.map((q, idx) => {
          const userAns = attempt.answers[q.id];
          const isCorrect = userAns === q.correctOptionIndex;
          
          return (
            <div key={q.id} className={`p-6 md:p-8 rounded-xl border flex flex-col ${isCorrect ? 'bg-slate-900/50 border-emerald-500/30' : 'bg-slate-900/50 border-rose-500/30'}`}>
              <div className="flex gap-4 mb-4">
                <div className={`flex-shrink-0 mt-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCorrect ? <CheckCircle2 size={24}/> : <XCircle size={24}/>}
                </div>
                <div>
                  <h4 className="font-light text-white text-lg mb-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span>{idx + 1}. <MathRenderer content={q.questionText} className="inline-block" /></span>
                    </div>
                    {q.source && (
                      <span className="text-[10px] text-slate-500 font-mono italic opacity-70">
                        Source: {q.source}
                      </span>
                    )}
                  </h4>
                  
                  <div className="space-y-3 mb-6">
                    {q.options.map((opt, oIdx) => {
                      let activeClass = "bg-[#0A0C10] border-slate-800 text-slate-400";
                      let letterClass = "bg-slate-800 text-slate-300";
                      if (oIdx === q.correctOptionIndex) {
                        activeClass = "bg-emerald-950/20 border-emerald-500/30 text-emerald-400";
                        letterClass = "bg-emerald-500 text-slate-900 font-bold";
                      } else if (oIdx === userAns) {
                        activeClass = "bg-rose-950/20 border-rose-500/30 text-rose-400";
                        letterClass = "bg-rose-500 text-slate-900 font-bold";
                      }
                      return (
                        <div key={oIdx} className={`p-4 rounded border ${activeClass} flex items-start gap-3`}>
                          <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-xs ${letterClass}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <MathRenderer content={opt} className="font-light" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-cyan-950/10 rounded-xl p-6 border border-cyan-900/30">
                    <h5 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-2">
                       <Zap size={16}/> Explanation
                    </h5>
                    <MathRenderer content={q.explanation} className="text-slate-400 leading-relaxed font-light text-sm" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
