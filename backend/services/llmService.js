const OpenAI = require("openai");
const { getMockExtraction } = require("../llm/mockExtraction");
const config = require("../config/env");
const USE_MOCK_LLM = config.useMockLLM;
const OPENAI_API_KEY = config.openaiApiKey;

let openai = null;
if (!USE_MOCK_LLM && OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

async function extractFromTranscript(transcript) {
  if (USE_MOCK_LLM || !openai) {
    console.log("Using mock LLM extraction");
    return getMockExtraction();
  }

  const systemPrompt =
    "You are a medical NLP assistant. You read a doctor patient conversation transcript and extract relevant clinical information. " +
    "You must respond with a single valid JSON object only, with no extra text before or after.";

  const userPrompt = `
Extract the following fields from the transcript.

Return JSON with this exact structure:

{
  "patient": {
    "age": number | null,
    "sex": "male" | "female" | "other" | null,
    "city": string | null,
    "country": string | null,
    "comorbidities": string[],
    "performanceStatus": string | null,
    "smokingHistory": {
      "status": "never" | "current" | "former" | null,
      "packYears": number | null,
      "yearsSinceQuit": number | null
    }
  },
  "diagnosis": {
    "primaryCondition": string | null,
    "histology": string | null,
    "stage": string | null,
    "biomarkers": {
      "EGFR": string | null,
      "ALK": string | null,
      "PD-L1": string | null
    }
  },
  "trialPreferences": {
    "locationPreference": string | null,
    "maxTravel": string | null,
    "desiredPhases": string[],
    "avoidConditions": string[]
  }
}

If something is not mentioned, set it to null or an empty array. Do not invent facts.

Transcript:
${transcript}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI JSON. Raw content:", content);
      throw parseErr;
    }

    return parsed;
  } catch (err) {
    console.error("Error in OpenAI extraction, falling back to mock:", err.message);
    return getMockExtraction();
  }
}

module.exports = {
  extractFromTranscript
};
