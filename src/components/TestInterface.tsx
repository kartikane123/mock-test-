import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { Question, TestData } from '../types';
import MathRenderer from './MathRenderer';

interface TestInterfaceProps {
  test: TestData;
  onSubmitTest: (answers: Record<string, number>, timeTakenSeconds: number) => void;
}

export default function TestInterface({ test, onSubmitTest }: TestInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeTaken, setTimeTaken] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTaken(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = test.questions[currentIdx];
  const isLast = currentIdx === test.questions.length - 1;
  const isFirst = currentIdx === 0;

  const handleOptionSelect = (optionIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIdx
    }));
  };

  const handleNext = () => {
    if (!isLast) setCurrentIdx(i => i + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentIdx(i => i - 1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIdx + 1) / test.questions.length) * 100;
  const attemptedCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="flex items-center justify-between mb-8 bg-[#0D1117] p-4 rounded-xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-950/20 text-cyan-400 border border-cyan-900/50 px-3 py-1.5 rounded text-sm font-medium">
            {test.config.subject}
          </div>
          <span className="text-slate-400 text-sm font-mono">{attemptedCount} / {test.questions.length} Attempted</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xl bg-slate-900 border border-slate-800 px-4 py-2 rounded">
          <Clock size={20} />
          {formatTime(timeTaken)}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-cyan-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0D1117] rounded-xl p-8 md:p-12 border border-slate-800"
          >
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Question {currentIdx + 1} of {test.questions.length}</span>
              {currentQuestion.source && (
                <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <Info size={12} /> Source: {currentQuestion.source}
                </span>
              )}
            </h3>
            <MathRenderer 
              content={currentQuestion.questionText} 
              className="text-2xl text-white leading-relaxed font-light mb-10"
            />

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-6 rounded-xl border transition-all flex items-start gap-4 ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-sm' 
                        : 'border-slate-800 bg-[#0A0C10] hover:border-cyan-500/50 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      isSelected ? 'border-cyan-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
                    </div>
                    <MathRenderer 
                      content={option} 
                      className={`text-lg ${isSelected ? 'text-cyan-400 font-medium' : 'text-slate-300'}`}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-8 flex items-center justify-between bg-[#0D1117] p-4 border border-slate-800">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="flex items-center px-6 py-3 font-black tracking-tighter uppercase text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>

        {!isLast ? (
          <button
            onClick={handleNext}
            className="flex items-center px-8 py-3 font-black tracking-tighter uppercase text-slate-900 bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            Next
            <ChevronRight size={20} className="ml-2" />
          </button>
        ) : (
          <button
            onClick={() => onSubmitTest(answers, timeTaken)}
            className="flex items-center px-8 py-3 font-black tracking-tighter uppercase text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition-colors"
          >
            Submit Test
            <CheckCircle2 size={20} className="ml-2" />
          </button>
        )}
      </footer>
    </div>
  );
}
