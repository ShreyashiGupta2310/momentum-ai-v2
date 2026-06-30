export type PriorityLevel = "High" | "Medium" | "Low";

export interface SubTaskStep {
  id: string;
  text: string;
  minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  deadline: string; // YYYY-MM-DD
  durationHours: number;
  progress: number; // 0 to 100
  completed: boolean;
  category: string;
  steps?: SubTaskStep[];
  difficulty?: "Easy" | "Medium" | "Hard";
  riskLevel?: string;
  suggestedSchedule?: string;
  aiPriority?: PriorityLevel;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  focusHours: number;
  completedTasks: number;
  momentumScore: number;
  streakDays: number;
}
