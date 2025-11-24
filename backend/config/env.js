// Centralize environment variables
require("dotenv").config();

const config = {
  port: process.env.PORT || 4000,
  useMockLLM: process.env.USE_MOCK_LLM === "true", // used for dev/demo
  openaiApiKey: process.env.OPENAI_API_KEY || null, // required in prod for real LLM
  nodeEnv: process.env.NODE_ENV || "development"
};

module.exports = config;
