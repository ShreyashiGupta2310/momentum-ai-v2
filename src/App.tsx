import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Brain, 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  User, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Compass, 
  Activity,
  Award,
  Play,
  RotateCcw,
  Volume2,
  TrendingUp,
  Sliders,
  Sparkle,
  Hourglass,
  ArrowRight,
  ShieldCheck,
  ZapOff,
  ShieldAlert,
  BarChart2,
  Home,
  ClipboardList,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, SubTaskStep, Insight, Message, DashboardStats, PriorityLevel } from "./types";

// Initial set of robust real-world tasks for immediate high-fidelity rendering
const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Refactor UI Core Layout",
    description: "Upgrade key layout views to support responsive CSS grids and leverage Tailwind v4 container optimizations.",
    priority: "High",
    deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    durationHours: 3.5,
    progress: 50,
    completed: false,
    category: "Work",
    difficulty: "Medium",
    riskLevel: "Elevated",
    suggestedSchedule: "Execute tomorrow morning in your 9:00 AM high-energy focus block.",
    steps: [
      { id: "s1", text: "Audit container layout and identify nested flexbox bottlenecks", minutes: 30, difficulty: "Medium", completed: true },
      { id: "s2", text: "Implement CSS Grid layout wrapper with fluid breakpoints", minutes: 90, difficulty: "Hard", completed: true },
      { id: "s3", text: "Verify responsiveness against layout benchmarks", minutes: 60, difficulty: "Medium", completed: false },
      { id: "s4", text: "Refactor sidebar toggles and mobile drawer hooks", minutes: 30, difficulty: "Easy", completed: false }
    ]
  },
  {
    id: "task-2",
    title: "Prepare AI Pitch Deck",
    description: "Synthesize momentum and cognitive assistance features into a clean 10-slide visual narrative.",
    priority: "High",
    deadline: new Date(Date.now() + 259200000).toISOString().split("T")[0], // 3 days from now
    durationHours: 5.0,
    progress: 25,
    completed: false,
    category: "Project",
    difficulty: "Hard",
    riskLevel: "Elevated",
    suggestedSchedule: "Break into 2 separate sessions: draft slides on Tuesday morning and finalize templates on Wednesday afternoon.",
    steps: [
      { id: "s5", text: "Draft executive summary and value proposition statements", minutes: 45, difficulty: "Easy", completed: true },
      { id: "s6", text: "Design slide templates and layout typography palette", minutes: 90, difficulty: "Medium", completed: false },
      { id: "s7", text: "Outline user growth metrics and AI-driven acceleration proof points", minutes: 120, difficulty: "Hard", completed: false }
    ]
  },
  {
    id: "task-3",
    title: "Integrate Google GenAI SDK",
    description: "Connect standard Gemini endpoints using the server-side `@google/genai` TypeScript SDK.",
    priority: "Medium",
    deadline: new Date(Date.now() + 432000000).toISOString().split("T")[0], // 5 days from now
    durationHours: 2.0,
    progress: 100,
    completed: true,
    category: "Learn",
    difficulty: "Medium",
    riskLevel: "Low",
    suggestedSchedule: "Completed. Past action-block was executed successfully."
  },
  {
    id: "task-4",
    title: "Schedule Performance Review",
    description: "Synthesize monthly focus stats and plan the upcoming sprint goals.",
    priority: "Low",
    deadline: new Date(Date.now() + 604800000).toISOString().split("T")[0], // 7 days from now
    durationHours: 1.5,
    progress: 0,
    completed: false,
    category: "Personal",
    difficulty: "Easy",
    riskLevel: "Low",
    suggestedSchedule: "Schedule as a low-cognitive wind-down activity on Friday afternoon around 4:00 PM."
  }
];

const INITIAL_INSIGHTS: Insight[] = [
  { id: "ins-1", title: "Apply Time-Boxing Pattern", description: "Allocate a strict 45-minute sprint to 'Refactor UI Core Layout' to bypass early execution friction.", category: "Strategy" },
  { id: "ins-2", title: "Mitigate Impending Deadline Risk", description: "You have 2 high-priority tasks due within 72 hours. Defer low-priority items and focus exclusively on core deliverables.", category: "Prioritization" },
  { id: "ins-3", title: "Practice Cognitive Decompression", description: "To sustain intellectual endurance, complete a 2-minute box breathing session before jumping into deep work.", category: "Health" }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "coach" | "sparks" | "planner" | "progress" | "settings">("dashboard");

  // Core App States
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("momentum_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [stats, setStats] = useState<DashboardStats>(() => {
    const saved = localStorage.getItem("momentum_stats");
    return saved ? JSON.parse(saved) : { focusHours: 4.5, completedTasks: 8, momentumScore: 82, streakDays: 5 };
  });

  const [insights, setInsights] = useState<Insight[]>(() => {
    const saved = localStorage.getItem("momentum_insights");
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  const [focusAdvice, setFocusAdvice] = useState<string>(() => {
    return localStorage.getItem("momentum_focus_advice") || "Your upcoming workload is structured. Excellent time to engage in high-impact intellectual sprint sessions.";
  });

  // Form validation, Toast messages, and success animation states
  const [plannerValError, setPlannerValError] = useState<{
    goal?: string;
    deadline?: string;
    hoursPerDay?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Settings tab preferences states
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("setting_sound_enabled");
    return saved ? saved === "true" : true;
  });
  const [gCalSync, setGCalSync] = useState(() => {
    return localStorage.getItem("setting_gcal_sync") === "true";
  });
  const [gTasksSync, setGTasksSync] = useState(() => {
    return localStorage.getItem("setting_gtasks_sync") === "true";
  });
  const [gDriveBackup, setGDriveBackup] = useState(() => {
    return localStorage.getItem("setting_gdrive_backup") === "true";
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem("setting_selected_model") || "gemini-2.5-flash";
  });
  const [planningStrategy, setPlanningStrategy] = useState(() => {
    return localStorage.getItem("setting_planning_strategy") || "balanced";
  });
  const [bufferPercentage, setBufferPercentage] = useState(() => {
    return localStorage.getItem("setting_buffer_percentage") || "20%";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("setting_user_role") || "Systems Architect";
  });
  const [userFocus, setUserFocus] = useState(() => {
    return localStorage.getItem("setting_user_focus") || "Productivity Engineering";
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("setting_user_name") || "Shreyashi";
  });
  const [theme, setTheme] = useState<"cosmic" | "solar">(() => {
    return (localStorage.getItem("setting_theme") as "cosmic" | "solar") || "cosmic";
  });

  // Keep settings persisted
  useEffect(() => {
    localStorage.setItem("setting_sound_enabled", String(soundEnabled));
    localStorage.setItem("setting_gcal_sync", String(gCalSync));
    localStorage.setItem("setting_gtasks_sync", String(gTasksSync));
    localStorage.setItem("setting_gdrive_backup", String(gDriveBackup));
    localStorage.setItem("setting_selected_model", selectedModel);
    localStorage.setItem("setting_planning_strategy", planningStrategy);
    localStorage.setItem("setting_buffer_percentage", bufferPercentage);
    localStorage.setItem("setting_user_role", userRole);
    localStorage.setItem("setting_user_focus", userFocus);
    localStorage.setItem("setting_user_name", userName);
    localStorage.setItem("setting_theme", theme);
  }, [soundEnabled, gCalSync, gTasksSync, gDriveBackup, selectedModel, planningStrategy, bufferPercentage, userRole, userFocus, userName, theme]);

  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState("Work");
  const [newTaskDuration, setNewTaskDuration] = useState("2.0");
  const [newTaskDeadline, setNewTaskDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  // Quick Task dashboard state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDeadline, setQuickDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [quickDuration, setQuickDuration] = useState("2.0");
  const [quickPriority, setQuickPriority] = useState<PriorityLevel>("Medium");

  // Task filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<"All" | PriorityLevel>("All");
  const [filterCategory, setFilterCategory] = useState<"All" | "Work" | "Personal" | "Learn" | "Project">("All");

  // Expanded task detail tracking
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Gemini loading and API sync trackers
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState<string | null>(null);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const [isAnalyzingTask, setIsAnalyzingTask] = useState(false);
  const [aiMode, setAiMode] = useState<"active" | "fallback">("active");

  // Chat Coach Room States
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("momentum_chat_messages");
    return saved ? JSON.parse(saved) : [
      {
        id: "m-1",
        role: "assistant",
        content: "Greetings! I am Momentum AI, your strategic cognitive advisor. I have loaded your current active dashboard and deadline states. What is the highest impact goal you want to accomplish today? We can design an elegant workflow or tackle procrastination head-on.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Box breathing states
  const [breathingPhase, setBreathingPhase] = useState<"In" | "Hold In" | "Out" | "Hold Out">("In");
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingCompletedCycles, setBreathingCompletedCycles] = useState(0);

  // Planner Agent States
  const [plannerGoal, setPlannerGoal] = useState("");
  const [plannerDeadline, setPlannerDeadline] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  });
  const [plannerHoursPerDay, setPlannerHoursPerDay] = useState("4.0");
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerResult, setPlannerResult] = useState<{
    tasks: Array<{ title: string; durationHours: number; priority: string; category: string }>;
    estimatedTotalTime: string;
    suggestedOrder: string[];
    dailyBreakdown: Array<{ day: string; description: string; tasks: Array<{ title: string; durationHours: number }> }>;
    isFallback: boolean;
    totalAvailableHours?: number;
    estimatedRequiredHours?: number;
    riskLevel?: string;
    isFeasible?: boolean;
    warningMessage?: string;
    actionableTasks?: Array<{ title: string; durationHours: number; priority: string; category: string }>;
    taskUnderstanding?: string;
    optimizationOpportunities?: string[];
    recoveryPlan?: string;
    executionStrategy?: string;
    orderedTasks?: string[];
    estimatedTime?: string;
    milestones?: string[];
    bufferTime?: string;
  } | null>(() => {
    const saved = localStorage.getItem("momentum_planner_result");
    return saved ? JSON.parse(saved) : null;
  });

  // Ref to scroll chat to bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Clock hook
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("momentum_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("momentum_stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("momentum_insights", JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem("momentum_focus_advice", focusAdvice);
  }, [focusAdvice]);

  useEffect(() => {
    localStorage.setItem("momentum_chat_messages", JSON.stringify(chatMessages));
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (plannerResult) {
      localStorage.setItem("momentum_planner_result", JSON.stringify(plannerResult));
    } else {
      localStorage.removeItem("momentum_planner_result");
    }
  }, [plannerResult]);

  // Fallback redirection for hidden AI pages to keep navigation consistent and prevent traps
  useEffect(() => {
    if (activeTab === "coach" || activeTab === "sparks" || activeTab === "planner") {
      setActiveTab("dashboard");
    }
  }, [activeTab]);

  // Check health and retrieve API status on mount
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.aiService === "fallback-mode") {
          setAiMode("fallback");
        } else {
          setAiMode("active");
        }
      })
      .catch(() => setAiMode("fallback"));
  }, []);

  // Box breathing timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingSecondsLeft((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              switch (currentPhase) {
                case "In":
                  return "Hold In";
                case "Hold In":
                  return "Out";
                case "Out":
                  return "Hold Out";
                case "Hold Out":
                  setBreathingCompletedCycles(c => c + 1);
                  setStats(s => {
                    const nextScore = Math.min(100, s.momentumScore + 1);
                    return { ...s, momentumScore: nextScore };
                  });
                  return "In";
                default:
                  return "In";
              }
            });
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive]);

  // Compute Dynamic Deadline Risk Meter values
  const deadlineRiskResult = useMemo(() => {
    const uncompleted = tasks.filter(t => !t.completed);
    if (uncompleted.length === 0) {
      return { percentage: 0, level: "OPTIMAL", color: "text-emerald-400", bgGlow: "from-emerald-500/10 to-emerald-500/2", borderGlow: "border-emerald-500/20", advice: "All outstanding milestones have been resolved! Excellent job maintaining positive velocity." };
    }

    let totalRiskWeight = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    uncompleted.forEach(task => {
      let riskMultiplier = 0.1; // Low Default
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const timeDiff = deadlineDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysRemaining <= 1) {
          riskMultiplier = 1.0; // Critical urgency
        } else if (daysRemaining <= 3) {
          riskMultiplier = 0.7; // High urgency
        } else if (daysRemaining <= 7) {
          riskMultiplier = 0.4; // Medium urgency
        } else {
          riskMultiplier = 0.2; // Low urgency
        }
      }

      const priorityWeight = task.priority === "High" ? 1.5 : task.priority === "Medium" ? 1.0 : 0.6;
      totalRiskWeight += (task.durationHours || 2) * riskMultiplier * priorityWeight;
    });

    const rawPercentage = (totalRiskWeight / 12) * 100;
    const percentage = Math.min(100, Math.round(rawPercentage));

    let level = "OPTIMAL";
    let color = "text-emerald-400";
    let bgGlow = "from-emerald-500/5 to-emerald-500/0";
    let borderGlow = "border-emerald-500/10";
    let advice = "Your cognitive loading is optimal. You possess comfortable buffer zones to dive into challenging technical tasks.";

    if (percentage > 75) {
      level = "CRITICAL OVERLOAD";
      color = "text-rose-400 animate-pulse";
      bgGlow = "from-rose-500/10 to-rose-500/0";
      borderGlow = "border-rose-500/20";
      advice = "Immediate bottleneck detected. High hours and short deadlines threaten your velocity. Defer 1-2 lower priority tasks or delegate immediately.";
    } else if (percentage > 45) {
      level = "ELEVATED LOAD";
      color = "text-amber-400";
      bgGlow = "from-amber-500/5 to-amber-500/0";
      borderGlow = "border-amber-500/15";
      advice = "Your work density is high. Focus on completing active sprints. Avoid launching any new conceptual initiatives today.";
    } else if (percentage > 15) {
      level = "STABLE FLOW";
      color = "text-cyan-400";
      bgGlow = "from-cyan-500/5 to-cyan-500/0";
      borderGlow = "border-cyan-500/15";
      advice = "Workload density is perfectly balanced. Maintain consistent progress. Your schedule permits highly effective deep work sprints.";
    }

    return { percentage, level, color, bgGlow, borderGlow, advice };
  }, [tasks]);

  // Filter tasks for task manager tab
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === "All" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "All" || task.category === filterCategory;
      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, filterPriority, filterCategory]);

  // Redesigned execution board stats and metrics
  const overallProgress = useMemo(() => {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  }, [tasks]);

  const totalRemainingHours = useMemo(() => {
    return tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.durationHours || 0), 0);
  }, [tasks]);

  const todaysFocusTask = useMemo(() => {
    return tasks.find(t => !t.completed && t.priority === "High") || tasks.find(t => !t.completed);
  }, [tasks]);

  // Normalizes plannerResult into structured decision cards for the AI Strategy Room
  const activePlan = useMemo(() => {
    if (!plannerResult) return null;
    
    const taskUnderstandingObj = plannerResult.taskUnderstandingObj || {
      goal: plannerResult.taskUnderstanding || `Decompose core milestones for "${plannerGoal}".`,
      deliverables: plannerResult.milestones || [
        "Core milestone planning structure.",
        "Component and feature block modular layout.",
        "System performance tuning and checklist validations."
      ],
      successCriteria: [
        "Primary action items align with execution window.",
        "System validation tests return zero fatal logs."
      ],
      constraints: [
        "Respect the allotted daily work hours budget.",
        "Minimize external dependency overheads."
      ]
    };

    const executionPlannerObj = plannerResult.executionPlannerObj || {
      step1: plannerResult.suggestedOrder?.[0] ? `Initialize task structure: ${plannerResult.suggestedOrder[0]}.` : "Set up the foundational workspace environment.",
      step2: plannerResult.suggestedOrder?.[1] ? `Develop core flows: ${plannerResult.suggestedOrder[1]}.` : "Construct primary design and data schemas.",
      step3: plannerResult.suggestedOrder?.[2] ? `Wire logic and syncs: ${plannerResult.suggestedOrder[2]}.` : "Connect state modifiers and storage triggers.",
      step4: "Perform audit, refine borders, and release product."
    };

    const riskAgentObj = plannerResult.riskAgentObj || {
      highRisks: [
        {
          problem: plannerResult.riskLevel?.toLowerCase().includes("insufficient") || plannerResult.isFeasible === false
            ? "Calculated scope exceeds target available hours constraint."
            : "Feature creep causing minor schedule shifts.",
          impact: "Slower delivery or compromised validation cycle.",
          mitigation: plannerResult.recoveryPlan || "Filter non-essential scope and prioritize core MVP actions."
        }
      ],
      mediumRisks: [
        {
          problem: "State loading delay on mobile processors.",
          impact: "Slight rendering layout stutter.",
          mitigation: "Pre-initialize local storage variables synchronously at load."
        }
      ],
      lowRisks: [
        {
          problem: "Styling layout shift on narrow screens.",
          impact: "Slightly crowded visual rhythm.",
          mitigation: "Employ flexible flex grids and hide overflow content."
        }
      ]
    };

    const aiCoachObj = plannerResult.aiCoachObj || {
      todaysFocus: [
        plannerResult.executionStrategy || "Sequence milestones sequentially.",
        "Verify checkbox interaction feels smooth and immediate."
      ],
      avoidToday: [
        "Do not write custom background sync code unless requested.",
        "Avoid adding complex configuration submenus."
      ],
      quickWin: [
        "Confirm state persistence is active to build confidence."
      ],
      ifBehindSchedule: [
        "Stick to basic UI layout presets rather than building complex graphics."
      ]
    };

    return {
      ...plannerResult,
      taskUnderstandingObj,
      executionPlannerObj,
      riskAgentObj,
      aiCoachObj
    };
  }, [plannerResult, plannerGoal]);

  // Handlers for task mutation
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAnalyzingTask(true);

    const tempTaskId = "task-" + Date.now();
    const tempTask: Task = {
      id: tempTaskId,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      deadline: newTaskDeadline,
      durationHours: parseFloat(newTaskDuration) || 2.0,
      progress: 0,
      completed: false,
      category: newTaskCategory
    };

    // Optimistically add with user priority
    setTasks(prev => [tempTask, ...prev]);

    try {
      const response = await fetch("/api/gemini/analyze-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tempTask.title,
          description: tempTask.description,
          priority: tempTask.priority,
          durationHours: tempTask.durationHours,
          deadline: tempTask.deadline,
          category: tempTask.category
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(t => {
          if (t.id === tempTaskId) {
            return {
              ...t,
              priority: result.priority || t.priority,
              aiPriority: result.priority,
              difficulty: result.difficulty,
              riskLevel: result.riskLevel,
              suggestedSchedule: result.suggestedSchedule
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error("Failed to analyze task with Gemini:", err);
    } finally {
      setIsAnalyzingTask(false);
    }

    setStats(prev => ({
      ...prev,
      momentumScore: Math.min(100, prev.momentumScore + 3)
    }));

    // Reset inputs
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskCategory("Work");
    setNewTaskPriority("Medium");
    setNewTaskDuration("2.0");
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsAnalyzingTask(true);

    const tempTaskId = "task-" + Date.now();
    const tempTask: Task = {
      id: tempTaskId,
      title: quickTitle.trim(),
      description: "Quickly created from Momentum Workspace",
      priority: quickPriority,
      deadline: quickDeadline,
      durationHours: parseFloat(quickDuration) || 2.0,
      progress: 0,
      completed: false,
      category: "Work"
    };

    setTasks(prev => [tempTask, ...prev]);

    try {
      const response = await fetch("/api/gemini/analyze-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tempTask.title,
          description: tempTask.description,
          priority: tempTask.priority,
          durationHours: tempTask.durationHours,
          deadline: tempTask.deadline,
          category: tempTask.category
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(prev => prev.map(t => {
          if (t.id === tempTaskId) {
            return {
              ...t,
              priority: result.priority || t.priority,
              aiPriority: result.priority,
              difficulty: result.difficulty,
              riskLevel: result.riskLevel,
              suggestedSchedule: result.suggestedSchedule
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error("Failed to analyze quick task with Gemini:", err);
    } finally {
      setIsAnalyzingTask(false);
    }

    setStats(prev => ({
      ...prev,
      momentumScore: Math.min(100, prev.momentumScore + 3)
    }));

    // Reset Title
    setQuickTitle("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setQuickDeadline(tomorrow.toISOString().split("T")[0]);
    setQuickDuration("2.0");
    setQuickPriority("Medium");
  };

  const handleDecomposeGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerValError(null);

    const errors: { goal?: string; deadline?: string; hoursPerDay?: string } = {};

    if (!plannerGoal.trim()) {
      errors.goal = "Goal is required.";
    }

    const todayStr = "2026-06-30";
    if (!plannerDeadline) {
      errors.deadline = "Deadline is required.";
    } else if (plannerDeadline < todayStr) {
      errors.deadline = "Deadline cannot be in the past.";
    }

    const parsedHours = parseFloat(plannerHoursPerDay);
    if (!plannerHoursPerDay || isNaN(parsedHours) || parsedHours <= 0) {
      errors.hoursPerDay = "Provide a positive hour value (e.g., 4.0).";
    } else if (parsedHours > 24) {
      errors.hoursPerDay = "Maximum limit is 24 hours per day.";
    }

    if (Object.keys(errors).length > 0) {
      setPlannerValError(errors);
      return;
    }

    setPlannerLoading(true);
    try {
      const response = await fetch("/api/gemini/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: plannerGoal,
          deadline: plannerDeadline,
          hoursPerDay: parseFloat(plannerHoursPerDay) || 4.0,
          today: todayStr
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlannerResult(data);
        setPlannerValError(null);
      } else {
        console.error("Failed to generate plan");
      }
    } catch (err) {
      console.error("Error communicating with Planner Agent:", err);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleImportPlannedTasks = () => {
    if (!plannerResult || !plannerResult.tasks) return;

    const newTasks: Task[] = plannerResult.tasks.map((t, idx) => ({
      id: "task-" + (Date.now() + idx),
      title: t.title,
      description: `Action decomposed from goal: "${plannerGoal}"`,
      priority: (t.priority === "High" || t.priority === "Medium" || t.priority === "Low" ? t.priority : "Medium") as PriorityLevel,
      durationHours: t.durationHours || 2.0,
      progress: 0,
      completed: false,
      category: t.category || "Work",
      difficulty: "Medium",
      riskLevel: "Low",
      suggestedSchedule: `Allocated to ${t.category} stream.`
    }));

    setTasks(prev => [...newTasks, ...prev]);
    
    // Play success animations & set toast
    setShowSuccessAnimation(true);
    setToastMessage("Execution plan added to your Workspace.");
    
    // Automatically switch application tab
    setActiveTab("tasks");

    // Smoothly scroll to the newly created tasks list container
    setTimeout(() => {
      const container = document.getElementById("task-items-list");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);

    // Auto dismiss animation and toast after suitable delays
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 2500);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleCloseActiveMission = () => {
    setTasks(prev => prev.map(t => t.completed ? t : { ...t, completed: true }));
    setPlannerResult(null);
    setPlannerGoal("");
    setToastMessage("Mission closed successfully. Accomplishments archived.");
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleResetStrategy = () => {
    setPlannerGoal("");
    setPlannerResult(null);
    localStorage.removeItem("momentum_planner_result");
    setTasks(prev => prev.filter(t => t.completed));
    setToastMessage("Tactical strategy cleared. You can now define a new goal.");
    setTimeout(() => {
      setToastMessage(null);
    }, 5050);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
    if (expandedTaskId === id) setExpandedTaskId(null);
  };

  const handleToggleTaskCompletion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        const nextProgress = nextCompleted ? 100 : (task.progress === 100 ? 50 : task.progress);
        
        setStats(s => {
          const addedCompleted = nextCompleted ? 1 : -1;
          const scoreDelta = nextCompleted ? 8 : -5;
          return {
            ...s,
            completedTasks: Math.max(0, s.completedTasks + addedCompleted),
            momentumScore: Math.max(0, Math.min(100, s.momentumScore + scoreDelta))
          };
        });

        const updatedSteps = task.steps ? task.steps.map(step => ({ ...step, completed: nextCompleted })) : undefined;

        return { ...task, completed: nextCompleted, progress: nextProgress, steps: updatedSteps };
      }
      return task;
    }));
  };

  const handleToggleStepCompletion = (taskId: string, stepId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.steps) {
        const updatedSteps = task.steps.map(step => {
          if (step.id === stepId) {
            return { ...step, completed: !step.completed };
          }
          return step;
        });

        const completedCount = updatedSteps.filter(s => s.completed).length;
        const totalCount = updatedSteps.length;
        const calculatedProgress = Math.round((completedCount / totalCount) * 100);
        const isNowCompleted = calculatedProgress === 100;

        if (isNowCompleted && !task.completed) {
          setStats(s => ({
            ...s,
            completedTasks: s.completedTasks + 1,
            momentumScore: Math.min(100, s.momentumScore + 8)
          }));
        } else if (!isNowCompleted && task.completed) {
          setStats(s => ({
            ...s,
            completedTasks: Math.max(0, s.completedTasks - 1),
            momentumScore: Math.max(0, s.momentumScore - 5)
          }));
        }

        return {
          ...task,
          steps: updatedSteps,
          progress: calculatedProgress,
          completed: isNowCompleted
        };
      }
      return task;
    }));
  };

  // Trigger real backend Gemini API call to break down a task
  const handleGenerateAIsteps = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingBreakdown(task.id);

    try {
      const response = await fetch("/api/gemini/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          priority: task.priority,
          durationHours: task.durationHours
        })
      });

      const data = await response.json();
      if (data.steps) {
        const generatedSteps: SubTaskStep[] = data.steps.map((step: any) => ({
          id: step.id || "step-" + Math.random().toString(36).substring(2, 7),
          text: step.text,
          minutes: step.minutes || 15,
          difficulty: step.difficulty || "Medium",
          completed: false
        }));

        setTasks(prev => prev.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              steps: generatedSteps,
              progress: 0, 
              completed: false
            };
          }
          return t;
        }));

        setStats(prev => ({
          ...prev,
          momentumScore: Math.min(100, prev.momentumScore + 5)
        }));
      }
    } catch (err) {
      console.error("Failed to generate steps:", err);
    } finally {
      setIsGeneratingBreakdown(null);
    }
  };

  // Trigger real backend Gemini API call to refresh daily suggestions and advice
  const handleRefreshSuggestions = async () => {
    setIsRefreshingSuggestions(true);
    try {
      const response = await fetch("/api/gemini/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks })
      });

      const data = await response.json();
      if (data.focusAdvice) {
        setFocusAdvice(data.focusAdvice);
      }
      if (data.insights) {
        setInsights(data.insights);
      }
      
      if (data.momentumScoreBonus) {
        setStats(prev => ({
          ...prev,
          momentumScore: Math.min(100, prev.momentumScore + data.momentumScoreBonus)
        }));
      }
    } catch (err) {
      console.error("Failed to refresh suggestions:", err);
    } finally {
      setIsRefreshingSuggestions(false);
    }
  };

  // Handlers for Chat Coach Room
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    if (!customText) setChatInput("");

    const userMsgId = "user-" + Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const activeTasksContext = tasks.filter(t => !t.completed).map(t => ({
        title: t.title,
        priority: t.priority,
        progress: t.progress
      }));

      const payloadMessages = [...chatMessages, newUserMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          currentTasks: activeTasksContext
        })
      });

      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setStats(prev => ({
          ...prev,
          momentumScore: Math.min(100, prev.momentumScore + 2)
        }));
      }
    } catch (err) {
      console.error("AI Coach connection error:", err);
      setChatMessages(prev => [...prev, {
        id: "ai-err-" + Date.now(),
        role: "assistant",
        content: "I encountered a minor network latency issue, but here is a direct coaching guideline: pick your top task, close all secondary tabs, set a strict 15-minute stopwatch, and immediately engage. Action breeds clarity!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Manual Actions
  const handleIncrementFocusHours = () => {
    setStats(prev => ({
      ...prev,
      focusHours: parseFloat((prev.focusHours + 0.5).toFixed(1)),
      momentumScore: Math.min(100, prev.momentumScore + 5)
    }));
  };

  const handleApplyStrategy = (id: string, bonus: number = 8) => {
    setInsights(prev => prev.filter(ins => ins.id !== id));
    setStats(prev => ({
      ...prev,
      momentumScore: Math.min(100, prev.momentumScore + bonus)
    }));
  };

  const handleResetMomentum = () => {
    setStats(prev => ({
      ...prev,
      momentumScore: 50,
      focusHours: 0,
      completedTasks: 0,
      streakDays: 5
    }));
  };

  // Dynamic greetings
  const greetingText = useMemo(() => {
    const hours = currentTime.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  return (
    <div className={`min-h-screen bg-[#030712] text-slate-100 font-sans antialiased flex flex-col md:flex-row relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 ${theme === "solar" ? "theme-solar" : ""}`}>
      
      {/* Decorative Glowing Ambient Mesh Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/[0.04] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/[0.04] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/[0.02] blur-[100px] pointer-events-none z-0"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-68 bg-[#070b13]/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800/60 flex flex-col justify-between shrink-0 z-10 relative" id="momentum-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800/50 flex items-center justify-between" id="sidebar-header">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-cyan-400/20">
                <Zap className="h-5.5 w-5.5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-wide text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Momentum AI</h1>
                <span className="text-[10px] font-mono text-cyan-400/90 tracking-wider uppercase block font-semibold">COGNITIVE HUB v1.5</span>
              </div>
            </div>
            
            {/* Status indicator orb */}
            <div className="flex items-center" title={aiMode === "active" ? "Gemini API Connected" : "Local Fallback State"}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${aiMode === "active" ? "bg-cyan-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${aiMode === "active" ? "bg-cyan-400" : "bg-amber-400"}`}></span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2" id="sidebar-nav">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "tasks", label: "Workspace", icon: ClipboardList, badge: tasks.filter(t => !t.completed).length },
              { id: "progress", label: "Progress", icon: TrendingUp },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item: any) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-xs font-medium transition-all duration-300 relative group overflow-hidden ${
                    isSelected 
                      ? "text-cyan-400 font-semibold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {/* Sliding glowing background on active */}
                  {isSelected && (
                    <motion.div 
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent border-l-2 border-cyan-400 z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  {/* Subtle hover background highlight */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 z-0" />
                  )}

                  <IconComp className={`h-4.5 w-4.5 shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 ${isSelected ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"}`} />
                  <span className="z-10 tracking-wide">{item.label}</span>
                  
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto text-[10px] font-mono bg-slate-900/90 border border-slate-800/80 px-2 py-0.5 rounded-full text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/20 z-10">
                      {item.badge}
                    </span>
                  )}

                  {item.status && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 z-10 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with user info card */}
        <div className="p-4 border-t border-slate-800/40" id="sidebar-footer">
          <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/[0.03] hover:border-slate-800/80 transition-all duration-300">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-cyan-400 font-bold border border-slate-700/50 shadow-inner">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block" title="Online" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">shreyashigupta2310@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6 max-w-7xl mx-auto w-full z-10 relative" id="momentum-main-content">
        
        {/* HEADER - Responsive with premium greeting & live updating clock */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-800/40" id="main-header">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 border border-cyan-800/20 px-2 py-0.5 rounded">Active Workspace</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/30 border border-indigo-800/20 px-2 py-0.5 rounded">GMT-7 Client</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              {greetingText}, {userName}
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 ml-2">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Analyze work velocity, optimize cognitive energy, and maintain pristine execution flow.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button 
              id="btn-re-analyze"
              onClick={handleRefreshSuggestions}
              disabled={isRefreshingSuggestions}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#090f1a] hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800/85 hover:border-slate-700/80 transition-all duration-300 disabled:opacity-50 hover:shadow-lg shadow-cyan-500/[0.02]"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshingSuggestions ? 'animate-spin' : ''}`} />
              <span>AI Engine Analysis</span>
            </button>
            <span className="text-xs font-mono bg-slate-900/90 border border-slate-800/80 text-slate-400 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className={`h-4.5 w-4.5 ${aiMode === "active" ? "text-cyan-400" : "text-amber-400"}`} />
              <span>{aiMode === "active" ? "Gemini 3.5 Active" : "Fallback Engine"}</span>
            </span>
          </div>
        </header>

        {/* RENDERING PAGES BASED ON ACTIVE TAB */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
              id="page-dashboard"
            >
              {(() => {
                // Internal helpers for bullet and section rendering
                const renderBulletList = (items: string[] | string | undefined, bulletSymbol: string = "•") => {
                  if (!items) return null;
                  let arr: string[] = [];
                  if (Array.isArray(items)) {
                    arr = items;
                  } else if (typeof items === "string") {
                    arr = items
                      .split(/(?:•|\n|✓|-)\s*/)
                      .map(s => s.trim())
                      .filter(s => s.length > 0);
                  }
                  
                  const limited = arr.slice(0, 6);
                  
                  return (
                    <ul className="space-y-1.5 pl-1 text-[11px] leading-relaxed text-slate-300">
                      {limited.map((item, idx) => {
                        let sentence = item;
                        const dotIdx = item.indexOf(".");
                        if (dotIdx !== -1 && dotIdx < item.length - 1) {
                          sentence = item.slice(0, dotIdx + 1);
                        }
                        return (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold shrink-0">{bulletSymbol}</span>
                            <span className="break-words">{sentence}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                };

                const renderExecutionStep = (stepText: string | undefined, stepNum: number) => {
                  if (!stepText) return null;
                  let sentence = stepText.trim();
                  const dotIdx = sentence.indexOf(".");
                  if (dotIdx !== -1 && dotIdx < sentence.length - 1) {
                    sentence = sentence.slice(0, dotIdx + 1);
                  }
                  return (
                    <div className="border-l-2 border-cyan-500/20 pl-3 py-0.5">
                      <div className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
                        STEP {stepNum}
                      </div>
                      <p className="text-[11.5px] font-sans text-slate-200 leading-relaxed">
                        {sentence}
                      </p>
                    </div>
                  );
                };

                const renderRiskSection = (
                  risks: Array<{ problem: string; impact: string; mitigation: string }> | undefined,
                  level: "High" | "Medium" | "Low"
                ) => {
                  if (!risks || risks.length === 0) return null;
                  const badgeColors = {
                    High: "text-red-400 bg-red-950/40 border-red-900/30",
                    Medium: "text-amber-400 bg-amber-950/40 border-amber-900/30",
                    Low: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30"
                  };
                  const bulletEmoji = level === "High" ? "🔴" : level === "Medium" ? "🟡" : "🟢";
                  
                  // Keep risks and their bullet statements compact, max 6 bullets per section
                  const limitedRisks = risks.slice(0, 2); 
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1 mt-2.5">
                        <span className="text-xs">{bulletEmoji}</span>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColors[level]}`}>
                          {level} Risks
                        </span>
                      </div>
                      {limitedRisks.map((risk, idx) => (
                        <div key={idx} className="space-y-1.5 pl-1.5 text-[11px] leading-normal text-slate-350">
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 font-mono shrink-0 font-bold">•</span>
                            <span className="break-words">
                              <strong className="text-slate-200 font-semibold">Problem:</strong> {risk.problem}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 font-mono shrink-0 font-bold">•</span>
                            <span className="break-words">
                              <strong className="text-slate-200 font-semibold">Impact:</strong> {risk.impact}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 font-mono shrink-0 font-bold">•</span>
                            <span className="break-words">
                              <strong className="text-slate-200 font-semibold">Mitigation:</strong> {risk.mitigation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                };

                const hasActiveMission = tasks.some(t => !t.completed);

                // Safe fallback placeholder data
                const fallbackTaskUnderstanding = {
                  goal: `Complete the core objectives of your tactical initiative with maximum speed.`,
                  deliverables: [
                    "Establish modular layouts and routing patterns.",
                    "Configure client local storage state synchronization.",
                    "Conduct automated validation checks."
                  ],
                  successCriteria: [
                    "All items can be checked and resolved instantly.",
                    "Zero fatal validation errors are logged."
                  ],
                  constraints: [
                    "Respect the available hours allocation.",
                    "No external server dependencies are required."
                  ]
                };

                const fallbackExecutionPlanner = {
                  step1: "Design foundational layout, components, and state handlers.",
                  step2: "Build out the interactive dashboard with compact cards.",
                  step3: "Hook up checklist operations to verify instant state syncs.",
                  step4: "Refine borders, margin gaps, and font sizes."
                };

                const fallbackRisks = {
                  highRisks: [{
                    problem: "Uncoordinated scope crawl slowing render speeds.",
                    impact: "Mild UI delay on low-powered screen processors.",
                    mitigation: "Strict modularization and avoiding heavy imports."
                  }],
                  mediumRisks: [{
                    problem: "State sync lag on concurrent client loads.",
                    impact: "Conflicting checkboxes across active windows.",
                    mitigation: "Register robust local storage sync event triggers."
                  }],
                  lowRisks: [{
                    problem: "Discrepancies in default native browser calendars.",
                    impact: "Minor date format layout shifting.",
                    mitigation: "Standardize text entry dates where appropriate."
                  }]
                };

                const fallbackAICoach = {
                  todaysFocus: [
                    "Setup basic visual blocks first.",
                    "Check sidebar and badge count reactivity."
                  ],
                  avoidToday: [
                    "Do not implement complex multi-page submenus.",
                    "Avoid writing non-functional mock dashboards."
                  ],
                  quickWin: [
                    "Format card frames with subtle color accents to lift product story."
                  ],
                  ifBehindSchedule: [
                    "Switch to simple layout grids and bypass custom motion transitions."
                  ]
                };

                // Determine active data to present in cards
                const dataUnderstanding = activePlan?.taskUnderstandingObj || fallbackTaskUnderstanding;
                const dataExecution = activePlan?.executionPlannerObj || fallbackExecutionPlanner;
                const dataRisks = activePlan?.riskAgentObj || fallbackRisks;
                const dataCoach = activePlan?.aiCoachObj || fallbackAICoach;

                return (
                  <div className="space-y-6">
                    {/* TOP SECTION: ACTIVE HEADER OR PLANNER FORM */}
                    {hasActiveMission ? (
                      /* ACTIVE MISSION HEADER CARD */
                      <div className="bg-gradient-to-br from-[#09101d] via-[#090f1a]/95 to-[#0b1222]/90 border border-slate-800/80 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="dashboard-mission-summary">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.04),transparent)] pointer-events-none"></div>
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <Compass className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">Active Tactical Initiative</span>
                            <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                              Goal: {plannerGoal || "High-Impact Product Cycle"}
                            </h2>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              {plannerDeadline && (
                                <span className="flex items-center gap-1.5 font-mono">
                                  <Calendar className="h-3.5 w-3.5 text-slate-500" /> Target Date: {plannerDeadline}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 font-mono">
                                <Clock className="h-3.5 w-3.5 text-slate-500" /> {tasks.filter(t => !t.completed).length} items in Workspace
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            id="btn-goto-execution"
                            onClick={() => setActiveTab("tasks")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                          >
                            <span>Go to Workspace</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          <button
                            id="btn-reset-mission"
                            onClick={handleResetStrategy}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all font-mono cursor-pointer"
                          >
                            Reset Strategy
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* GOAL PLANNER FORM (Onboarding state) */
                      <div className="space-y-6">
                        <div className="text-center max-w-2xl mx-auto space-y-4 py-4" id="state-1-welcome">
                          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
                            <Compass className="h-6 w-6" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                            Momentum AI Strategy Room
                          </h2>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Formulate a strategic initiative. Momentum AI will synthesize your requirements into clear planning cards and actionable execution tracks.
                          </p>
                        </div>

                        <section className="bg-gradient-to-br from-[#09101d] via-[#090f1a]/95 to-[#0b1222]/90 border border-slate-800/80 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl" id="dashboard-onboarding-interface">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.06),transparent)] pointer-events-none"></div>
                          
                          <div className="relative z-10">
                            <form onSubmit={handleDecomposeGoal} className="space-y-5" id="dashboard-planner-hero-form" noValidate>
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
                                {/* Large Goal Input */}
                                <div className="lg:col-span-6">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Large Goal / Undertaking *</label>
                                  <textarea
                                    id="dashboard-planner-goal"
                                    rows={2}
                                    value={plannerGoal}
                                    onChange={(e) => {
                                      setPlannerGoal(e.target.value);
                                      if (plannerValError?.goal) {
                                        setPlannerValError(prev => prev ? { ...prev, goal: undefined } : null);
                                      }
                                    }}
                                    placeholder="E.g., Build a complete landing page, study for biology finals, prepare investor deck..."
                                    className={`w-full bg-slate-950/80 border ${
                                      plannerValError?.goal ? "border-red-500/50 focus:border-red-500" : "border-slate-800/80 focus:border-cyan-500/80"
                                    } rounded-2xl p-4 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 ${
                                      plannerValError?.goal ? "focus:ring-red-500/20" : "focus:ring-cyan-500/20"
                                    } transition-all duration-300 resize-none font-medium leading-relaxed shadow-inner`}
                                  />
                                  {plannerValError?.goal && (
                                    <span className="text-[10px] text-red-400 font-mono mt-1.5 block animate-pulse">
                                      ⚠ {plannerValError.goal}
                                    </span>
                                  )}
                                </div>

                                {/* Deadline Selector */}
                                <div className="lg:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Deadline</label>
                                  <input
                                    type="date"
                                    id="dashboard-planner-deadline"
                                    value={plannerDeadline}
                                    onChange={(e) => {
                                      setPlannerDeadline(e.target.value);
                                      if (plannerValError?.deadline) {
                                        setPlannerValError(prev => prev ? { ...prev, deadline: undefined } : null);
                                      }
                                    }}
                                    className={`w-full bg-slate-950/80 border ${
                                      plannerValError?.deadline ? "border-red-500/50 focus:border-red-500" : "border-slate-800/80 focus:border-cyan-500/80"
                                    } rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-1 ${
                                      plannerValError?.deadline ? "focus:ring-red-500/20" : "focus:ring-cyan-500/20"
                                    } transition-all duration-300 font-mono font-medium cursor-pointer`}
                                  />
                                  {plannerValError?.deadline && (
                                    <span className="text-[10px] text-red-400 font-mono mt-1.5 block animate-pulse">
                                      ⚠ {plannerValError.deadline}
                                    </span>
                                  )}
                                </div>

                                {/* Available Hours Selector */}
                                <div className="lg:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Hours Per Day</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      id="dashboard-planner-hours"
                                      min="0.5"
                                      max="24"
                                      step="0.5"
                                      value={plannerHoursPerDay}
                                      onChange={(e) => {
                                        setPlannerHoursPerDay(e.target.value);
                                        if (plannerValError?.hoursPerDay) {
                                          setPlannerValError(prev => prev ? { ...prev, hoursPerDay: undefined } : null);
                                        }
                                      }}
                                      placeholder="e.g. 4.0"
                                      className={`w-full bg-slate-950/80 border ${
                                        plannerValError?.hoursPerDay ? "border-red-500/50 focus:border-red-500" : "border-slate-800/80 focus:border-cyan-500/80"
                                      } rounded-2xl p-4 pr-12 text-xs text-white focus:outline-none focus:ring-1 ${
                                        plannerValError?.hoursPerDay ? "focus:ring-red-500/20" : "focus:ring-cyan-500/20"
                                      } transition-all duration-300 font-mono font-medium`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 pointer-events-none">hrs</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {["1", "2", "3", "4", "5", "6", "8"].map((hr) => (
                                      <button
                                        key={hr}
                                        type="button"
                                        onClick={() => {
                                          setPlannerHoursPerDay(`${hr}.0`);
                                          if (plannerValError?.hoursPerDay) {
                                            setPlannerValError(prev => prev ? { ...prev, hoursPerDay: undefined } : null);
                                          }
                                        }}
                                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                          parseFloat(plannerHoursPerDay) === parseFloat(hr)
                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                            : "bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/40"
                                        }`}
                                      >
                                        {hr}h
                                      </button>
                                    ))}
                                  </div>
                                  {plannerValError?.hoursPerDay && (
                                    <span className="text-[10px] text-red-400 font-mono mt-1.5 block animate-pulse">
                                      ⚠ {plannerValError.hoursPerDay}
                                    </span>
                                  )}
                                </div>

                                {/* Analyze Goal Button */}
                                <div className="lg:col-span-2">
                                  <button
                                    type="submit"
                                    disabled={plannerLoading}
                                    id="btn-dashboard-planner-analyze"
                                    className="w-full h-[52px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-slate-950 font-bold px-4 rounded-2xl text-xs transition-all duration-300 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    {plannerLoading ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                                        <span>Analyzing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-4 w-4 text-slate-950" />
                                        <span>Analyze Goal</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </section>
                      </div>
                    )}

                    {/* CORE CONTENT: 4 STRUCTURED DECISION CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-planner-results-grid">
                      {/* CARD 1: TASK UNDERSTANDING */}
                      <div className="bg-[#090f1b]/80 border border-slate-800/60 p-6 rounded-2xl hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between group relative shadow-lg" id="card-task-understanding">
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <Brain className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
                              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Task Understanding</h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-500/5 border border-pink-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              Objective Decomp
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* Goal section */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">🎯 Goal</span>
                              {renderBulletList(dataUnderstanding.goal, "🎯")}
                            </div>

                            {/* Deliverables section */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">📦 Deliverables</span>
                              {renderBulletList(dataUnderstanding.deliverables, "✓")}
                            </div>

                            {/* Success Criteria section */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">🎯 Success Criteria</span>
                              {renderBulletList(dataUnderstanding.successCriteria, "★")}
                            </div>

                            {/* Constraints section */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">⚠ Constraints</span>
                              {renderBulletList(dataUnderstanding.constraints, "⚠")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: EXECUTION PLANNER */}
                      <div className="bg-[#090f1b]/80 border border-slate-800/60 p-6 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between group relative shadow-lg" id="card-execution-planner">
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <Compass className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Execution Planner</h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              Tactical Route
                            </span>
                          </div>

                          <div className="space-y-4.5 pt-1">
                            {renderExecutionStep(dataExecution.step1, 1)}
                            {renderExecutionStep(dataExecution.step2, 2)}
                            {renderExecutionStep(dataExecution.step3, 3)}
                            {renderExecutionStep(dataExecution.step4, 4)}
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: RISK AGENT */}
                      <div className="bg-[#090f1b]/80 border border-slate-800/60 p-6 rounded-2xl hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between group relative shadow-lg" id="card-risk-agent">
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <AlertTriangle className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Risk Agent</h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-yellow-400 bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              Fatigue Vectors
                            </span>
                          </div>

                          <div className="space-y-1">
                            {renderRiskSection(dataRisks.highRisks, "High")}
                            {renderRiskSection(dataRisks.mediumRisks, "Medium")}
                            {renderRiskSection(dataRisks.lowRisks, "Low")}
                          </div>
                        </div>
                      </div>

                      {/* CARD 4: AI COACH */}
                      <div className="bg-[#090f1b]/80 border border-slate-800/60 p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group relative shadow-lg" id="card-ai-coach">
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <Sparkles className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">AI Coach</h3>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                              Advisor Focus
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* Today's Focus */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">💡 Today's Focus</span>
                              {renderBulletList(dataCoach.todaysFocus, "✦")}
                            </div>

                            {/* Avoid Today */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-red-400/90 uppercase tracking-widest block mb-1.5">✗ Avoid Today</span>
                              {renderBulletList(dataCoach.avoidToday, "✗")}
                            </div>

                            {/* Quick Win */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-emerald-400/90 uppercase tracking-widest block mb-1.5">⚡ Quick Win</span>
                              {renderBulletList(dataCoach.quickWin, "⚡")}
                            </div>

                            {/* If Behind Schedule */}
                            <div>
                              <span className="text-[10px] font-mono font-bold text-yellow-400/90 uppercase tracking-widest block mb-1.5">⏳ If Behind Schedule</span>
                              {renderBulletList(dataCoach.ifBehindSchedule, "⏳")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OPTIONAL ACTIVATE BUTTON FOR STRATEGY PREVIEW STATE */}
                    {!hasActiveMission && activePlan && (
                      <div className="flex justify-center pt-4" id="dashboard-sync-banner">
                        <button
                          id="btn-dashboard-sync-strategy"
                          onClick={handleImportPlannedTasks}
                          className="px-8 py-4.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-cyan-500/10 flex items-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Zap className="h-5 w-5 text-slate-950 animate-bounce" />
                          <span>Activate Strategy & Sync to Workspace</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* ACTIVE TASKS PLANNER VIEW - Detailed task checklist and execution board */}
          {activeTab === "tasks" && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-6"
              id="page-tasks-planner"
            >
              {/* 1. CURRENT GOAL & 2. OVERALL PROGRESS BANNER */}
              <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="workspace-header-panel">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Active Goal */}
                  <div className="lg:col-span-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-cyan-400" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Active Workspace Goal</span>
                    </div>
                    <h2 className="text-lg font-display font-bold text-white tracking-tight">
                      {plannerGoal || "General Workspace Execution & Milestone Delivery"}
                    </h2>
                  </div>

                  {/* Middle: Progress Bar */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 uppercase">Overall Progress</span>
                      <span className="text-cyan-400 font-bold">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-[0.5px] border border-slate-850">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Right: Remaining Hours Metric */}
                  <div className="lg:col-span-3 flex justify-start lg:justify-end">
                    <div className="bg-slate-950/50 border border-slate-850 px-4 py-2.5 rounded-xl flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <div className="text-left font-mono">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">REMAINING TIME</span>
                        <span className="text-white font-bold text-xs">{totalRemainingHours} hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TWO-COLUMN LAYOUT: MAIN CHECKLIST & SIDEBAR FOR ADDING/FILTERING */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* LEFT SIDE: MAIN EXECUTION BOARD (8 cols) */}
                <div className="lg:col-span-8 space-y-6" id="workspace-execution-area">
                  
                  {/* 3. TODAY'S FOCUS TASK HIGHLIGHT */}
                  {todaysFocusTask && (
                    <div className="bg-gradient-to-r from-cyan-950/20 via-blue-950/10 to-transparent border border-cyan-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="workspace-focus-highlight">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                          </span>
                          Today's Focus
                        </span>
                        <h3 className="text-sm font-bold text-white tracking-tight">{todaysFocusTask.title}</h3>
                        {todaysFocusTask.description && (
                          <p className="text-xs text-slate-400 leading-normal line-clamp-1">{todaysFocusTask.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono text-[10px] text-slate-500 hidden xs:block">
                          <span className="text-slate-300 font-semibold">{todaysFocusTask.durationHours} hrs remaining</span>
                          <span className="block text-[9px] mt-0.5">Due: {todaysFocusTask.deadline}</span>
                        </div>
                        <button
                          onClick={(e) => handleToggleTaskCompletion(todaysFocusTask.id, e)}
                          className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all duration-250 cursor-pointer shadow-md shadow-cyan-400/5 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4 text-slate-950" />
                          <span>Mark Complete</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 10. COMPLETION CELEBRATION */}
                  {tasks.length > 0 && tasks.filter(t => !t.completed).length === 0 && (
                    <div className="bg-gradient-to-br from-emerald-950/15 via-slate-900/40 to-slate-950/20 border border-emerald-500/20 p-8 rounded-2xl text-center space-y-4" id="workspace-completion-celebration">
                      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                        <Award className="h-7 w-7 text-emerald-400" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-base font-display font-bold text-white tracking-tight">Workspace Clear!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          All active milestones have been completed and archived. You have maintained perfect focus and maximum efficiency today.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4. ACTIONABLE CHECKLIST (Milestone List) */}
                  <div className="space-y-3" id="workspace-milestone-checklist">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Actionable Checklist</span>
                      <button 
                        id="btn-reset-tasks"
                        onClick={() => { setTasks(INITIAL_TASKS); setStats(s => ({ ...s, completedTasks: 8 })); }}
                        className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono transition-colors"
                      >
                        Reset to Default Tasks
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {filteredTasks.map((task) => {
                        const isExpanded = expandedTaskId === task.id;
                        return (
                          <div 
                            key={task.id}
                            id={`task-item-card-${task.id}`}
                            className={`rounded-xl transition-all duration-200 border ${
                              isExpanded 
                                ? "bg-slate-950 border-slate-750 shadow-md shadow-cyan-500/[0.01]" 
                                : "bg-[#090f1a]/50 hover:bg-slate-900/40 border-slate-850"
                            }`}
                          >
                            {/* Summary Item Bar */}
                            <div 
                              className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* 7. Mark Complete Button */}
                                <button 
                                  id={`task-checkbox-${task.id}`}
                                  onClick={(e) => handleToggleTaskCompletion(task.id, e)}
                                  className={`h-5.5 w-5.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
                                    task.completed 
                                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" 
                                      : "border-slate-700 hover:border-cyan-500 text-cyan-400 bg-slate-950"
                                  }`}
                                >
                                  {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                                </button>
                                
                                <div className="min-w-0">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <h4 className={`text-xs font-bold tracking-tight ${
                                      task.completed ? "text-slate-500 line-through" : "text-slate-100"
                                    }`}>
                                      {task.title}
                                    </h4>
                                    <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                      task.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/10" :
                                      task.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                                      "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <span className="text-[8px] font-mono bg-slate-950 px-1.5 py-0.2 rounded text-slate-500 border border-slate-850 font-semibold uppercase">
                                      {task.category}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {/* Estimated Hours Metric (6) */}
                                <div className="text-right font-mono text-[10px] text-slate-500 hidden sm:block">
                                  <span className="text-slate-300 font-semibold">{task.durationHours} hrs</span>
                                  <span className="block text-[9px] mt-0.5 text-slate-600">{task.deadline}</span>
                                </div>
                                <button className="text-slate-500 hover:text-slate-300 transition-colors">
                                  {isExpanded ? <ChevronUp className="h-4 w-4 text-cyan-400" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            {/* 5. EXPANDABLE SUBTASKS DETAILS */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1.5 border-t border-slate-900 bg-slate-950/80 rounded-b-xl space-y-3" id={`task-expanded-${task.id}`}>
                                    {/* Task Sub-Progress */}
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                      <span>Milestone Completion Progress:</span>
                                      <span className="font-bold text-cyan-400">{task.progress}%</span>
                                    </div>
                                    
                                    {/* Subtasks steps list */}
                                    <div className="space-y-1.5">
                                      {task.steps && task.steps.length > 0 ? (
                                        task.steps.map((step) => (
                                          <div 
                                            key={step.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-xs hover:border-slate-800 transition-colors"
                                          >
                                            <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                                              <input 
                                                type="checkbox"
                                                checked={step.completed}
                                                onChange={() => handleToggleStepCompletion(task.id, step.id)}
                                                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4 cursor-pointer shrink-0"
                                              />
                                              <span className={`break-words text-xs ${step.completed ? "text-slate-500 line-through font-normal" : "text-slate-200 font-medium"}`}>
                                                {step.text}
                                              </span>
                                            </label>
                                            <span className="text-[9px] font-mono text-slate-500 shrink-0">
                                              {step.minutes}m
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="p-4 bg-slate-900/10 border border-dashed border-slate-850 rounded-xl text-center space-y-2">
                                          <p className="text-[11px] text-slate-500 font-sans">No subtasks assembled for this milestone yet.</p>
                                          <button
                                            id={`task-btn-ai-assemble-${task.id}`}
                                            onClick={(e) => handleGenerateAIsteps(task, e)}
                                            disabled={isGeneratingBreakdown === task.id}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 bg-slate-900 px-3 py-1.5 rounded-lg transition-all"
                                          >
                                            <Sparkles className="h-3 w-3" /> Assemble Subtasks
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Loading indicator for subtask breakdown */}
                                    {isGeneratingBreakdown === task.id && (
                                      <div className="p-4 bg-slate-900/10 rounded-xl border border-dashed border-slate-850 text-center space-y-2">
                                        <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin mx-auto" />
                                        <span className="text-[10px] text-slate-400 block font-mono">AI compiling granular checklists...</span>
                                      </div>
                                    )}

                                    {/* 9. DELETE TASK ACTION & ASSISTANCE */}
                                    <div className="flex justify-between items-center pt-2.5 text-[10px] border-t border-slate-900 text-slate-500 font-mono">
                                      <span>Milestone Key: <span className="text-slate-400">{task.id}</span></span>
                                      <button 
                                        id={`task-btn-delete-${task.id}`}
                                        onClick={(e) => handleDeleteTask(task.id, e)}
                                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold transition-all"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Delete Task</span>
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {filteredTasks.length === 0 && (
                        <div className="text-center py-12 bg-[#090f1a]/40 border border-dashed border-slate-850 rounded-xl">
                          <p className="text-slate-450 text-xs font-mono">No active milestones found matching the filters.</p>
                          <button 
                            id="btn-clear-filters"
                            onClick={() => { setSearchQuery(""); setFilterCategory("All"); setFilterPriority("All"); }}
                            className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: SIDEBAR FOR TASKS ACTIONS & FILTERS (4 cols) */}
                <div className="lg:col-span-4 space-y-6" id="tasks-right-sidebar">
                  
                  {/* 8. ADD MANUAL TASK FORM */}
                  <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl" id="widget-create-task">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="h-4.5 w-4.5 text-cyan-400" />
                      <h3 className="font-display font-bold text-sm text-white">Add Manual Task</h3>
                    </div>
                    
                    <form onSubmit={handleAddTask} className="space-y-4.5" id="form-add-task">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Task Title *</label>
                        <input 
                          type="text" 
                          id="input-task-title"
                          required
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g., Code dashboard layouts"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Brief Description</label>
                        <textarea 
                          id="input-task-desc"
                          rows={2}
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          placeholder="Short contextual summary..."
                          className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none transition-all duration-200 resize-none leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Priority</label>
                          <select 
                            id="select-task-priority"
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Category</label>
                          <select 
                            id="select-task-category"
                            value={newTaskCategory}
                            onChange={(e) => setNewTaskCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="Work">Work</option>
                            <option value="Project">Project</option>
                            <option value="Learn">Learn</option>
                            <option value="Personal">Personal</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Hours Est.</label>
                          <input 
                            type="number" 
                            id="input-task-duration"
                            step="0.5"
                            min="0.5"
                            max="20"
                            value={newTaskDuration}
                            onChange={(e) => setNewTaskDuration(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Deadline</label>
                          <input 
                            type="date" 
                            id="input-task-deadline"
                            required
                            value={newTaskDeadline}
                            onChange={(e) => setNewTaskDeadline(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all cursor-pointer"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        id="btn-submit-task"
                        disabled={isAnalyzingTask}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all duration-200 shadow-md shadow-cyan-500/5 flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzingTask ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                            <span>Creating Milestone...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Assemble Milestone</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* PLANNER FILTER DECK */}
                  <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl space-y-4" id="widget-task-filters">
                    <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Planner Filter Deck</h4>
                    
                    {/* Text Search */}
                    <input 
                      type="text" 
                      id="input-filter-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none transition-all"
                    />

                    {/* Priority Pill Selectors */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Priority</span>
                      <div className="flex flex-wrap gap-1">
                        {(["All", "High", "Medium", "Low"] as const).map((pr) => (
                          <button
                            key={pr}
                            id={`filter-pill-priority-${pr}`}
                            onClick={() => setFilterPriority(pr)}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-150 ${
                              filterPriority === pr 
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold" 
                                : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            {pr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Pill Selectors */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Category</span>
                      <div className="flex flex-wrap gap-1">
                        {(["All", "Work", "Project", "Learn", "Personal"] as const).map((cat) => (
                          <button
                            key={cat}
                            id={`filter-pill-category-${cat}`}
                            onClick={() => setFilterCategory(cat)}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-150 ${
                              filterCategory === cat 
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold" 
                                : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROGRESS ANALYTICS VIEW */}
          {activeTab === "progress" && (
            <motion.div 
              key="progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
              id="page-progress-analytics"
            >
              {/* TOP METRICS BENTO ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="progress-bento-metrics">
                {/* Metric 1: Momentum Score */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">Momentum Score</span>
                      <h3 className="text-3xl font-display font-black text-white tracking-tight">{stats.momentumScore}%</h3>
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <Flame className="h-5 w-5 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-950/80 h-1 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${stats.momentumScore}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Flow state</span>
                      <span className="text-cyan-400 font-bold">{stats.momentumScore >= 80 ? "Elite" : "Active"}</span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Completed Goals */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest block mb-1">Completed Milestones</span>
                      <h3 className="text-3xl font-display font-black text-white tracking-tight">{stats.completedTasks}</h3>
                    </div>
                    <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <CheckCircle2 className="h-5 w-5 text-pink-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-950/80 h-1 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" style={{ width: `${Math.min(100, (stats.completedTasks / (tasks.length || 1)) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Total tasks: {tasks.length}</span>
                      <span className="text-pink-400 font-bold">Goal master</span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Success Rate */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">Success Rate</span>
                      <h3 className="text-3xl font-display font-black text-white tracking-tight">
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 88}%
                      </h3>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Award className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-950/80 h-1 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 88}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Consistency index</span>
                      <span className="text-amber-400 font-bold">Steady</span>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Streak Days */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">Consistency Streak</span>
                      <h3 className="text-3xl font-display font-black text-white tracking-tight">{stats.streakDays} Days</h3>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Activity className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-950/80 h-1 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${Math.min(100, (stats.streakDays / 10) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Daily routine tracker</span>
                      <span className="text-emerald-400 font-bold">{stats.streakDays} days active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPLETED TASKS LEDGER / SAVED MISSIONS */}
              <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="progress-saved-missions-panel">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-white tracking-wide">Completed Deliverables Archive</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Full ledger of accomplishments registered across current system cycles.</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    Count: {tasks.filter(t => t.completed).length} items
                  </span>
                </div>

                {tasks.filter(t => t.completed).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
                    <CheckSquare className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-450 text-xs">No completed milestones archived yet.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Check off tasks inside the Workspace to archive your accomplishments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.completed).map((task) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-950/30 border border-emerald-950/30 hover:border-emerald-500/20 bg-gradient-to-br from-[#021c17]/10 via-[#000000]/20 to-transparent hover:to-emerald-950/10 transition-all duration-300 flex flex-col justify-between" id={`completed-card-${task.id}`}>
                        <div>
                          <div className="flex justify-between items-start gap-2.5 mb-2">
                            <span className="text-[8.5px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shrink-0">
                              Archived
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{task.category}</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{task.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">{task.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-900/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>Focus: {task.durationHours || 2} hrs</span>
                          <span className="text-emerald-400 font-bold">100% Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="page-settings-preferences"
            >
              {/* Left Column: Profile & Themes (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Specialist Profile */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl relative overflow-hidden" id="widget-settings-profile">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/10 font-black text-sm border border-cyan-400/20">
                      {userName.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "SH"}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">{userName}</h3>
                      <p className="text-xs font-mono text-cyan-400">User Specialization Profile</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">User Name</label>
                      <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors font-sans"
                        placeholder="e.g. Shreyashi"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">User Focus Role</label>
                      <input 
                        type="text" 
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors font-sans"
                        placeholder="e.g. Systems Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Skill Focus</label>
                      <input 
                        type="text" 
                        value={userFocus}
                        onChange={(e) => setUserFocus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors font-sans"
                        placeholder="e.g. Productivity Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Associated System Email</label>
                      <div className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono select-all truncate">
                        shreyashigupta2310@gmail.com
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="widget-settings-theme">
                  <h3 className="font-display font-bold text-sm text-white mb-1.5 uppercase tracking-wider">Aesthetic Theme</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">Choose your default system style preset.</p>

                  <div className="space-y-2.5">
                    <button 
                      onClick={() => setTheme("cosmic")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer transition-all duration-200 ${
                        theme === "cosmic" 
                          ? "bg-cyan-950/30 border border-cyan-800/40" 
                          : "bg-slate-950/30 border border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-3 w-3 rounded-full bg-cyan-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Dark Cosmic Slate</p>
                          <p className="text-[9px] text-cyan-400/80 font-mono">Default • Optimised for eye safety</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                        {theme === "cosmic" ? "Selected" : "Select"}
                      </span>
                    </button>

                    <button 
                      onClick={() => setTheme("solar")}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer transition-all duration-200 ${
                        theme === "solar" 
                          ? "bg-amber-950/30 border border-amber-800/40" 
                          : "bg-slate-950/30 border border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Solar Day Light</p>
                          <p className="text-[9px] text-slate-500 font-mono">High contrast workspace style</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                        {theme === "solar" ? "Selected" : "Select"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Preferences, AI & integrations (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Google Workspace Integrations */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="widget-settings-google">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                    <div>
                      <h3 className="font-display font-bold text-base text-white animate-pulse">Google Workspace Integrations</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Automate schedules and back up execution logs directly inside your Google Account.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Connection 1: Calendar */}
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col justify-between h-40">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Google Calendar</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${gCalSync ? "bg-cyan-400" : "bg-slate-600"}`} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Instantly push planned milestones directly into calendar schedules.
                        </p>
                      </div>
                      <button 
                        onClick={() => setGCalSync(prev => !prev)}
                        className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-center cursor-pointer ${
                          gCalSync 
                            ? "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white" 
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md"
                        }`}
                      >
                        {gCalSync ? "Disconnect Service" : "Enable Integration"}
                      </button>
                    </div>

                    {/* Connection 2: Google Tasks */}
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col justify-between h-40">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Google Tasks API</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${gTasksSync ? "bg-cyan-400" : "bg-slate-600"}`} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Sync execution tasks with Google Tasks checklists and mobile apps.
                        </p>
                      </div>
                      <button 
                        onClick={() => setGTasksSync(prev => !prev)}
                        className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-center cursor-pointer ${
                          gTasksSync 
                            ? "bg-slate-900 text-slate-450 border border-slate-800 hover:text-white" 
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md"
                        }`}
                      >
                        {gTasksSync ? "Disconnect Service" : "Enable Integration"}
                      </button>
                    </div>

                    {/* Connection 3: Google Drive */}
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col justify-between h-40">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white">Google Drive Backup</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${gDriveBackup ? "bg-cyan-400" : "bg-slate-600"}`} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Back up execution plans and productivity metrics to Drive files.
                        </p>
                      </div>
                      <button 
                        onClick={() => setGDriveBackup(prev => !prev)}
                        className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-center cursor-pointer ${
                          gDriveBackup 
                            ? "bg-slate-900 text-slate-450 border border-slate-800 hover:text-white" 
                            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md"
                        }`}
                      >
                        {gDriveBackup ? "Disconnect Service" : "Enable Integration"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI PREFERENCES */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="widget-settings-ai">
                  <h3 className="font-display font-bold text-base text-white mb-1.5">AI Engine Specifications</h3>
                  <p className="text-xs text-slate-400 mb-5 leading-normal">Configure behavioral parameters for planning, decomposing goals, and the assistant coach.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Gemini LLM Provider Core</label>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono font-medium cursor-pointer"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro (Precision Context)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast Response)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">Determines complexity of decomposed execution nodes</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Planning Deconstruction Style</label>
                      <select 
                        value={planningStrategy}
                        onChange={(e) => setPlanningStrategy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono font-medium cursor-pointer"
                      >
                        <option value="balanced">Balanced Flow (Standard Buffer)</option>
                        <option value="aggressive">Aggressive Compression (Maximize Load)</option>
                        <option value="conservative">Conservative Margin (High Rest Intervals)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">Modulates default difficulty assignments & daily budget limits</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Cognitive Buffer Margin</label>
                      <select 
                        value={bufferPercentage}
                        onChange={(e) => setBufferPercentage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono font-medium cursor-pointer"
                      >
                        <option value="10%">10% Buffer Allocation</option>
                        <option value="20%">20% Buffer Allocation (Recommended)</option>
                        <option value="30%">30% Buffer Allocation (Sustained Pace)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">Buffer space allocated around critical deadlines</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">System Tone / Coach Output</label>
                      <div className="bg-slate-950/50 border border-slate-850/60 rounded-xl p-3 text-xs text-slate-300 font-sans italic leading-relaxed">
                        "Optimized in work-behavioral architecture, executive support, flow initiation, and cognitive noise decompression."
                      </div>
                    </div>
                  </div>
                </div>

                {/* APPLICATION PREFERENCES */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="widget-settings-app">
                  <h3 className="font-display font-bold text-base text-white mb-4">Application Environment Preferences</h3>

                  <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-900 hover:border-slate-850 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Sound Effects Engine</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">Emit custom futuristic micro-feedback frequencies on task checkoff.</span>
                    </div>
                    <button 
                      onClick={() => setSoundEnabled(prev => !prev)}
                      className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${soundEnabled ? "bg-cyan-500" : "bg-slate-800"}`}
                    >
                      <div className={`h-5 w-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-200 ${soundEnabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI COACH ROOM VIEW - Dedicated Chat Panel */}
          {activeTab === "coach" && (
            <motion.div 
              key="coach"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="page-ai-coach"
            >
              {/* Left Column: Coach Profile & Starter Prompts (4 cols) */}
              <div className="lg:col-span-4 space-y-6" id="coach-left-column">
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl relative overflow-hidden" id="widget-coach-profile">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/10 border border-cyan-400/20">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Momentum Advisor</h3>
                      <span className="text-xs font-mono text-cyan-400">Cognitive Specialist</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans">
                    A customized Gemini coaching entity optimized in work-behavioral architecture, executive support, flow initiation cycles, and cognitive noise decompression.
                  </p>

                  <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-800/40">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Core Engine:</span>
                      <span className="text-slate-300">gemini-3.5-flash</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Context State:</span>
                      <span className="text-cyan-400 font-medium">{tasks.filter(t => !t.completed).length} milestones active</span>
                    </div>
                  </div>
                </div>

                {/* STARTER PRE-LOADED PROMPTS */}
                <div className="bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl space-y-3" id="widget-coach-prompts">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-2 tracking-wider">Tactical Prompt Starters</span>
                  
                  <button
                    id="btn-prompt-procrastinate"
                    onClick={() => handleSendMessage("Suggest a psychological framework to conquer procrastination on my highest priority task.")}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 border border-slate-850/80 hover:border-slate-800 hover:bg-slate-950 text-xs text-slate-300 hover:text-white transition-all font-medium leading-normal flex gap-2.5 items-start group"
                  >
                    <span className="text-cyan-400 group-hover:scale-110 transition-transform">✨</span>
                    <span>Procrastination mental barrier conqueror</span>
                  </button>

                  <button
                    id="btn-prompt-overwhelmed"
                    onClick={() => handleSendMessage("I feel highly overwhelmed and tired today. How should I optimize my active milestones list to protect energy?")}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 border border-slate-850/80 hover:border-slate-800 hover:bg-slate-950 text-xs text-slate-300 hover:text-white transition-all font-medium leading-normal flex gap-2.5 items-start group"
                  >
                    <span className="text-cyan-400 group-hover:scale-110 transition-transform">✨</span>
                    <span>Adaptive energy protection workflow</span>
                  </button>

                  <button
                    id="btn-prompt-timer"
                    onClick={() => handleSendMessage("Map out a detailed 2-hour time-boxing schedule incorporating deep focus and active reload breaks.")}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 border border-slate-850/80 hover:border-slate-800 hover:bg-slate-950 text-xs text-slate-300 hover:text-white transition-all font-medium leading-normal flex gap-2.5 items-start group"
                  >
                    <span className="text-cyan-400 group-hover:scale-110 transition-transform">✨</span>
                    <span>2-hour high-impact cognitive schedule</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Chat bubbles and text input (8 cols) */}
              <div className="lg:col-span-8 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 rounded-2xl flex flex-col h-[520px] justify-between overflow-hidden" id="coach-chat-window">
                
                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4" id="chat-messages-container">
                  {chatMessages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div 
                        key={msg.id}
                        className={`flex gap-3.5 max-w-[85%] ${
                          isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border ${
                          isUser 
                            ? "bg-slate-800 border-slate-750 text-slate-200 shadow-inner" 
                            : "bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 border-cyan-400/20 text-slate-950 shadow-md"
                        }`}>
                          {isUser ? "Me" : "AI"}
                        </div>

                        {/* Content Bubble */}
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          isUser 
                            ? "bg-cyan-950/20 border border-cyan-500/20 text-cyan-200 rounded-tr-none shadow-sm" 
                            : "bg-slate-950/80 border border-slate-850/80 text-slate-300 rounded-tl-none shadow-sm"
                        }`}>
                          <p className="whitespace-pre-line font-sans">{msg.content}</p>
                          <span className="block text-[9px] text-slate-500 font-mono mt-2 text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isChatLoading && (
                    <div className="flex gap-3.5 max-w-[85%] mr-auto">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 border border-cyan-400/20 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                        AI
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850/80 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                        <span className="font-mono">Synthesizing mental status and formulating guidance...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Bar */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-950/40" id="chat-input-bar">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="input-chat-query"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask for advice, schedule strategy, or milestone help..."
                      className="flex-1 bg-slate-950 border border-slate-800/80 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                    <button 
                      id="btn-chat-send"
                      onClick={() => handleSendMessage()}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COGNITIVE RECHARGE - Breathing Regulator & Habit sparks */}
          {activeTab === "sparks" && (
            <motion.div 
              key="sparks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="page-recharge"
            >
              {/* Left side: Interactive Box Breathing Regulator (7 cols) */}
              <div className="lg:col-span-7 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl flex flex-col items-center justify-between min-h-[460px] hover:border-slate-700/60 transition-all duration-300 relative overflow-hidden group" id="widget-box-breathing">
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-cyan-500/[0.01] rounded-full blur-xl pointer-events-none" />
                <div className="text-center w-full">
                  <h3 className="font-display font-bold text-lg text-white tracking-wide">Box Breathing Regulator</h3>
                  <p className="text-xs text-slate-400 mt-1">Calibrate neural activity, reduce blood pressure, and flush cognitive buildup using the 4x4 protocol.</p>
                </div>

                {/* Breathing Visualizer Stage */}
                <div className="my-8 flex flex-col items-center justify-center relative">
                  
                  {/* Concentric layered glowing circles */}
                  <div className="h-48 w-48 rounded-full border border-slate-800/80 flex items-center justify-center relative bg-slate-950/20">
                    <AnimatePresence>
                      {isBreathingActive && (
                        <motion.div 
                          className="absolute inset-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.02]"
                          animate={{ 
                            scale: breathingPhase === "In" ? [0.6, 1.0] : 
                                   breathingPhase === "Hold In" ? 1.0 : 
                                   breathingPhase === "Out" ? [1.0, 0.6] : 0.6
                          }}
                          transition={{ duration: 4, ease: "easeInOut" }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <motion.div 
                      className="absolute rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 border border-cyan-500/30"
                      animate={{ 
                        scale: isBreathingActive 
                          ? (breathingPhase === "In" ? 1.0 : breathingPhase === "Hold In" ? 1.0 : breathingPhase === "Out" ? 0.35 : 0.35) 
                          : 0.35 
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      style={{ height: "85%", width: "85%" }}
                    />

                    {/* Central visual text */}
                    <div className="z-10 text-center">
                      <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-bold">Phase</span>
                      <span className="text-2xl font-display font-bold text-white block my-1 tracking-wide">
                        {isBreathingActive ? breathingPhase : "READY"}
                      </span>
                      <span className="text-4xl font-mono font-bold text-cyan-400 block tabular-nums text-glow-cyan">
                        {isBreathingActive ? `${breathingSecondsLeft}s` : "4s"}
                      </span>
                    </div>
                  </div>

                  {/* Cycle count tracking */}
                  <div className="mt-6 flex items-center gap-1.5 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-850/80">
                    <Flame className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs text-slate-300 font-mono font-bold">Completed Cycles: {breathingCompletedCycles}</span>
                  </div>
                </div>

                {/* Breath Regulator actions */}
                <div className="w-full max-w-sm flex gap-3">
                  <button
                    id="btn-breathing-toggle"
                    onClick={() => {
                      setIsBreathingActive(!isBreathingActive);
                      if(!isBreathingActive) {
                        setBreathingPhase("In");
                        setBreathingSecondsLeft(4);
                      }
                    }}
                    className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isBreathingActive 
                        ? "bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900" 
                        : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/10"
                    }`}
                  >
                    {isBreathingActive ? (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        <span>Pause Cycle</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Initiate Cycle</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-breathing-reset"
                    onClick={() => {
                      setIsBreathingActive(false);
                      setBreathingPhase("In");
                      setBreathingSecondsLeft(4);
                      setBreathingCompletedCycles(0);
                    }}
                    className="p-3.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800/80 transition-colors cursor-pointer"
                    title="Reset timer"
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Right side: Curated Cognitive Sparks (5 cols) */}
              <div className="lg:col-span-5 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300" id="widget-cognitive-sparks">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkle className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <h3 className="font-display font-bold text-lg text-white tracking-wide">Cognitive Sparks</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">Micro-behavioral triggers designed to reboot working memory and protect sensory channels during extensive focus blocks.</p>

                  <div className="space-y-3.5">
                    
                    {/* Spark 1 */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850/80 flex items-start gap-3 hover:border-slate-800 transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-cyan-950/60 border border-cyan-800/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">1</div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">The 20-20-20 Rule</h4>
                        <p className="text-[11px] text-slate-450 mt-1 leading-normal">Every 20 minutes of intense monitor work, look at an object 20 feet away for at least 20 seconds. This resets ciliary muscle fatigue instantly.</p>
                      </div>
                    </div>

                    {/* Spark 2 */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850/80 flex items-start gap-3 hover:border-slate-800 transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-cyan-950/60 border border-cyan-800/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">2</div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">Sensory Defragmentation</h4>
                        <p className="text-[11px] text-slate-450 mt-1 leading-normal">Agree to close your eyes completely for 90 seconds. Stand up, stretch your wrists and neck, releasing physical binding structures.</p>
                      </div>
                    </div>

                    {/* Spark 3 */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850/80 flex items-start gap-3 hover:border-slate-800 transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-cyan-950/60 border border-cyan-800/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">3</div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">Hydration Shock Impulse</h4>
                        <p className="text-[11px] text-slate-450 mt-1 leading-normal">Consume a full glass of cold water. Immediate cold signals trigger mild vascular constriction, boosting systemic alert states.</p>
                      </div>
                    </div>

                    {/* Spark 3 */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850/80 flex items-start gap-3 hover:border-slate-800 transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-cyan-950/60 border border-cyan-800/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">3</div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-200">Hydration Shock Impulse</h4>
                        <p className="text-[11px] text-slate-450 mt-1 leading-normal">Consume a full glass of cold water. Immediate cold signals trigger mild vascular constriction, boosting systemic alert states.</p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 font-mono tracking-wide">Energy reserves deplete exponentially. Replenish proactively.</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI PLANNER AGENT VIEW */}
          {activeTab === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
              id="page-planner"
            >
              {/* PAGE TITLE & META HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl" id="planner-header">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-white tracking-wide">Execution Planner Agent</h2>
                    <p className="text-xs text-slate-400 mt-0.5 leading-normal">Practical, deliverable-focused execution planner built to generate schedules you can actually finish.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">Service:</span>
                  <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-800/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Gemini 1.5 Flash Active</span>
                </div>
              </div>

              {/* TWO-COLUMN LAYOUT: DECOMPOSITION FORM & GENERAL INSTRUCTION RULES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="planner-setup-grid">
                
                {/* PLANNER INPUT CONFIGURATION CARD (Colspan 7) */}
                <div className="lg:col-span-7 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between" id="planner-input-widget">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sliders className="h-5 w-5 text-cyan-400" />
                      <h3 className="font-display font-bold text-base text-white tracking-wide">Decomposition Blueprint</h3>
                    </div>

                    <form onSubmit={handleDecomposeGoal} className="space-y-4" id="form-goal-planner">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Large Goal / Undertaking *</label>
                        <textarea
                          id="input-planner-goal"
                          required
                          rows={3}
                          value={plannerGoal}
                          onChange={(e) => setPlannerGoal(e.target.value)}
                          placeholder="E.g., Build a hackathon project, study for final biology exam, design and launch landing page..."
                          className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all duration-300 resize-none font-medium leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Target Deadline</label>
                          <input
                            type="date"
                            id="input-planner-deadline"
                            value={plannerDeadline}
                            onChange={(e) => setPlannerDeadline(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none transition-all duration-300 font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Available Hours Per Day</label>
                          <div className="relative">
                            <input
                              type="number"
                              id="select-planner-hours"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={plannerHoursPerDay}
                              onChange={(e) => setPlannerHoursPerDay(e.target.value)}
                              placeholder="e.g. 4.0"
                              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 pr-12 text-xs text-white focus:outline-none transition-all duration-300 font-mono font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 pointer-events-none">hrs</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {["1", "2", "3", "4", "5", "6", "8"].map((hr) => (
                              <button
                                key={hr}
                                type="button"
                                onClick={() => setPlannerHoursPerDay(`${hr}.0`)}
                                className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                  parseFloat(plannerHoursPerDay) === parseFloat(hr)
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/40"
                                }`}
                              >
                                {hr}h
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={plannerLoading || !plannerGoal.trim()}
                        id="btn-planner-decompose"
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs transition-all duration-350 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {plannerLoading ? (
                          <>
                            <RefreshCw className="h-4.5 w-4.5 animate-spin text-slate-950" />
                            <span>Decomposing & Auditing Plan...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4.5 w-4.5 text-slate-950" />
                            <span>Decompose Goal into Actionables</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* THEME RULES & SYSTEM CONSTRAINTS (Colspan 5) */}
                <div className="lg:col-span-5 bg-[#090f1a]/80 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between" id="planner-guidance-widget">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-indigo-400" />
                      <h3 className="font-display font-bold text-base text-white tracking-wide">Execution Agent Guidelines</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">The Execution Planner Agent applies strict modular load-balancing, prioritising deliverables and micro-milestones to guarantee completion within constraints.</p>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded bg-indigo-950/60 border border-indigo-800/30 text-indigo-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">1</div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">Deconstruct & Sequence</h4>
                          <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed">Generates modular action blocks sequenced in true logical hierarchy.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded bg-indigo-950/60 border border-indigo-800/30 text-indigo-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">2</div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">Mitigate Fatigue Overflow</h4>
                          <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed">Pins maximum daily task load to specified limits to protect mental stamina reserves.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded bg-indigo-950/60 border border-indigo-800/30 text-indigo-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">3</div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">One-Click Workspace Sync</h4>
                          <p className="text-[11px] text-slate-450 mt-0.5 leading-relaxed">Directly ingest plan steps back into your Tasks & AI Architect list to build momentum.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER PLANNER RESULT BLUEPRINT IF GENERATED */}
              {plannerResult && (
                <div className="space-y-6" id="planner-result-container">
                  
                  {/* SUMMARY STATS & ACTION HEADER CARD */}
                  <div className="bg-[#0b1220]/90 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6" id="planner-result-summary">
                    <div className="flex items-center gap-4.5">
                      <div className="h-14 w-14 rounded-2xl bg-cyan-950/80 border border-cyan-800/30 flex flex-col items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-cyan-400 mb-0.5" />
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">Total</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-0.5">ESTIMATED WORK TIME</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-display font-extrabold text-white">{plannerResult.estimatedTotalTime}</span>
                          <span className="text-xs text-slate-500 font-medium">cumulative effort</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button
                        onClick={handleImportPlannedTasks}
                        id="btn-import-planned-tasks"
                        className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold py-3 px-5 rounded-xl text-xs transition-all duration-300 shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="h-4.5 w-4.5 text-slate-950" />
                        <span>Sync All to Active Workspace</span>
                      </button>
                      <button
                        onClick={() => {
                          setPlannerResult(null);
                          setPlannerGoal("");
                        }}
                        id="btn-clear-planner"
                        className="py-3 px-5 bg-slate-900 border border-slate-800/80 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Design New Blueprint
                      </button>
                    </div>
                  </div>

                  {/* BENTO STATS FOR PLANNER */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="planner-bento-metrics">
                    {/* TOTAL AVAILABLE HOURS */}
                    <div className="bg-[#090f1a]/80 border border-slate-800/50 p-5 rounded-2xl">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">Total Available Hours</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-display font-extrabold text-white">
                          {plannerResult.totalAvailableHours !== undefined ? `${plannerResult.totalAvailableHours} hrs` : "Calculated"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">budget limits</span>
                      </div>
                    </div>

                    {/* ESTIMATED REQUIRED HOURS */}
                    <div className="bg-[#090f1a]/80 border border-slate-800/50 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">Estimated Required Hours</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-display font-extrabold text-cyan-400">
                            {plannerResult.estimatedRequiredHours !== undefined ? `${plannerResult.estimatedRequiredHours} hrs` : plannerResult.estimatedTotalTime}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">workload estimate</span>
                        </div>
                      </div>
                      {plannerResult.bufferTime && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <Hourglass className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {plannerResult.bufferTime}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* RISK LEVEL STATUS */}
                    <div className={`bg-[#090f1a]/80 border p-5 rounded-2xl transition-all duration-300 ${
                      plannerResult.riskLevel?.toLowerCase().includes("insufficient") || plannerResult.isFeasible === false
                        ? "border-red-900/50 hover:border-red-800/80 bg-red-950/5"
                        : "border-slate-800/50"
                    }`}>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block mb-2">Risk Profile</span>
                      <div className="flex items-center gap-2">
                        {plannerResult.riskLevel?.toLowerCase().includes("insufficient") || plannerResult.isFeasible === false ? (
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
                            <span className="text-sm font-bold text-red-400 leading-none">High Risk: Insufficient time</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-400" />
                            <span className="text-lg font-bold text-green-400 leading-none">
                              {plannerResult.riskLevel || "Low"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* WARNING MESSAGE IF NOT FEASIBLE */}
                  {(plannerResult.riskLevel?.toLowerCase().includes("insufficient") || plannerResult.isFeasible === false) && (
                    <div className="bg-red-950/25 border border-red-900/40 p-5 rounded-2xl flex items-start gap-4" id="planner-risk-alert">
                      <div className="h-10 w-10 rounded-xl bg-red-950/60 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-200">High Risk: Insufficient time.</h4>
                        <p className="text-xs text-red-400 mt-1 leading-relaxed">
                          {plannerResult.warningMessage || "The calculated total workload exceeds your available work hour capacity prior to the target deadline. Please scale down the scope or extend the deadline."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STRATEGIC BLUEPRINT PANEL */}
                  <div className="space-y-6" id="planner-strategic-blueprint-wrapper">
                    {/* ROW 1: EXECUTION STRATEGY & KEY MILESTONES */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* EXECUTION STRATEGY CARD (Colspan 2) */}
                      <div className="lg:col-span-2 bg-gradient-to-br from-[#090f1a]/95 to-[#0b1424]/90 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-xl shadow-cyan-950/10">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Execution Strategy</h3>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed font-medium">
                            {plannerResult.executionStrategy || "Sequence execution targets systematically, focusing on core deliverables while minimizing non-essential code overhead to match available budget."}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                          <span>Strategic prioritization applied automatically by Execution Engine</span>
                        </div>
                      </div>

                      {/* KEY MILESTONES CARD */}
                      <div className="bg-[#090f1a]/80 border border-slate-800/50 p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="h-4.5 w-4.5 text-indigo-400" />
                            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Key Milestones</h3>
                          </div>
                          <ul className="space-y-3">
                            {(plannerResult.milestones || [
                              "Milestone 1: Establish baseline UI containers",
                              "Milestone 2: Finalize core business logic",
                              "Milestone 3: Complete verification audit"
                            ]).map((milestone, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="h-4 w-4 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: DETAILED STRATEGIC ASSESSMENT CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="planner-strategic-blueprint">
                      {/* TASK UNDERSTANDING SECTION */}
                      <div className="bg-[#090f1b]/90 border border-slate-800/80 p-5 rounded-2xl hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-850 pb-2">
                            <Brain className="h-4.5 w-4.5 text-pink-400 group-hover:scale-110 transition-transform" />
                            <h3 className="font-display font-extrabold text-[11px] text-white uppercase tracking-wider">Task Understanding</h3>
                          </div>
                          <div className="space-y-3.5 text-xs text-slate-300">
                            <div>
                              <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                                <span>🎯 Objective</span>
                              </div>
                              <p className="leading-relaxed font-sans pl-1 break-words">
                                {plannerResult.taskUnderstanding || `Execute core initiative milestones for ${plannerGoal}.`}
                              </p>
                            </div>
                            <div>
                              <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                                <span>📦 Deliverables</span>
                              </div>
                              <div className="space-y-1 pl-1">
                                {(plannerResult.milestones || []).slice(0, 2).map((milestone, mIdx) => (
                                  <div key={mIdx} className="flex items-start gap-1 text-slate-300">
                                    <span className="text-emerald-400 font-bold">✓</span>
                                    <span className="break-words">{milestone.replace(/Milestone \d+:\s*/, "")}</span>
                                  </div>
                                )) || (
                                  <>
                                    <div className="flex items-center gap-1 text-slate-300"><span className="text-emerald-400 font-bold">✓</span><span>Core MVP delivery</span></div>
                                    <div className="flex items-center gap-1 text-slate-300"><span className="text-emerald-400 font-bold">✓</span><span>Deployment verification</span></div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* EXECUTION PLANNER SECTION */}
                      <div className="bg-[#090f1b]/90 border border-slate-800/80 p-5 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-850 pb-2">
                            <Compass className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <h3 className="font-display font-extrabold text-[11px] text-white uppercase tracking-wider">Execution Planner</h3>
                          </div>
                          <div className="space-y-3 text-xs text-slate-300">
                            <div className="space-y-2">
                              {(plannerResult.dailyBreakdown || []).slice(0, 3).map((dayPlan, dIdx) => (
                                <div key={dIdx} className="border-l-2 border-cyan-500/20 pl-2">
                                  <div className="font-mono text-[9px] font-bold text-cyan-400 uppercase">Step {dIdx + 1}</div>
                                  <p className="text-[11px] font-sans break-words text-slate-200">
                                    • {dayPlan.tasks?.[0]?.title || dayPlan.description || "Foundational setup"}
                                  </p>
                                </div>
                              ))}
                              {(!plannerResult.dailyBreakdown || plannerResult.dailyBreakdown.length === 0) && (
                                <>
                                  <div>
                                    <div className="font-mono text-[9px] font-bold text-cyan-400 uppercase">Step 1</div>
                                    <p className="text-[11px] font-sans break-words">• Foundational architecture setup</p>
                                  </div>
                                  <div>
                                    <div className="font-mono text-[9px] font-bold text-cyan-400 uppercase">Step 2</div>
                                    <p className="text-[11px] font-sans break-words">• Endpoints & backend wiring</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RISK ANALYSIS SECTION */}
                      <div className="bg-[#090f1b]/90 border border-slate-800/80 p-5 rounded-2xl hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-850 pb-2">
                            <AlertTriangle className="h-4.5 w-4.5 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <h3 className="font-display font-extrabold text-[11px] text-white uppercase tracking-wider">Risk Analysis</h3>
                          </div>
                          <div className="space-y-3.5 text-xs text-slate-300">
                            <div>
                              <span className="font-bold text-slate-200 block mb-1">⚠ Risks</span>
                              <div className="space-y-1 font-sans">
                                <div className="flex items-start gap-1">
                                  <span className="text-red-400 font-bold text-[10px] uppercase font-mono bg-red-950/40 border border-red-900/30 px-1 py-0.2 rounded shrink-0">High</span>
                                  <span className="break-words">{plannerResult.riskLevel?.toLowerCase().includes("insufficient") || plannerResult.isFeasible === false ? "Schedule overload pressure" : "None detected"}</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <span className="text-amber-400 font-bold text-[10px] uppercase font-mono bg-amber-950/40 border border-amber-900/30 px-1 py-0.2 rounded shrink-0 font-bold">Med</span>
                                  <span className="break-words">Context switching fatigue</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="font-bold text-slate-200 block mb-1">🛡 Mitigation</span>
                              <p className="text-[11px] leading-relaxed font-sans pl-1 text-slate-300 break-words">
                                • {plannerResult.recoveryPlan || "Distribute load and use modular scaffolding."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI COACH SECTION */}
                      <div className="bg-[#090f1b]/90 border border-slate-800/80 p-5 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-850 pb-2">
                            <Sparkles className="h-4.5 w-4.5 text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
                            <h3 className="font-display font-extrabold text-[11px] text-white uppercase tracking-wider">AI Coach</h3>
                          </div>
                          <div className="space-y-3 text-xs text-slate-300">
                            <div>
                              <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                                <span>💡 Focus Today</span>
                              </span>
                              <p className="text-[11px] font-sans pl-1 text-slate-300 break-words">
                                • {plannerResult.executionStrategy || "Sequence milestones sequentially."}
                              </p>
                            </div>
                            <div>
                              <span className="font-bold text-red-400 flex items-center gap-1.5 mb-1 font-sans">
                                <span>Avoid</span>
                              </span>
                              <p className="text-[11px] font-sans pl-1 text-slate-450 break-words">
                                ✗ Multitasking or delaying initial layout decisions
                              </p>
                            </div>
                            <div className="border-t border-slate-900/60 pt-2 flex flex-col gap-1">
                              <div className="flex flex-col text-[10px] font-mono gap-0.5">
                                <span className="text-slate-500">Next Action:</span>
                                <span className="text-cyan-400 font-bold break-words">👉 {plannerResult.orderedTasks?.[0] || "Begin step 1"}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-500">Estimated Time:</span>
                                <span className="text-slate-300 font-bold">{plannerResult.estimatedTotalTime || `${plannerResult.estimatedRequiredHours} hours`}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE COLUMN PLAN RESULT: SUGGESTED SEQUENCE (Colspan 4) & DAY TIMELINE (Colspan 8) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="planner-result-timeline-grid">
                    
                    {/* SUGGESTED SEQUENCE (Colspan 4) */}
                    <div className="lg:col-span-4 bg-[#090f1a]/80 border border-slate-800/50 p-6 rounded-2xl" id="planner-result-sequence">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4.5 w-4.5 text-indigo-400" />
                        <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Suggested Sequence</h3>
                      </div>
                      <div className="space-y-4">
                        {plannerResult.suggestedOrder?.map((title, index) => (
                          <div key={index} className="flex gap-3 items-start relative">
                            {/* Connect lines between step dots */}
                            {index < plannerResult.suggestedOrder.length - 1 && (
                              <div className="absolute left-3 top-6 bottom-[-16px] w-[1px] bg-slate-800" />
                            )}
                            <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div className="pt-0.5">
                              <h4 className="text-xs font-semibold text-slate-200 leading-normal">{title}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DAILY STAGGERED SCHEDULE TIMELINE (Colspan 8) */}
                    <div className="lg:col-span-8 space-y-4" id="planner-result-daily-timeline">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4.5 w-4.5 text-cyan-400" />
                          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Day-by-Day Micro-Schedule</h3>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Max Load Limit: {plannerHoursPerDay} hrs/day</span>
                      </div>

                      {plannerResult.dailyBreakdown?.map((dayPlan, dIdx) => {
                        const dayHours = dayPlan.tasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);
                        const availableMax = parseFloat(plannerHoursPerDay) || 4.0;
                        const fillPercentage = Math.min(100, (dayHours / availableMax) * 100);

                        return (
                          <div key={dIdx} className="bg-[#090f1a]/80 border border-slate-800/50 p-5 rounded-2xl hover:border-slate-800/80 transition-all duration-300" id={`planner-day-${dIdx}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                              <div>
                                <span className="bg-cyan-950/50 text-cyan-400 border border-cyan-800/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                  {dayPlan.day}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-300 mt-1">{dayPlan.description}</h4>
                              </div>
                              <div className="text-right flex flex-col items-start sm:items-end font-mono">
                                <span className="text-[11px] font-bold text-slate-200">{dayHours} / {plannerHoursPerDay} hrs</span>
                                <span className="text-[9px] text-slate-500">cognitive capacity</span>
                              </div>
                            </div>

                            {/* Capacity Loading Progress Bar */}
                            <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden mb-4 border border-slate-900">
                              <div
                                style={{ width: `${fillPercentage}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  fillPercentage > 90 ? "bg-red-500" : fillPercentage > 70 ? "bg-amber-500" : "bg-gradient-to-r from-cyan-400 to-blue-500"
                                }`}
                              />
                            </div>

                            {/* Tasks within this day */}
                            <div className="space-y-2.5">
                              {dayPlan.tasks?.map((task, tIdx) => (
                                <div key={tIdx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 hover:border-slate-850/60 transition-colors">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-2 w-2 rounded-full bg-cyan-400" />
                                    <span className="text-xs text-slate-200 font-medium">{task.title}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono font-semibold shrink-0">
                                    {task.durationHours} hrs
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COMPLETE TASKS DECOMPOSED DIRECT LIST VIEW */}
                  <div className="bg-[#090f1a]/80 border border-slate-800/50 p-6 rounded-2xl" id="planner-result-all-tasks">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckSquare className="h-4.5 w-4.5 text-cyan-400" />
                      <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Decomposed Task Audit Ledger</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-850 font-mono text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Task Title</th>
                            <th className="pb-3 font-semibold text-center">Category</th>
                            <th className="pb-3 font-semibold text-center">User Priority</th>
                            <th className="pb-3 font-semibold text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {plannerResult.tasks?.map((task, idx) => (
                            <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                              <td className="py-3 text-slate-200 font-medium">{task.title}</td>
                              <td className="py-3 text-center">
                                <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-800 font-medium">
                                  {task.category || "Work"}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`text-[10px] font-bold ${
                                  task.priority === "High" ? "text-red-400" :
                                  task.priority === "Medium" ? "text-amber-400" : "text-blue-400"
                                }`}>
                                  {task.priority || "Medium"}
                                </span>
                              </td>
                              <td className="py-3 text-right font-mono text-slate-300 font-medium">
                                {task.durationHours} hours
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="text-center text-[10px] text-slate-600 font-mono pt-8 border-t border-slate-900/60 mt-auto" id="main-footer">
          <p>© 2026 Momentum AI. Configured for premium execution flow.</p>
          <div className="flex justify-center gap-4 mt-2">
            <button id="btn-footer-reset-dashboard" onClick={handleResetMomentum} className="hover:text-slate-400 hover:underline transition-colors cursor-pointer">Reset Analytics</button>
            <span>•</span>
            <span className="text-cyan-500/50">Gemini Core Active Sync ready</span>
          </div>
        </footer>

        {/* SUCCESS CELEBRATION ANIMATION overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="bg-slate-900/90 border border-emerald-500/30 p-8 rounded-3xl flex flex-col items-center shadow-2xl shadow-emerald-500/10 pointer-events-auto"
              >
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-9 w-9 text-emerald-400 animate-bounce" />
                </div>
                <h3 className="font-display font-black text-white text-lg tracking-wide uppercase">Plan Ingested</h3>
                <p className="text-xs text-slate-450 mt-1">Ready for execution in your Workspace</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST NOTIFICATION message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 bg-[#070c14]/95 border border-emerald-500/30 p-4 rounded-xl shadow-xl shadow-emerald-500/[0.03] z-50 flex items-center gap-3.5 max-w-sm"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shrink-0">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200">{toastMessage}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Execution cycle updated</p>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-slate-500 hover:text-white ml-auto text-xs font-bold px-1.5 py-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
