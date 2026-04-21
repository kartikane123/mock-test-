import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TestConfigForm from './components/TestConfigForm';
import TestInterface from './components/TestInterface';
import AnalysisReport from './components/AnalysisReport';
import { TestAttempt, TestConfig, TestData } from './types';
import { generateMockTest } from './lib/gemini';
import { saveAttempt, saveTest } from './lib/storage';

import Navbar from './components/Navbar';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'config' | 'taking_test' | 'analysis'>('dashboard');
  const [activeTest, setActiveTest] = useState<TestData | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);

  const handleStartNewTest = () => {
    setCurrentView('config');
  };

  const handleGenerateTest = async (config: TestConfig) => {
    try {
      const generatedQuestions = await generateMockTest(config);
      
      const newTest: TestData = {
        id: `test_${Date.now()}`,
        config,
        questions: generatedQuestions,
        createdAt: new Date().toISOString()
      };
      
      await saveTest(newTest);
      setActiveTest(newTest);
      setCurrentView('taking_test');
    } catch (error) {
      alert("Failed to generate test. Please try again or adjust your prompt.");
      setCurrentView('dashboard');
    }
  };

  const handleSubmitTest = async (answers: Record<string, number>, timeTakenSeconds: number) => {
    if (!activeTest) return;

    let score = 0;
    activeTest.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });

    const newAttempt: TestAttempt = {
      id: `attempt_${Date.now()}`,
      testId: activeTest.id,
      answers,
      timeTakenSeconds,
      score,
      totalQuestions: activeTest.questions.length,
      completedAt: new Date().toISOString()
    };

    await saveAttempt(newAttempt);
    setActiveAttempt(newAttempt);
    setCurrentView('analysis');
  };

  const handleViewAnalysis = (attempt: TestAttempt, test: TestData) => {
    setActiveTest(test);
    setActiveAttempt(attempt);
    setCurrentView('analysis');
  };

  const handleUpdateAttempt = async (updatedAttempt: TestAttempt) => {
    setActiveAttempt(updatedAttempt);
    await saveAttempt(updatedAttempt);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#e2e8f0] font-sans">
      <Navbar />
      <div className="pt-4">
      {currentView === 'dashboard' && (
        <Dashboard 
          onStartNewTest={handleStartNewTest} 
          onViewAnalysis={handleViewAnalysis} 
        />
      )}
      
      {currentView === 'config' && (
        <TestConfigForm 
          onBack={() => setCurrentView('dashboard')} 
          onGenerate={handleGenerateTest} 
        />
      )}

      {currentView === 'taking_test' && activeTest && (
        <TestInterface 
          test={activeTest} 
          onSubmitTest={handleSubmitTest} 
        />
      )}

      {currentView === 'analysis' && activeTest && activeAttempt && (
        <AnalysisReport 
          test={activeTest} 
          attempt={activeAttempt} 
          onBack={() => setCurrentView('dashboard')}
          onUpdateAttempt={handleUpdateAttempt}
        />
      )}
      </div>
    </div>
  );
}
