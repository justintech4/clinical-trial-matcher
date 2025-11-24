// Mock LLM extraction used for dev/demo.
// In prod, you'd rely on real LLM extraction.

function getMockExtraction() {
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

module.exports = { getMockExtraction };
