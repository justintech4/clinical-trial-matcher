// Talks to ClinicalTrials.gov and returns only the fields used by the frontend.

const axios = require("axios");

async function searchClinicalTrials(extracted) {
  const primaryCondition = extracted?.diagnosis?.primaryCondition;
  if (!primaryCondition) {
    return [];
  }

  const stage = extracted?.diagnosis?.stage;
  const histology = extracted?.diagnosis?.histology;
  const desiredPhases = extracted?.trialPreferences?.desiredPhases || [];
  const phaseTerms = desiredPhases.join(" ");

  // Build a richer condition query using stage + histology if present.
  let richConditionQuery = primaryCondition;
  if (stage) richConditionQuery += ` ${stage}`;
  if (histology) richConditionQuery += ` ${histology}`;

  // Helper used for both "rich" and fallback queries.
  async function fetchTrials(conditionQuery, includePhaseTerms) {
    const params = new URLSearchParams();
    params.append("query.cond", conditionQuery);
    if (includePhaseTerms && phaseTerms) {
      params.append("query.term", phaseTerms);
    }
    params.append("filter.overallStatus", "NOT_YET_RECRUITING,RECRUITING");
    params.append("pageSize", "10");

    const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;

    const response = await axios.get(url);
    const data = response.data;
    return data.studies || [];
  }

  // 1) Try a more specific query first (condition + stage/histology + phases).
  let studies = [];
  try {
    studies = await fetchTrials(richConditionQuery, true);
  } catch (err) {
    console.error("Error in rich query:", err.message);
  }

  // 2) If nothing found, fall back to just the primary condition.
  if (!studies.length && richConditionQuery !== primaryCondition) {
    try {
      studies = await fetchTrials(primaryCondition, false);
    } catch (err) {
      console.error("Error in fallback query:", err.message);
      return [];
    }
  }

  // Map fields used by frontend
  return studies.map((study) => {
    const protocol = study.protocolSection || {};
    const idModule = protocol.identificationModule || {};
    const descriptionModule = protocol.descriptionModule || {};
    const conditionsModule = protocol.conditionsModule || {};
    const eligibilityModule = protocol.eligibilityModule || {};
    const armsModule = protocol.armsInterventionsModule || {};
    const outcomesModule = protocol.outcomesModule || {};

    const nctId = idModule.nctId || null;
    const title = idModule.briefTitle || "Untitled Study";
    const briefSummary = descriptionModule.briefSummary || "";
    const conditions = conditionsModule.conditions || [];

    const minimumAge = eligibilityModule.minimumAge || null;
    const maximumAge = eligibilityModule.maximumAge || null;
    const sex = eligibilityModule.sex || null;
    const healthyVolunteers = eligibilityModule.healthyVolunteers;

    const interventions = (armsModule.interventions || []).map((inv) => ({
      type: inv.interventionType || null,
      name: inv.name || null
    }));

    const primaryOutcomes = outcomesModule.primaryOutcomes || [];
    const primaryOutcome = primaryOutcomes[0] || {};
    const primaryOutcomeMeasure = primaryOutcome.measure || null;
    const primaryOutcomeTimeFrame = primaryOutcome.timeFrame || null;

    return {
      nctId,
      title,
      briefSummary,
      conditions,
      url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : null,
      eligibility: {
        minimumAge,
        maximumAge,
        sex,
        healthyVolunteers
      },
      interventions,
      primaryOutcome: {
        measure: primaryOutcomeMeasure,
        timeFrame: primaryOutcomeTimeFrame
      }
    };
  });
}

module.exports = {
  searchClinicalTrials
};
