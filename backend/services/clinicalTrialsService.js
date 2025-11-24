// Uses ClinicalTrials.gov v2 API.
// Dev behavior: tries a stricter query first, then relaxes filters if nothing is found.

const axios = require("axios");

async function searchClinicalTrials(extracted) {
  const primaryCondition = extracted?.diagnosis?.primaryCondition;
  if (!primaryCondition) {
    console.log("No primary condition extracted — returning zero trials");
    return [];
  }

  const stage = extracted?.diagnosis?.stage;
  const histology = extracted?.diagnosis?.histology;

  // Build a richer condition query using stage and histology if available.
  let conditionQuery = primaryCondition;
  if (stage) {
    conditionQuery += ` ${stage}`; // e.g., "non small cell lung cancer IIIA"
  }
  if (histology) {
    conditionQuery += ` ${histology}`; // e.g., "adenocarcinoma"
  }

  const city = extracted?.patient?.city;
  const locationPreference = extracted?.trialPreferences?.locationPreference;

  const desiredPhases = extracted?.trialPreferences?.desiredPhases || [];
  const phaseTerms = desiredPhases
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" "); // e.g., "Phase 2 Phase 3"

  // First pass: use all the filters we can.
  const strictParams = new URLSearchParams();
  strictParams.append("query.cond", conditionQuery);

  if (city) {
    strictParams.append("query.locn", city);
  } else if (locationPreference) {
    strictParams.append("query.locn", locationPreference);
  }

  if (phaseTerms) {
    strictParams.append("query.term", phaseTerms);
  }

  strictParams.append("filter.overallStatus", "NOT_YET_RECRUITING,RECRUITING");
  strictParams.append("pageSize", "10");
  strictParams.append(
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

  // Try strict query first.
  const strictUrl = `https://clinicaltrials.gov/api/v2/studies?${strictParams.toString()}`;
  console.log("ClinicalTrials.gov strict URL:", strictUrl);

  let data = null;

  try {
    const response = await axios.get(strictUrl);
    data = response.data;
  } catch (e) {
    console.error("Error calling ClinicalTrials.gov (strict):", e.message);
  }

  // If strict query returns nothing or fails, relax the filters.
  if (!data || !data.totalCount || data.totalCount === 0) {
    console.log("No trials found with strict filters, relaxing query...");

    const relaxedParams = new URLSearchParams();
    relaxedParams.append("query.cond", primaryCondition); // only base condition
    relaxedParams.append(
      "filter.overallStatus",
      "NOT_YET_RECRUITING,RECRUITING"
    );
    relaxedParams.append("pageSize", "10");
    relaxedParams.append(
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

    const relaxedUrl = `https://clinicaltrials.gov/api/v2/studies?${relaxedParams.toString()}`;
    console.log("ClinicalTrials.gov relaxed URL:", relaxedUrl);

    try {
      const relaxedResponse = await axios.get(relaxedUrl);
      data = relaxedResponse.data;
    } catch (e) {
      console.error("Error calling ClinicalTrials.gov (relaxed):", e.message);
      data = { studies: [] };
    }
  }

  const studies = data?.studies || [];

  // Normalize the API response into a simple list of trials for the frontend.
  return studies.map((study) => {
    const protocol = study.protocolSection || {};
    const idModule = protocol.identificationModule || {};
    const statusModule = protocol.statusModule || {};
    const conditionsModule = protocol.conditionsModule || {};
    const contactsModule = protocol.contactsLocationsModule || {};
    const descriptionModule = protocol.descriptionModule || {};

    const locations = contactsModule.locations || [];
    const firstLoc = locations[0] || {};

    return {
      nctId: idModule.nctId || null,
      title: idModule.briefTitle || "Untitled Study",
      overallStatus: statusModule.overallStatus || "",
      phase: statusModule.phase || "",
      conditions: conditionsModule.conditions || [],
      locationsSummary: [firstLoc.city, firstLoc.country]
        .filter(Boolean)
        .join(", "),
      briefSummary: descriptionModule.briefSummary || "",
      url: idModule.nctId
        ? `https://clinicaltrials.gov/study/${idModule.nctId}`
        : null
    };
  });
}

module.exports = {
  searchClinicalTrials
};
