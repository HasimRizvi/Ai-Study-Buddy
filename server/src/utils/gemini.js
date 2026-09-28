/**
 * Google Gemini AI Service Layer
 * ------------------------------
 * Sends study material to the Google Gemini model and returns structured
 * JSON for summaries, flashcards, quizzes and study plans.
 *
 * If no GEMINI_API_KEY is configured - or the live API call fails for any
 * reason - the service transparently falls back to the built-in Offline
 * Demo Engine so the application never breaks.
 */

const demo = require('./demoEngine');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genaiClient = null;
let geminiBroken = false;

const hasGemini = () => Boolean(process.env.GEMINI_API_KEY) && !geminiBroken;

const getClient = async () => {
  if (!genaiClient) {
    const { GoogleGenAI } = require('@google/genai');
    genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genaiClient;
};

const extractJson = (raw) => {
  if (!raw) throw new Error('Empty response from Gemini');
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const first = text.search(/[[{]/);
  if (first > 0) text = text.slice(first);
  const last = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
  if (last > 0) text = text.slice(0, last + 1);
  return JSON.parse(text);
};

const callGemini = async (prompt) => {
  const client = await getClient();
  const response = await client.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction:
        'You are an expert academic tutor for a college student. You always reply with strictly valid JSON and nothing else. No markdown fences, no explanation outside the JSON.',
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });
  return response.text;
};

const run = async (prompt, fallback) => {
  if (!hasGemini()) {
    const result = fallback();
    return { ...result, generatedBy: 'demo' };
  }
  try {
    const parsed = extractJson(await callGemini(prompt));
    return { ...parsed, generatedBy: 'gemini' };
  } catch (error) {
    geminiBroken = true;
    console.warn(`[AI] Gemini unavailable (${error.message}). Switched to Offline Demo Engine.`);
    const result = fallback();
    return { ...result, generatedBy: 'demo' };
  }
};

const truncate = (text, max = 12000) =>
  text.length > max ? `${text.slice(0, max)}\n\n[... content truncated for AI processing ...]` : text;

const generateSummary = (title, subject, content) =>
  run(
    `Summarise the following study material for a college student preparing for an exam.
Title: ${title}
Subject: ${subject}
Content:
${truncate(content)}

Return JSON in exactly this shape:
{
  "summary": "A clear 4 to 6 sentence revision summary in plain text",
  "keyPoints": ["5 to 7 short exam-important bullet points"]
}`,
    () => demo.summarise(content)
  );

const generateFlashcards = (title, subject, content, count = 8) =>
  run(
    `Create ${count} revision flashcards (active recall) from the study material below.
Title: ${title}
Subject: ${subject}
Content:
${truncate(content)}

Return JSON in exactly this shape:
{
  "cards": [ { "question": "short question", "answer": "concise factual answer", "difficulty": "Easy" | "Medium" | "Hard" } ]
}`,
    () => ({ cards: demo.buildFlashcards(content, count) })
  );

const generateQuiz = (title, subject, content, count = 5) =>
  run(
    `Create ${count} multiple-choice exam questions from the study material below.
Title: ${title}
Subject: ${subject}
Content:
${truncate(content)}

Return JSON in exactly this shape:
{
  "questions": [ { "question": "...", "options": ["exactly 4 options"], "correctAnswer": "must match one option exactly", "explanation": "why this is correct" } ]
}`,
    () => ({ questions: demo.buildQuiz(content, count) })
  );

const generateStudyPlan = ({ subject, examDate, availableHoursPerDay, weakAreas, content }) => {
  const days = Math.max(1, Math.ceil((new Date(examDate) - Date.now()) / 86400000));
  return run(
    `Create a personalised day-by-day study plan.
Subject: ${subject}
Exam date: ${examDate}
Days remaining: ${days}
Hours available per day: ${availableHoursPerDay}
Weak areas: ${weakAreas && weakAreas.length ? weakAreas.join(', ') : 'not specified'}
Relevant material:
${truncate(content || '', 6000)}

Return JSON in exactly this shape:
{
  "studyPlan": "A full multi-line text plan with milestones and exam-day rules",
  "dailyTasks": [ { "day": 1, "focus": "topic focus", "tasks": ["task 1","task 2","task 3"], "duration": "2 hours" } ]
}`,
    () => demo.buildStudyPlan({ subject, examDate, availableHoursPerDay, weakAreas, content })
  );
};

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
  engineStatus: () => ({
    engine: hasGemini() ? 'gemini' : 'demo',
    model: hasGemini() ? MODEL : 'Offline Demo Engine (rule-based)',
    live: hasGemini(),
  }),
  resetEngine: () => {
    geminiBroken = false;
  },
};
