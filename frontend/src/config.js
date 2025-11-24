const isProd = process.env.NODE_ENV === "production";

export const API_BASE_URL = isProd
  ? "https://clinical-trial-matcher-backend.onrender.com"
  : "http://localhost:4000";
