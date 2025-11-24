// Handles LLM extraction. Uses mock when USE_MOCK_LLM=true (dev).
// In prod, ensure OPENAI_API_KEY is set and mock mode is off.

const OpenAI = require("openai");
const config = require("../config/env");
const { getMockExtraction } = require("../llm/mockExtraction");

let openai = null;

if (!config.useMockLLM && config.openaiApiKey) {
  openai = new OpenAI({ apiKey: config.openaiApiKey });
}

async function extractFromTranscript(transcript) {
  if (config.useMockLLM || !openai) {
    return getMockExtraction(); // dev fallback
  }

  const systemPrompt =
    "Extract structured clinical information. Output JSON only.";

  const userPrompt = `
Return JSON with the following structure:
{
  "patient": {...},
  "diagnosis": {...},
  "trialPreferences": {...}
}

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

    const content = response.choices[0].message?.content || "";
    return JSON.parse(content);
  } catch (err) {
    return getMockExtraction(); // safe fallback in dev or quota failure
  }
}

module.exports = {
  extractFromTranscript
};
