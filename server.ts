import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY env variable is not set. Gemini features will run in offline simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Core API: Analyze Audit Observation using Gemini AI
app.post("/api/gemini/analyze-audit", async (req, res) => {
  const { category, scoreItem, observation, extraContext } = req.body;

  if (!observation) {
    return res.status(400).json({ error: "Observation is required for analysis." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return high-quality mock analysis if API key is not configured
    const simulatedResponse = {
      isGap: true,
      gapCategory: category === "PPE" ? "Safety" : "Standard not followed",
      riskLevel: "Medium",
      rootCause: `[시뮬레이션 분석] 작업자가 표준 가이드(SWI/OPL)를 정확하게 인지하지 못했거나, 현장 모니터링 과정에서 피드백 누락이 발생함. (${observation})`,
      immediateAction: "작업 즉시 중단 후 올바른 표준 방법 재교육 및 현장 즉각 시정 조치 적용",
      correctiveAction: {
        action: `${scoreItem || "해당"} 세부 표준 공정(SWI) 개정 검토 및 5S 작업대 레이아웃 재배치`,
        type: "Standard Update",
        owner: "Supervisor",
        dueDays: 7,
        effectivenessCriteria: "재평가(Re-audit) 시 해당 표준 작업 순서 및 PPE 착용률 100% 만족 여부 측정"
      }
    };
    return res.json(simulatedResponse);
  }

  try {
    const prompt = `
      You are an expert manufacturing Quality and Safety Lead Auditor specializing in Doosan Bobcat's Standard Work Compliance Audit.
      Analyze the following observation made on the shop floor during an audit to generate a highly professional gap analysis, root cause, immediate action, and a structured corrective action plan.

      [Audit Information]
      - Audit Area/Section: ${category || "General"}
      - Audited Checklist Item: ${scoreItem || "Standard Compliance"}
      - Auditor's Raw Observation: "${observation}"
      - Additional Context: ${JSON.stringify(extraContext || {})}

      [Global Standard Reference (Doosan Bobcat SW Audit Guidance)]:
      - PPE: Ensure required PPE is worn correctly. Immediate action for violations.
      - Work Sequence: Check if SWIP quantity matches Standard Work Chart (SWC), sequence matches SWI, operator walk path is consistent.
      - Key Points: Confirm operator complies with pre-defined key points (especially safety and quality).
      - Standard Time: Verify cycle time with 5% tolerance. At least 2 full cycles measured.
      - Findings classification: Safety, Quality, Standard not followed, or Improvement Idea.

      Please output a JSON response matching the schema defined. Be specific, realistic, and write the analysis, immediate actions, and corrective actions in Korean, keeping the tone highly professional, precise, and objective.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an automated audit assistant. Always return response in valid JSON strictly matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isGap: { type: Type.BOOLEAN, description: "True if a non-conformance or improvement gap is identified, otherwise false." },
            gapCategory: { type: Type.STRING, description: "Classification of findings. Choose from: 'Safety', 'Quality', 'Standard not followed', 'Improvement Idea'." },
            riskLevel: { type: Type.STRING, description: "Risk Level of this finding. Choose from: 'High', 'Medium', 'Low'." },
            rootCause: { type: Type.STRING, description: "Deep analysis of why this gap occurred based on the observation." },
            immediateAction: { type: Type.STRING, description: "Immediate countermeasure taken on the shift to address the immediate risk." },
            correctiveAction: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: "Detailed permanent corrective action description." },
                type: { type: Type.STRING, description: "Type of action (e.g., 'Training', 'Update SW Docs', '5S Layout Improvement', 'Tool Request')." },
                owner: { type: Type.STRING, description: "Role responsible. Choose from: 'Supervisor', 'Lead', 'ME', 'Quality', 'EHS', 'Operator'." },
                dueDays: { type: Type.INTEGER, description: "Target days from today to complete (e.g. 3, 7, 14, 30)." },
                effectivenessCriteria: { type: Type.STRING, description: "How to evaluate the effectiveness of this action during re-audit." }
              },
              required: ["action", "type", "owner", "dueDays", "effectivenessCriteria"]
            }
          },
          required: ["isGap", "gapCategory", "riskLevel", "rootCause", "immediateAction", "correctiveAction"]
        }
      }
    });

    const textResult = response.text || "{}";
    const data = JSON.parse(textResult.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to analyze audit using Gemini API.", details: error.message });
  }
});

// 2. Sample/Standard Reference Master Data for the App
app.get("/api/standards", (req, res) => {
  res.json({
    ppe: {
      title: "Conformity to PPE (PPE 준수여부)",
      items: [
        { id: "ppe_1", target: "Is the Operator properly equipped with PPE? (안전보호구 완벽 착용 여부)" }
      ]
    },
    sequence: {
      title: "Adherence to Work Sequence (작업 순서 준수)",
      items: [
        { id: "seq_1", target: "Is the SWIP quantity maintained as defined? (표준 재공 수량 유지 여부)" },
        { id: "seq_2", target: "Is the work sequence followed as defined? (정해진 작업 순서 준수 여부)" },
        { id: "seq_3", target: "Are the operator moves consistent with the standard? (작업자 동선 일치 여부)" }
      ]
    },
    keyPoints: {
      title: "Adherence to Key Points (주요 포인트 준수)",
      items: [
        { id: "kp_1", target: "Pre-defined and specific Key points are followed from SWI/OPL (SWI/OPL에 명시된 사전 정의된 주요 포인트 준수)" }
      ]
    },
    standardTime: {
      title: "Adherence to Standard Time (표준시간 준수 및 사이클 타임 측정)",
      items: [
        { id: "st_1", target: "Verify the operator can complete the work within standard time with 5% tolerance (5% 허용오차 내에서 표준시간 이내 작업 완료 가능 여부)" }
      ]
    }
  });
});

// Initialize Vite server for dev or serve static files in prod
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite();
