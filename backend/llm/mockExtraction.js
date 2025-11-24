// Mock LLM extraction used for dev/demo mode.
function getMockExtraction() {
  return {
    patient: {
      age: 55,
      sex: "female",
      city: "Chicago",
      country: "United States",
      comorbidities: ["hypertension (controlled)"],
      performanceStatus: "ECOG 1",
      smokingHistory: {
        status: "never",
        packYears: 0,
        yearsSinceQuit: null
      }
    },
    diagnosis: {
      primaryCondition: "breast cancer",
      histology: "invasive ductal carcinoma",
      stage: "II",
      biomarkers: {
        ER: "positive",
        PR: "positive",
        HER2: "negative"
      }
    },
    trialPreferences: {
      locationPreference: "Chicago area",
      maxTravel: "local",
      desiredPhases: ["Phase 2", "Phase 3"],
      avoidConditions: []
    }
  };
}

module.exports = { getMockExtraction };
