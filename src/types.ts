export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  source?: string;
}

export interface TestConfig {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  numQuestions: number;
}

export interface TestData {
  id: string;
  config: TestConfig;
  questions: Question[];
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  timeTakenSeconds: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  analysis?: TestAnalysis;
}

export interface TestAnalysis {
  strongAreas: string[];
  weakAreas: string[];
  actionableTips: string[];
  detailedFeedback: string;
}
