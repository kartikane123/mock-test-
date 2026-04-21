import React, { useEffect, useState } from 'react';
import { Brain, Clock, ChevronRight, Activity, Plus, Zap } from 'lucide-react';
import { getSavedAttempts, getSavedTests } from '../lib/storage';
import { TestAttempt, TestData } from '../types';
import { motion } from 'motion/react';

import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface DashboardProps {
  onStartNewTest: () => void;
  onViewAnalysis: (attempt: TestAttempt, test: TestData) => void;
}

export default function Dashboard({ onStartNewTest, onViewAnalysis }: DashboardProps) {
  const [user] = useAuthState(auth);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [tests, setTests] = useState<Record<string, TestData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [loadedAttempts, loadedTests] = await Promise.all([
          getSavedAttempts(),
          getSavedTests()
        ]);
        
        setAttempts([...loadedAttempts].reverse());
        
        const testMap: Record<string, TestData> = {};
        loadedTests.forEach(t => testMap[t.id] = t);
        setTests(testMap);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Compute stats
  const totalTestsTaken = attempts.length;
  const averageScore = attempts.length > 0
    ? (attempts.reduce((acc, att) => acc + (att.score / att.totalQuestions), 0) / attempts.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-2">My Test Hub</h1>
          <div className="flex items-center gap-2">
            <p className="text-lg text-slate-500">Track and improve your performance over time.</p>
            {user && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50 uppercase font-bold tracking-widest">
                <Zap size={8} className="fill-current" /> Cloud Synced
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onStartNewTest}
          className="inline-flex items-center gap-2 bg-cyan-600 px-6 py-4 rounded-none font-black uppercase tracking-tighter text-slate-900 hover:bg-cyan-500 transition-colors"
        >
          <Plus size={20} />
          Create New Mock Test
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 p-8 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-cyan-950/20 text-cyan-400 border border-cyan-900/50 rounded flex items-center justify-center">
              <Activity size={24} />
            </div>
            <h3 className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Total Tests</h3>
          </div>
          <div className="text-5xl font-light text-white">{totalTestsTaken}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 p-8 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-950/20 text-emerald-400 border border-emerald-900/50 rounded flex items-center justify-center">
              <Brain size={24} />
            </div>
            <h3 className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Average Score</h3>
          </div>
          <div className="text-5xl font-light text-white">{averageScore.toFixed(1)}%</div>
        </motion.div>
      </section>

      <section>
        <h2 className="text-2xl font-light text-white mb-6 tracking-tighter">Recent <span className="font-black italic">Tests</span></h2>
        
        {attempts.length === 0 ? (
          <div className="bg-[#080A0E] p-12 rounded-xl text-center border border-slate-800">
            <div className="mx-auto w-16 h-16 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-center text-slate-500 mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No tests yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">Create your first highly accurate AI mock test to start analyzing your performance.</p>
            <button onClick={onStartNewTest} className="text-cyan-400 font-medium hover:underline">Start now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attempts.map(attempt => {
              const test = tests[attempt.testId];
              if (!test) return null;
              
              const percentage = (attempt.score / attempt.totalQuestions) * 100;
              const completedDate = new Date(attempt.completedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <motion.div
                  key={attempt.id}
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col"
                  onClick={() => onViewAnalysis(attempt, test)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white mb-1">{test.config.subject}</h4>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/50 border border-slate-700 px-2 py-1 rounded inline-block">
                        {test.config.difficulty}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${percentage >= 80 ? 'text-emerald-400' : percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {percentage.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Score</div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">{completedDate}</span>
                    <span className="text-cyan-400 flex items-center font-bold tracking-widest uppercase">
                      Analysis <ChevronRight size={16} className="ml-1" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
