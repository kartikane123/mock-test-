import { GoogleGenAI, Type } from "@google/genai";
import { Question, TestAnalysis, TestConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMockTest(config: TestConfig): Promise<Question[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Using Pro model for high accuracy as requested
      contents: `You are an expert ${config.subject} educator. Generate a super accurate, highly conceptual mock test for the following chapters: ${config.chapters.join(", ")}.
The difficulty level should be ${config.difficulty}.
Number of questions: ${config.numQuestions}.

CRITICAL REQUIREMENTS:
1. Every question must be 100% scientifically/mathematically correct with zero ambiguity.
2. USE LATEX for all math and chemistry formulas. Use $...$ for inline and $$...$$ for block formulas (e.g., $\\text{H}_2\\text{O}$, $E=mc^2$).
3. Include a "source" for each question referencing standard educational boards (e.g., NCERT, AP, A-Level) or competitive exams (e.g., JEE, NEET, SAT).
4. The options must be plausible, but only one correct.
5. The explanation must be pedagogically sound and detailed.

Format the output strictly as a JSON array of questions, adhering to the requested schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "Array of generated questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING, description: "Text of the question, use LaTeX for formulas" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options, use LaTeX if needed"
                  },
                  correctOptionIndex: {
                    type: Type.INTEGER,
                    description: "Index of the correct option (0-3)"
                  },
                  explanation: { type: Type.STRING, description: "Detailed explanation with LaTeX support" },
                  source: { type: Type.STRING, description: "The educational source of the question" }
                },
                required: ["questionText", "options", "correctOptionIndex", "explanation", "source"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(text);
    return parsed.questions.map((q: any, i: number) => ({
      ...q,
      id: `q_${Date.now()}_${i}`
    }));
  } catch (error) {
    console.error("Failed to generate test:", error);
    throw error;
  }
}

export async function generateTestAnalysis(
  questions: Question[],
  answers: Record<string, number>,
  subject: string
): Promise<TestAnalysis> {
  const performanceData = questions.map(q => {
    const attemptedOption = answers[q.id];
    const isCorrect = attemptedOption === q.correctOptionIndex;
    const userAnsText = attemptedOption !== undefined ? q.options[attemptedOption] : "Unattempted";
    return {
      question: q.questionText,
      correctAnswer: q.options[q.correctOptionIndex],
      userAnswer: userAnsText,
      isCorrect,
      explanation: q.explanation
    };
  });

  const prompt = `As an expert ${subject} educator and analyst, deeply analyze the student's mock test performance.
Here is the performance data for the questions:
${JSON.stringify(performanceData, null, 2)}

Provide a highly detailed and actionable personalized analysis. Identify the core conceptual weaknesses based on their incorrect answers, highlight their strong areas, and provide actionable tips for improvement. Output strictly as JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strongAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedFeedback: { type: Type.STRING }
          },
          required: ["strongAreas", "weakAreas", "actionableTips", "detailedFeedback"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as TestAnalysis;
  } catch (error) {
    console.error("Failed to generate test analysis:", error);
    throw error;
  }
}
