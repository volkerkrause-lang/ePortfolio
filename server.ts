import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-build",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. AI Reflection Refiner (Gibbs Cycle + GMC Good Medical Practice)
  app.post("/api/gemini/refine-reflection", async (req, res) => {
    try {
      const { title, rawNotes, category, curriculumLevel } = req.body;
      const ai = getAiClient();

      const systemPrompt = `You are an expert UK Paediatric Educational Supervisor and RCPCH Progress+ portfolio mentor.
Your task is to take a trainee doctor's rough clinical notes and transform them into a comprehensive, professional, GMC-compliant reflective practice note structured around the Gibbs Reflective Cycle.

IMPORTANT RULES:
1. Ensure STRICT patient anonymisation (NO patient names, hospital numbers, specific bed numbers, or exact birth dates).
2. Align the reflection to the RCPCH Progress+ curriculum standards for ${curriculumLevel || "Level 1 (Core ST1-ST3)"}.
3. Structure the output into clear Gibbs Reflective Cycle sections:
   - Description (What happened?)
   - Feelings (Thoughts and emotional impact)
   - Evaluation (What worked well and what was challenging?)
   - Analysis (Sense-making, clinical evidence, guidelines, human factors)
   - Conclusion (What else could have been done?)
   - Action Plan (Specific SMART steps for future clinical practice)
   - Key Learning Points (High-yield bullet points)
   - Recommended Curriculum Tags (e.g. LO1, LO2, LO4, LO7)

Return valid JSON adhering to this structure:
{
  "title": "string",
  "description": "string",
  "feelings": "string",
  "evaluation": "string",
  "analysis": "string",
  "conclusion": "string",
  "actionPlan": "string",
  "learningPoints": "string",
  "recommendedTags": ["LO1", "LO2"]
}`;

      const userPrompt = `Category: ${category || "Clinical Incident / Case"}
Title: ${title || "Clinical Reflection"}
Trainee's Rough Notes / Case Summary:
${rawNotes}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Reflection refine error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to refine reflection" });
    }
  });

  // 2. AI Curriculum Auto-Tagger
  app.post("/api/gemini/curriculum-tagger", async (req, res) => {
    try {
      const { text, type } = req.body;
      const ai = getAiClient();

      const systemPrompt = `You are an expert RCPCH Progress+ curriculum advisor.
Given a clinical case or assessment summary, analyze which of the 11 RCPCH Learning Outcomes (LO1 to LO11) are most directly evidenced.

The 11 Outcomes:
- LO1: Professional values and behaviours
- LO2: Professional skills: Communication
- LO3: Professional skills: Procedures & clinical examination
- LO4: Professional skills: Patient management
- LO5: Health promotion and illness prevention
- LO6: Leadership and team working
- LO7: Patient safety, clinical governance & infection control
- LO8: Quality improvement (QIP)
- LO9: Safeguarding
- LO10: Education and training
- LO11: Research and scholarship

Return JSON:
{
  "recommendedTags": ["LO3", "LO4"],
  "rationale": "Explanation for why these specific LOs are evidenced",
  "suggestedKeyCapabilities": ["Specific capability statement 1", "Specific capability statement 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Encounter Type: ${type}\n\nClinical Content:\n${text}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Curriculum tagger error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to tag curriculum" });
    }
  });

  // 3. AI Anonymisation & GMC Compliance Guardian
  app.post("/api/gemini/anonymise-check", async (req, res) => {
    try {
      const { text } = req.body;
      const ai = getAiClient();

      const systemPrompt = `You are a GMC and Caldicott Guardian medical data anonymisation specialist for UK Paediatric portfolios.
Review the provided text for any identifiable or potentially identifiable patient, family, or colleague data (e.g. NHS numbers, hospital numbers, specific dates of birth, uncommon names, specific ward numbers, identifiable rare case combinations).

Provide:
1. isFullyAnonymised (boolean)
2. flaggedItems: array of items that could breach patient confidentiality
3. sanitizedText: the text with all identifying details replaced with standard anonymised placeholders (e.g., "a 3-month-old infant", "on a recent night shift", "at a district general hospital")
4. gmcAdvice: brief reassurance/guidance.

Return JSON:
{
  "isFullyAnonymised": boolean,
  "flaggedItems": ["string"],
  "sanitizedText": "string",
  "gmcAdvice": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: text,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Anonymise check error:", error);
      res.status(500).json({ success: false, error: error.message || "Anonymisation check failed" });
    }
  });

  // 4. AI ARCP Gap Audit & Portfolio Advisor
  app.post("/api/gemini/arcp-audit", async (req, res) => {
    try {
      const { portfolioSummary } = req.body;
      const ai = getAiClient();

      const systemPrompt = `You are a Senior Head of Paediatric School and ARCP Panel Chair evaluating an RCPCH Progress+ portfolio.
Review the staged evidence across all 11 Progress+ Learning Outcomes, WPBAs count, reflections, logbooks, mandatory certificates, and PDP goals.

Provide a constructive, actionable pre-ARCP readiness report:
- readinessScore: number (0-100)
- predictedOutcome: "Outcome 1 (Satisfactory progress)" | "Outcome 2 (Development of specific competences needed)" | "Outcome 5 (Incomplete evidence)"
- keyStrengths: array of strings
- criticalGaps: array of strings (highlighting under-evidenced domains like Safeguarding LO9, QIP LO8, or Education LO10)
- recommendedNextActions: array of specific WPBAs or reflections to stage before panel review
- educationalSupervisorReportSummary: a concise drafted paragraph that an Educational Supervisor could use to summarize the trainee's performance.

Return JSON adhering to the structure above.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: JSON.stringify(portfolioSummary, null, 2),
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("ARCP audit error:", error);
      res.status(500).json({ success: false, error: error.message || "ARCP audit failed" });
    }
  });

  // 5. AI SMART PDP Goal Generator
  app.post("/api/gemini/smart-pdp", async (req, res) => {
    try {
      const { topic, category, targetLevel } = req.body;
      const ai = getAiClient();

      const systemPrompt = `You are an RCPCH Educational Supervisor creating high-quality, measurable SMART Personal Development Plan (PDP) goals for a paediatric trainee (${targetLevel || "ST2"}).

Return JSON:
{
  "title": "Concise goal title",
  "smartObjective": "Specific, Measurable, Achievable, Relevant, Time-bound statement",
  "actionsToAchieve": "Detailed step-by-step actions and clinical learning activities",
  "evidenceToDemonstrate": "Specific portfolio evidence required to sign off (e.g. 2x DOPS, 1x CbD, QIP report)",
  "curriculumTags": ["LO3", "LO4"],
  "recommendedMonthsToComplete": 3
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Topic/Area for improvement: ${topic}\nCategory: ${category}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("SMART PDP error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate PDP goal" });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RCPCH ePortfolio Staging Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
