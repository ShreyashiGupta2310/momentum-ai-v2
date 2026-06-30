import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini API Client initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize Gemini API Client:", err);
      }
    }
  }
  return aiClient;
}

// REST Endpoint: Health check
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({ 
    status: "healthy", 
    aiService: hasKey ? "enabled" : "fallback-mode",
    timestamp: new Date().toISOString()
  });
});

// REST Endpoint: Analyze task parameters and suggest scheduling / optimization
app.post("/api/gemini/analyze-task", async (req, res) => {
  const { title, description, priority, durationHours, deadline, category } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Beautiful mock fallback
    console.log("Gemini client not initialized. Using fallback mock for task analysis.");
    const duration = parseFloat(durationHours) || 2.0;
    const isShortDeadline = deadline ? (new Date(deadline).getTime() - Date.now() < 86400000 * 2) : false;
    
    let difficulty: "Easy" | "Medium" | "Hard" = "Medium";
    if (duration > 5) difficulty = "Hard";
    else if (duration <= 1.5) difficulty = "Easy";

    let riskLevel = "Stable";
    if (isShortDeadline) riskLevel = "Critical";
    else if (priority === "High" || duration > 4) riskLevel = "Elevated";
    else riskLevel = "Low";

    let suggestedSchedule = "Allocate to your peak mental energy slot tomorrow morning.";
    if (isShortDeadline) {
      suggestedSchedule = "Start immediately to mitigate schedule slippage and pressure.";
    } else if (priority === "Low") {
      suggestedSchedule = "De-prioritize to Friday afternoon or during a low-cognitive cycle.";
    }

    return res.json({
      priority: priority || "Medium",
      difficulty,
      riskLevel,
      suggestedSchedule,
      isFallback: true
    });
  }

  try {
    const prompt = `Analyze the following task and determine:
    1. Refined Priority: Decide whether the priority should be "High", "Medium", or "Low" based on the title, description, deadline, and complexity.
    2. Estimated Difficulty: Select "Easy", "Medium", or "Hard" based on the workload and description.
    3. Risk Level: Determine the schedule/execution risk ("Low", "Medium", "High", or "Critical") based on estimated hours, deadline urgency, and task complexity.
    4. Suggested Schedule: Provide a concise, highly specific, 1-sentence recommendation on exactly when/how the user should schedule this task (e.g. "Schedule for Wednesday morning during high-focus zone", "Run as a quick 20-minute wind-down task at end of day").
    
    Task Details:
    - Title: "${title}"
    - Description: "${description || 'No description provided'}"
    - User-Selected Priority: "${priority || 'Medium'}"
    - Estimated Duration: ${durationHours || 'Not specified'} hours
    - Target Deadline: "${deadline || 'Not specified'}"
    - Category: "${category || 'Work'}"`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly precise AI productivity system. You analyze task payloads to extract structural risk, difficulty curves, true prioritizations, and perfect schedule placement recommendations. Return all output as a structured JSON object. Rules: never return long paragraphs; max 1-2 short sentences per section; use concise bullet points and scannable terms; answer 'What should I do?' within 5 seconds.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["priority", "difficulty", "riskLevel", "suggestedSchedule"],
          properties: {
            priority: { type: Type.STRING, description: "Must be exactly 'High', 'Medium', or 'Low'" },
            difficulty: { type: Type.STRING, description: "Must be exactly 'Easy', 'Medium', or 'Hard'" },
            riskLevel: { type: Type.STRING, description: "The execution risk: 'Low', 'Medium', 'High', or 'Critical'" },
            suggestedSchedule: { type: Type.STRING, description: "A highly concise 1-sentence schedule recommendation" }
          }
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      let cleanedPriority: "High" | "Medium" | "Low" = "Medium";
      if (["High", "Medium", "Low"].includes(parsed.priority)) {
        cleanedPriority = parsed.priority as "High" | "Medium" | "Low";
      }
      let cleanedDifficulty: "Easy" | "Medium" | "Hard" = "Medium";
      if (["Easy", "Medium", "Hard"].includes(parsed.difficulty)) {
        cleanedDifficulty = parsed.difficulty as "Easy" | "Medium" | "Hard";
      }
      
      return res.json({
        priority: cleanedPriority,
        difficulty: cleanedDifficulty,
        riskLevel: parsed.riskLevel || "Low",
        suggestedSchedule: parsed.suggestedSchedule || "Allocate to standard focus slot.",
        isFallback: false
      });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini task analysis error:", error);
    return res.json({
      priority: priority || "Medium",
      difficulty: "Medium",
      riskLevel: "Medium",
      suggestedSchedule: "Allocate to standard focus slot.",
      isFallback: true,
      error: error.message
    });
  }
});

// REST Endpoint: Breakdown a task into steps
app.post("/api/gemini/breakdown", async (req, res) => {
  const { taskTitle, taskDescription, priority, durationHours } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ error: "Task title is required for breakdown" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Elegant simulated response if API key is not present
    console.log("Gemini client not initialized. Using premium mock fallback for breakdown.");
    const mockSteps = [
      { id: "1", text: `Initialize preparation phase for '${taskTitle}'`, minutes: Math.round((durationHours || 2) * 15), difficulty: "Easy" },
      { id: "2", text: `Execute the core implementation of: ${taskDescription || 'Main objective'}`, minutes: Math.round((durationHours || 2) * 35), difficulty: "Medium" },
      { id: "3", text: `Review structural integrity and verify quality guidelines`, minutes: Math.round((durationHours || 2) * 10), difficulty: "Medium" },
      { id: "4", text: "Final optimization and deployment/documentation check", minutes: Math.round((durationHours || 2) * 10), difficulty: "Easy" },
    ];
    return res.json({ steps: mockSteps, isFallback: true });
  }

  try {
    const prompt = `Break down the following task into 3 to 5 realistic, step-by-step subtasks:
    - Task Title: "${taskTitle}"
    - Description: "${taskDescription || 'No description provided'}"
    - Priority: ${priority || 'Medium'}
    - Estimated Total Duration: ${durationHours || 'Not specified'} hours

    Return a clean list of subtasks. Provide logical, actionable steps with an estimated duration in minutes and difficulty ('Easy', 'Medium', 'Hard').`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI productivity system acting as a professional, elite executive coordinator and cognitive specialist. You break down complex undertakings into clear, sequential milestones designed to maximize momentum and eliminate cognitive friction. Return all output as a structured JSON object matching the provided schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["steps"],
          properties: {
            steps: {
              type: Type.ARRAY,
              description: "The breakdown of sequential steps to complete this task",
              items: {
                type: Type.OBJECT,
                required: ["text", "minutes", "difficulty"],
                properties: {
                  text: { type: Type.STRING, description: "Detailed action-oriented step instruction" },
                  minutes: { type: Type.INTEGER, description: "Estimated time in minutes to complete this step" },
                  difficulty: { type: Type.STRING, description: "Complexity of the step: Easy, Medium, or Hard" }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      // Map and add unique IDs for rendering
      const steps = (parsed.steps || []).map((step: any, index: number) => ({
        id: String(index + 1),
        text: step.text,
        minutes: Number(step.minutes) || 15,
        difficulty: step.difficulty || "Medium"
      }));
      return res.json({ steps, isFallback: false });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini breakdown error:", error);
    // Fallback on error
    const mockSteps = [
      { id: "1", text: `Draft plan for '${taskTitle}'`, minutes: 15, difficulty: "Easy" },
      { id: "2", text: "Process main requirements step-by-step", minutes: 45, difficulty: "Medium" },
      { id: "3", text: "Perform rigorous quality tests and refinement", minutes: 20, difficulty: "Easy" }
    ];
    return res.json({ steps: mockSteps, isFallback: true, error: error.message });
  }
});

// REST Endpoint: Dynamic Productivity suggestions based on task status
app.post("/api/gemini/suggestions", async (req, res) => {
  const { tasks } = req.body; // Array of current tasks: { title, priority, deadline, status, progress }

  const client = getGeminiClient();

  const taskSummary = (tasks || []).map((t: any) => 
    `- "${t.title}" (${t.priority} priority, Progress: ${t.progress || 0}%, Deadline: ${t.deadline || 'None'}, Status: ${t.completed ? 'Completed' : 'Active'})`
  ).join("\n");

  if (!client || (tasks || []).length === 0) {
    // Beautiful mock analysis
    const defaultFocusAdvice = "You have balanced energy reserves. Prioritize completing high-impact actions during your peak focus window.";
    const defaultInsights = [
      { id: "1", title: "Apply Time-Boxing", description: "Allocate a strict 45-minute sprint followed by a 10-minute break to build rapid momentum.", category: "Strategy" },
      { id: "2", title: "Tackle High Priority Items First", description: "Your energy levels are high. Starting with complex priorities will reduce afternoon decision fatigue.", category: "Focus" },
      { id: "3", title: "Micro-Breaks", description: "Ensure to rest your eyes and practice deep breathing for 2 minutes every hour to maintain cognition.", category: "Health" }
    ];
    return res.json({
      focusAdvice: defaultFocusAdvice,
      insights: defaultInsights,
      recommendedTaskId: tasks && tasks.length > 0 ? tasks.find((t: any) => !t.completed)?.id : null,
      momentumScoreBonus: 12,
      isFallback: true
    });
  }

  try {
    const prompt = `Analyze the current productivity list and status of active work:
    ${taskSummary || 'No active tasks logged yet.'}
    
    Please provide:
    1. A short, highly-actionable, customized focus recommendation (focusAdvice) of 1-2 sentences.
    2. Exactly 3 strategic productivity insights (insights) tailored to the task list, each with a title, a brief actionable description, and a category (e.g. 'Strategy', 'Focus', 'Prioritization', 'Health').
    3. The recommended next task ID to tackle immediately (matching one of the active tasks' titles if possible, or just advise which to pick).
    
    Provide the output in valid structured JSON format.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI productivity system acting as an elite, thoughtful human-behavior and work-optimization architect. Return all output as a structured JSON object matching the provided schema. Rules: never return long paragraphs; max 1-2 short sentences per section; write brief, supportive, crystal-clear bullet points and scannable titles designed for a high-performer dashboard.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["focusAdvice", "insights"],
          properties: {
            focusAdvice: { type: Type.STRING, description: "A highly custom advice summary for today's state" },
            insights: {
              type: Type.ARRAY,
              description: "Exactly 3 custom suggestions",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "category"],
                properties: {
                  title: { type: Type.STRING, description: "Short title of advice" },
                  description: { type: Type.STRING, description: "Actionable execution details" },
                  category: { type: Type.STRING, description: "Category label: Strategy, Focus, Prioritization, Health" }
                }
              }
            },
            recommendedTaskTitle: { type: Type.STRING, description: "The exact title of the recommended task from the list" }
          }
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      
      // Match recommendedTaskTitle back to an ID
      let recommendedTaskId: string | null = null;
      if (parsed.recommendedTaskTitle) {
        const found = tasks.find((t: any) => t.title.toLowerCase().includes(parsed.recommendedTaskTitle.toLowerCase()) || parsed.recommendedTaskTitle.toLowerCase().includes(t.title.toLowerCase()));
        if (found) {
          recommendedTaskId = found.id;
        }
      }
      
      if (!recommendedTaskId && tasks.length > 0) {
        // Fallback to first uncompleted high/med task
        const backup = tasks.find((t: any) => !t.completed && t.priority === "High") || tasks.find((t: any) => !t.completed);
        recommendedTaskId = backup ? backup.id : null;
      }

      // Add IDs to insights
      const insights = (parsed.insights || []).slice(0, 3).map((ins: any, idx: number) => ({
        id: String(idx + 1),
        title: ins.title,
        description: ins.description,
        category: ins.category || "Strategy"
      }));

      return res.json({
        focusAdvice: parsed.focusAdvice,
        insights: insights,
        recommendedTaskId,
        momentumScoreBonus: 15,
        isFallback: false
      });
    } else {
      throw new Error("Empty response for suggestions");
    }
  } catch (error: any) {
    console.error("Gemini suggestions error:", error);
    return res.json({
      focusAdvice: "Focus on your highest priority active task. Avoid multi-tasking to protect your flow state.",
      insights: [
        { id: "1", title: "Batch Communications", description: "Check notifications only twice today to maintain focus.", category: "Focus" },
        { id: "2", title: "Single-Tasking Loop", description: "Dedicate your current block exclusively to your selected task.", category: "Strategy" },
        { id: "3", title: "Keep Hydrated", description: "Take a sip of water every 20 minutes to keep your energy high.", category: "Health" }
      ],
      recommendedTaskId: tasks && tasks.length > 0 ? tasks.find((t: any) => !t.completed)?.id : null,
      momentumScoreBonus: 10,
      isFallback: true,
      error: error.message
    });
  }
});

// REST Endpoint: Dynamic Chat Coaching with Momentum AI
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, currentTasks } = req.body; // messages: Array of { role: 'user'|'assistant', content: string }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Beautiful mock chat coaching response
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    let mockReply = "That sounds like an important goal. Let's break that down into small, digestible actions. Focus on completing just one specific milestone in the next 30 minutes. What would be the absolute smallest, easiest step you can take right now to build momentum?";
    
    if (lastUserMessage.toLowerCase().includes("procrastinate") || lastUserMessage.toLowerCase().includes("procrastinating")) {
      mockReply = "Procrastination is often just our brain trying to protect us from anticipated failure or overload. Let's practice the '5-Minute Rule': agree to work on your task for exactly 5 minutes. If you want to stop after that, you can. 90% of the time, once you start, the friction vanishes and you'll keep going!";
    } else if (lastUserMessage.toLowerCase().includes("tired") || lastUserMessage.toLowerCase().includes("overwhelm")) {
      mockReply = "When overwhelm hits, your cognitive load is maxed out. Take a deep breath, close your eyes, and list just *one* single thing you'll finish. Let everything else slide for now. Your only task is that single item. Let's make it easy!";
    } else if (lastUserMessage.toLowerCase().includes("schedule") || lastUserMessage.toLowerCase().includes("time")) {
      mockReply = "A solid workflow is key. I suggest time-blocking: set dedicated, uninterrupted 30-minute zones for creation, and batch admin tasks together. This protects your deeper intellectual focus.";
    }

    return res.json({
      reply: mockReply,
      isFallback: true
    });
  }

  try {
    // Map existing conversation messages into Gemini API content format
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    // Inject contextual background in system instructions or initial prompt
    const tasksSummary = (currentTasks || []).map((t: any) => 
      `- ${t.title} (${t.priority} priority, ${t.progress || 0}% done)`
    ).join("\n");

    const systemInstruction = `You are Momentum AI, an elite AI productivity system acting as a world-class cognitive productivity coach and strategic advisor.
    Your tone is encouraging, objective, calm, and intellectually stimulating.
    Your mission is to help the user clear cognitive noise, overcome fatigue/overwhelm, and design elegant actionable workflows.
    Be highly concise, focused, and practical. Avoid fluffy preambles. Keep answers to 2-3 short, powerful paragraphs maximum.
    Whenever appropriate (such as list formulas, structured strategies, scheduling suggestions, or task prioritization), return outputs in clear, structured formats such as markdown tables, lists, or structured JSON markdown blocks (e.g. \`\`\`json ... \`\`\`).
    
    Current User Tasks Context:
    ${tasksSummary || 'No tasks logged yet.'}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I am here to help you coordinate your momentum. Let's focus on defining clear steps.";
    return res.json({ reply, isFallback: false });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    return res.json({
      reply: "I experienced a slight sync pause with the server, but my core advice remains: pick the highest impact item on your dashboard, block out distractions for 15 minutes, and take that first step. I'm right here with you!",
      isFallback: true,
      error: error.message
    });
  }
});

function getFallbackPlan(goal: string, hours: number, totalAvailableHours: number = 28, availableDays: number = 7) {
  const lowerGoal = goal.toLowerCase();
  
  // Concrete actionable tasks instead of generic ones
  let mockTasks = [
    { title: "Design login page UI and layout container", durationHours: Math.min(1.5, hours), priority: "High" as const, category: "Project" },
    { title: "Create React navbar with responsive mobile toggles", durationHours: Math.min(1, hours), priority: "High" as const, category: "Project" },
    { title: "Integrate Gemini API server endpoint with SDK", durationHours: Math.min(3, hours), priority: "High" as const, category: "Work" },
    { title: "Configure local storage state syncing logic", durationHours: Math.min(1, hours), priority: "Medium" as const, category: "Work" },
    { title: "Deploy on Cloud Run using container builds", durationHours: Math.min(2, hours), priority: "Low" as const, category: "Personal" }
  ];

  if (lowerGoal.includes("hackathon") || lowerGoal.includes("project") || lowerGoal.includes("build") || lowerGoal.includes("app")) {
    mockTasks = [
      { title: "Design login page UI with input validation", durationHours: 1, priority: "High" as const, category: "Project" },
      { title: "Create React navbar with Tailwind layout grid", durationHours: 1.5, priority: "High" as const, category: "Project" },
      { title: "Integrate Gemini API with streaming responses", durationHours: 2, priority: "High" as const, category: "Work" },
      { title: "Perform complete client-side routing tests", durationHours: 1, priority: "Medium" as const, category: "Learn" },
      { title: "Deploy on Cloud Run and verify production logs", durationHours: 1.5, priority: "Low" as const, category: "Personal" }
    ];
  } else if (lowerGoal.includes("study") || lowerGoal.includes("learn") || lowerGoal.includes("exam") || lowerGoal.includes("course")) {
    mockTasks = [
      { title: "Outline main syllabus topics and read core textbooks", durationHours: 1.5, priority: "High" as const, category: "Learn" },
      { title: "Summarize biology theory into modular markdown tables", durationHours: 2, priority: "High" as const, category: "Learn" },
      { title: "Solve practice exam questions under simulated timers", durationHours: 2.5, priority: "Medium" as const, category: "Learn" },
      { title: "Create flashcards for active recall study loops", durationHours: 1, priority: "Low" as const, category: "Personal" }
    ];
  }

  const estimatedRequiredHours = mockTasks.reduce((acc, t) => acc + t.durationHours, 0);
  const estimatedTotalTime = `${estimatedRequiredHours} hours`;
  const suggestedOrder = mockTasks.map(t => t.title);

  // Check feasibility
  const isFeasible = estimatedRequiredHours <= totalAvailableHours;
  const riskLevel = isFeasible ? "Low" : "High";
  const warningMessage = isFeasible ? "" : "Medium Risk: The task slightly exceeds available time. Suggesting optimized scope.";

  const dailyBreakdown: any[] = [];
  let currentDayIndex = 1;
  let currentDayTasks: any[] = [];
  let currentDayHours = 0;

  for (const t of mockTasks) {
    if (currentDayHours + t.durationHours > hours && currentDayTasks.length > 0) {
      dailyBreakdown.push({
        day: `Day ${currentDayIndex}`,
        description: `Focus on foundational tasks and core progression.`,
        tasks: [...currentDayTasks]
      });
      currentDayIndex++;
      currentDayTasks = [{ title: t.title, durationHours: t.durationHours }];
      currentDayHours = t.durationHours;
    } else {
      currentDayTasks.push({ title: t.title, durationHours: t.durationHours });
      currentDayHours += t.durationHours;
    }
  }
  if (currentDayTasks.length > 0) {
    dailyBreakdown.push({
      day: `Day ${currentDayIndex}`,
      description: `Complete remaining milestones, refine details, and finalize execution.`,
      tasks: currentDayTasks
    });
  }

  const taskUnderstandingObj = {
    goal: `Complete the core objectives of "${goal}" with maximum speed and clean component boundaries.`,
    deliverables: [
      "Modular dashboard interface and strategy planner controls.",
      "Dynamic execution list synchronization with client local storage.",
      "Robust state management and real-time validation checks."
    ],
    successCriteria: [
      "All active items are displayed and can be updated seamlessly.",
      "Page load time remains under 100ms with cached local data."
    ],
    constraints: [
      "No external database dependencies allowed; use browser storage.",
      "Strict layout isolation to prevent page scrolling flicker."
    ]
  };

  const executionPlannerObj = {
    step1: "Setup foundational folder structures, routing definitions, and state hooks.",
    step2: "Build out the interactive dashboard planner view with 4 compact decision cards.",
    step3: "Hook up state modification actions to verify instant checklist reactivity.",
    step4: "Perform clean-up on CSS margins, font tracking, and responsive grid layouts."
  };

  const riskAgentObj = {
    highRisks: [
      {
        problem: "Uncoordinated feature sprawl leading to bundle bloated lag.",
        impact: "Slower initial render times on touch devices and desktop panels.",
        mitigation: "Strict modularization of components and avoiding heavy custom libraries."
      }
    ],
    mediumRisks: [
      {
        problem: "State persistence sync conflicts when multiple tabs are open.",
        impact: "Out of sync checkbox status during concurrent execution.",
        mitigation: "Register a storage listener to auto-refresh state across browser frames."
      }
    ],
    lowRisks: [
      {
        problem: "Browser date picker discrepancies on legacy touch clients.",
        impact: "Mild styling misalignment on date selectors.",
        mitigation: "Standardize custom Tailwind inputs rather than default date overrides."
      }
    ]
  };

  const aiCoachObj = {
    todaysFocus: [
      "Establish the basic layout shell before diving into complex rendering.",
      "Check that state changes propagate instantly across the sidebar counts."
    ],
    avoidToday: [
      "Do not attempt to write complex background synchronization services.",
      "Avoid using separate custom CSS styles; keep all declarations inside utility classes."
    ],
    quickWin: [
      "Format the card borders with subtle cyan gradients to immediately lift UI premium feel."
    ],
    ifBehindSchedule: [
      "De-prioritize advanced transition animations and stick to standard fade cues."
    ]
  };

  const taskUnderstanding = `Deliver a complete implementation blueprint for "${goal}", establishing standard modular architecture patterns, component design, core integration layers, and automated cloud deployments.`;
  const optimizationOpportunities = [
    "Use existing scaffold boilerplates to skip initial setups",
    "Consolidate component layout configurations into a unified design system",
    "Pre-compile deployment profiles to speed up cloud releases"
  ];
  const recoveryPlan = isFeasible
    ? "Your schedule is well-aligned with the target. Stay focused on delivering key modules early to prevent late-stage testing compression."
    : "The raw estimation slightly runs hot against your available capacity. To address this, we compressed the task list to prioritize an MVP framework, combining multiple design layers and utilizing Tailwind utility presets to guarantee delivery on schedule.";

  const executionStrategy = isFeasible
    ? "Maintain steady pace following sequential execution targets. Start with interface components, integrate server-side connectors, and complete validation."
    : "Slight compression applied: Compress minor layout design cycles, reuse modular templates, and prioritize core business components to match the deadline.";
  
  const milestones = [
    `Milestone 1: Complete UI components and layouts (${Math.ceil(estimatedRequiredHours * 0.3)} hrs)`,
    `Milestone 2: Connect endpoints and synchronize local states (${Math.ceil(estimatedRequiredHours * 0.6)} hrs)`,
    `Milestone 3: Conduct production audit and deployment verification (${Math.ceil(estimatedRequiredHours * 0.1)} hrs)`
  ];
  
  const bufferTime = isFeasible ? "1.5 hours of strategy buffer" : "0.5 hours (extremely tight schedule)";

  return {
    totalAvailableHours,
    estimatedRequiredHours,
    riskLevel,
    isFeasible: true,
    warningMessage,
    taskUnderstanding,
    optimizationOpportunities,
    recoveryPlan,
    executionStrategy,
    orderedTasks: suggestedOrder,
    estimatedTime: estimatedTotalTime,
    milestones,
    bufferTime,
    dayByDaySchedule: dailyBreakdown,
    actionableTasks: mockTasks,
    // New planning blocks
    taskUnderstandingObj,
    executionPlannerObj,
    riskAgentObj,
    aiCoachObj,
    // Backward compatibility keys
    tasks: mockTasks,
    estimatedTotalTime,
    suggestedOrder,
    dailyBreakdown: dailyBreakdown,
    isFallback: true
  };
}

// REST Endpoint: Goal Planner Agent decomposition
app.post("/api/gemini/planner", async (req, res) => {
  const { goal, deadline, hoursPerDay, today } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  const hours = parseFloat(hoursPerDay) || 4;
  const todayStr = today || new Date().toISOString().split('T')[0];
  
  let totalAvailableHours = 28; // fallback 7 days * 4 hours
  let availableDays = 7;
  if (deadline) {
    const startDate = new Date(todayStr);
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    availableDays = diffDays > 0 ? diffDays : 0;
    totalAvailableHours = availableDays * hours;
  }

  const client = getGeminiClient();

  if (!client) {
    console.log("Gemini client not initialized. Using fallback mock for Planner Agent.");
    return res.json(getFallbackPlan(goal, hours, totalAvailableHours, availableDays));
  }

  try {
    const prompt = `You are the Execution Planner Agent of Momentum AI. You never infer the task from raw user text; the context has already been analyzed and structured below. Your only responsibility is to create the most practical execution plan that can actually be finished.

YOUR PHILOSOPHY:
- Users do not need perfect plans; they need plans they can actually finish.
- Focus strictly on deliverables.
- Break work ONLY into executable actions. Never write vague or generic tasks (e.g., BAD: "Work on report", "Write code"; GOOD: "Capture screenshots of homepage", "Annotate navigation issues", "Write Executive Summary").
- Respect the deadline and available hours.
- If the estimated work exceeds the available time, COMPRESS, MERGE, and PRIORITIZE. Never simply declare failure.
- Prefer completion over perfection.

INPUT CONTEXT:
Goal/Analyzed Task: ${goal}
Target Deadline: ${deadline || 'Not specified'}
Hours Per Day: ${hours} hours/day
Today's Date: ${todayStr}
Total Available Hours: ${totalAvailableHours} hours across ${availableDays} available days

Propose a complete, optimized schedule that fits perfectly.
Return the response strictly matching the schema.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Execution Planner Agent of Momentum AI. Your job is to generate practical, deliverable-focused execution plans with concrete tasks. You must return all output as structured JSON matching the requested schema. You must define four key planning cards: taskUnderstandingObj, executionPlannerObj, riskAgentObj, and aiCoachObj. Rules: Every statement must be a single clean sentence; never return paragraphs longer than one sentence; prefer clear bullet points over prose; maximum of 6 bullets per section; each step in executionPlannerObj must contain exactly one actionable sentence.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "totalAvailableHours",
            "estimatedRequiredHours",
            "riskLevel",
            "isFeasible",
            "warningMessage",
            "taskUnderstanding",
            "optimizationOpportunities",
            "recoveryPlan",
            "executionStrategy",
            "orderedTasks",
            "estimatedTime",
            "milestones",
            "bufferTime",
            "dayByDaySchedule",
            "actionableTasks",
            "taskUnderstandingObj",
            "executionPlannerObj",
            "riskAgentObj",
            "aiCoachObj"
          ],
          properties: {
            totalAvailableHours: {
              type: Type.NUMBER,
              description: "Total available hours computed as availableDays * hoursPerDay"
            },
            estimatedRequiredHours: {
              type: Type.NUMBER,
              description: "Total sum of estimated hours of all tasks"
            },
            riskLevel: {
              type: Type.STRING,
              description: "Must be exactly 'Low', 'Medium', 'High', or 'Critical'."
            },
            isFeasible: {
              type: Type.BOOLEAN,
              description: "True if estimatedRequiredHours <= totalAvailableHours (or after compression fits), false otherwise"
            },
            warningMessage: {
              type: Type.STRING,
              description: "Positive strategic warning or focus advice."
            },
            taskUnderstanding: {
              type: Type.STRING,
              description: "Breakdown of the specific deliverables required."
            },
            optimizationOpportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Acceleration techniques, boilerplates, or templates to bypass initial setups."
            },
            recoveryPlan: {
              type: Type.STRING,
              description: "How to handle schedule constraints using an MVP approach."
            },
            executionStrategy: {
              type: Type.STRING,
              description: "Practical execution summary detailing how the plan was structured, compressed, or prioritised to guarantee completion."
            },
            orderedTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exact sequential list of tasks titles in ordered execution order."
            },
            estimatedTime: {
              type: Type.STRING,
              description: "Total estimated duration as a clear string (e.g., '14.5 hours')."
            },
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key milestones with target focus and duration."
            },
            bufferTime: {
              type: Type.STRING,
              description: "Allocated safety margin or buffer time (e.g. '2.5 hours buffer')."
            },
            dayByDaySchedule: {
              type: Type.ARRAY,
              description: "Day-wise task assignments respecting the daily limit.",
              items: {
                type: Type.OBJECT,
                required: ["day", "description", "tasks"],
                properties: {
                  day: { type: Type.STRING, description: "E.g. 'Day 1', 'Day 2'" },
                  description: { type: Type.STRING, description: "Milestone for this day" },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["title", "durationHours"],
                      properties: {
                        title: { type: Type.STRING, description: "Highly concrete task name (e.g. 'Capture website screenshots')" },
                        durationHours: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            actionableTasks: {
              type: Type.ARRAY,
              description: "List of all concrete tasks.",
              items: {
                type: Type.OBJECT,
                required: ["title", "durationHours", "priority", "category"],
                properties: {
                  title: { type: Type.STRING, description: "Concrete, executable task (e.g. 'Annotate navigation issues')" },
                  durationHours: { type: Type.NUMBER },
                  priority: { type: Type.STRING, description: "High, Medium, or Low" },
                  category: { type: Type.STRING }
                }
              }
            },
            taskUnderstandingObj: {
              type: Type.OBJECT,
              required: ["goal", "deliverables", "successCriteria", "constraints"],
              properties: {
                goal: { type: Type.STRING, description: "Exactly 1 bullet point defining the primary planning goal." },
                deliverables: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 to 5 key deliverables as short bullet points." },
                successCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2 to 4 success indicators as short bullet points." },
                constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2 to 4 critical limitations/constraints as short bullet points." }
              }
            },
            executionPlannerObj: {
              type: Type.OBJECT,
              required: ["step1", "step2", "step3", "step4"],
              properties: {
                step1: { type: Type.STRING, description: "STEP 1: exactly one actionable sentence." },
                step2: { type: Type.STRING, description: "STEP 2: exactly one actionable sentence." },
                step3: { type: Type.STRING, description: "STEP 3: exactly one actionable sentence." },
                step4: { type: Type.STRING, description: "STEP 4: exactly one actionable sentence." }
              }
            },
            riskAgentObj: {
              type: Type.OBJECT,
              required: ["highRisks", "mediumRisks", "lowRisks"],
              properties: {
                highRisks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["problem", "impact", "mitigation"],
                    properties: {
                      problem: { type: Type.STRING, description: "Single-sentence problem statement." },
                      impact: { type: Type.STRING, description: "Single-sentence impact description." },
                      mitigation: { type: Type.STRING, description: "Single-sentence mitigation plan." }
                    }
                  }
                },
                mediumRisks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["problem", "impact", "mitigation"],
                    properties: {
                      problem: { type: Type.STRING, description: "Single-sentence problem statement." },
                      impact: { type: Type.STRING, description: "Single-sentence impact description." },
                      mitigation: { type: Type.STRING, description: "Single-sentence mitigation plan." }
                    }
                  }
                },
                lowRisks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["problem", "impact", "mitigation"],
                    properties: {
                      problem: { type: Type.STRING, description: "Single-sentence problem statement." },
                      impact: { type: Type.STRING, description: "Single-sentence impact description." },
                      mitigation: { type: Type.STRING, description: "Single-sentence mitigation plan." }
                    }
                  }
                }
              }
            },
            aiCoachObj: {
              type: Type.OBJECT,
              required: ["todaysFocus", "avoidToday", "quickWin", "ifBehindSchedule"],
              properties: {
                todaysFocus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2 to 3 priorities for today as short bullets." },
                avoidToday: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2 to 3 pitfalls to avoid as short bullets." },
                quickWin: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 1 to 2 rapid high-yield wins as short bullets." },
                ifBehindSchedule: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 1 to 2 fallback measures if behind schedule as short bullets." }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        tasks: parsed.actionableTasks || [],
        estimatedTotalTime: parsed.estimatedTime || `${parsed.estimatedRequiredHours} hours`,
        suggestedOrder: parsed.orderedTasks || (parsed.actionableTasks || []).map((t: any) => t.title),
        dailyBreakdown: parsed.dayByDaySchedule || [],
        isFallback: false
      });
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error: any) {
    console.error("Planner Agent Error. Falling back gracefully to custom mock plan:", error);
    return res.json({
      ...getFallbackPlan(goal, hours, totalAvailableHours, availableDays),
      error: error.message
    });
  }
});

// Setup Express and Vite Middleware (integrated client-server structure)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Momentum AI Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
