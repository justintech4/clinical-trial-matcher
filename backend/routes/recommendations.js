const express = require("express");
const router = express.Router();

const { extractFromTranscript } = require("../services/llmService");
const { searchClinicalTrials } = require("../services/clinicalTrialsService");

router.post("/", async (req, res, next) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "transcript is required" });
    }

    const extracted = await extractFromTranscript(transcript);
    const trials = await searchClinicalTrials(extracted);

    res.json({ extracted, trials });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
