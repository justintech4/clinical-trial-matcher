require("dotenv").config();

//  centralize configs
const config = {
  port: process.env.PORT || 4000,
  useMockLLM: process.env.USE_MOCK_LLM === "true",
  openaiApiKey: process.env.OPENAI_API_KEY || null
};

module.exports = config;
