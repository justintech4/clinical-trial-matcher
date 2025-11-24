require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * POST /api/recommendations
 * Body: { transcript: string }
 */
app.post("/api/recommendations", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "transcript is required" });
    }

    // 1. Extract structured data using LLM (stub for now)
    const extracted = await extractFromTranscriptWithLLM(transcript);

    // 2. Use extracted data to search ClinicalTrials.gov
    const trials = await searchClinicalTrials(extracted);

    res.json({ extracted, trials });
  } catch (err) {
    console.error("Error in /api/recommendations", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Stub: LLM extraction
 * For now return a hardcoded object that matches our sample transcript.
 * Later we will replace this with a real OpenAI call.
 */
async function extractFromTranscriptWithLLM(transcript) {
  return {
    patient: {
      age: 62,
      sex: "female",
      city: "Chicago",
      country: "United States",
      comorbidities: ["hypertension (controlled)", "mild asthma"],
      performanceStatus: "ECOG 1",
      smokingHistory: {
        status: "former",
        packYears: 30,
        yearsSinceQuit: 5
      }
    },
    diagnosis: {
      primaryCondition: "non small cell lung cancer",
      histology: "adenocarcinoma",
      stage: "IIIA",
      biomarkers: {
        EGFR: "negative",
        ALK: "negative",
        "PD-L1": "60%"
      }
    },
    trialPreferences: {
      locationPreference: "Chicago area",
      maxTravel: "local",
      desiredPhases: ["Phase 2", "Phase 3"],
      avoidConditions: [
        "trials that exclude mild asthma",
        "trials that exclude controlled hypertension"
      ]
    }
  };
}

/**
 * Search ClinicalTrials.gov API v2 using extracted info.
 * This version is intentionally broad so it reliably finds trials.
 */
async function searchClinicalTrials(extracted) {
  // Prefer the extracted primary condition but default to something broad
  const condition = extracted?.diagnosis?.primaryCondition || "lung cancer";

  const params = new URLSearchParams();
  params.append("query.cond", condition);
  params.append("filter.overallStatus", "NOT_YET_RECRUITING,RECRUITING");
  params.append("pageSize", "10");
  params.append(
    "fields",
    [
      "NCTId",
      "BriefTitle",
      "OverallStatus",
      "Phase",
      "Condition",
      "LocationCity",
      "LocationCountry",
      "BriefSummary"
    ].join(",")
  );

  const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;
  console.log("ClinicalTrials.gov URL:", url);

  const response = await axios.get(url);
  const data = response.data;
  console.log("totalCount from API:", data.totalCount);

  const studies = data?.studies || [];

  const trials = studies.map((study) => {
    const protocol = study.protocolSection || {};
    const idModule = protocol.identificationModule || {};
    const statusModule = protocol.statusModule || {};
    const conditionsModule = protocol.conditionsModule || {};
    const contactsModule = protocol.contactsLocationsModule || {};
    const descriptionModule = protocol.descriptionModule || {};

    const nctId = idModule.nctId || null;
    const title = idModule.briefTitle || "Untitled Study";
    const overallStatus = statusModule.overallStatus || "";
    const phase = statusModule.phase || "";
    const conditions = conditionsModule.conditions || [];

    let locationSummary = "";
    const locations = contactsModule.locations || [];
    if (locations.length > 0) {
      const loc = locations[0];
      const city = loc.city || "";
      const country = loc.country || "";
      locationSummary = [city, country].filter(Boolean).join(", ");
    }

    const briefSummary = descriptionModule.briefSummary || "";

    return {
      nctId,
      title,
      overallStatus,
      phase,
      conditions,
      locationsSummary: locationSummary,
      briefSummary,
      url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : null
    };
  });

  return trials;
}

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
