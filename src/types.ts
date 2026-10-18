export interface GivenItem {
  label: string;
  value: string;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  math?: string;
}

export interface PracticeProblem {
  problem: string;
  hint: string;
  answer: string;
}

export interface TaskSolution {
  id: string;
  timestamp: number;
  subject: string;
  topic: string;
  difficulty: 'Начальный' | 'Базовый' | 'Повышенный' | 'Олимпиадный' | string;
  recognizedTaskText: string;
  shortAnswer: string;
  confidence: 'high' | 'medium' | 'low';
  keyFormulas?: string[];
  given?: GivenItem[];
  toFind?: string;
  steps: SolutionStep[];
  pitfallsAndTips?: string;
  checkVerification?: string;
  similarPracticeProblem?: PracticeProblem;
  imagePreview?: string;
  userPrompt?: string;
  mode?: 'step_by_step' | 'quick_answer' | 'hint_only' | 'practice';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export type SolvingMode = 'step_by_step' | 'quick_answer' | 'hint_only' | 'practice';

export interface PresetDemo {
  id: string;
  title: string;
  subject: string;
  topic: string;
  previewImage: string;
  description: string;
  badge: string;
}
