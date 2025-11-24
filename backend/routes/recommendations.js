// Main API endpoint: transcript in -> extracted data + trial matches out.

const express = require("express");
const router = express.Router();

const { extractFromTranscript } = require("../services/llmService");
const { searchClinicalTrials } = require("../services/clinicalTrialsService");

router.post("/", async (req, res, next) => {
  try {
    const { transcript } = req.body;

    //  handle no transcript provided
    if (!transcript) {
      return res.status(400).json({ error: "transcript is required" });
    }

    //  retrieve extracted fields from transcript
    const extracted = await extractFromTranscript(transcript);
    //  retrieve clinical trials based on extracted fields
    const trials = await searchClinicalTrials(extracted);

    res.json({ extracted, trials });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
