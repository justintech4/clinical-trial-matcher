// Queries ClinicalTrials.gov.
// In prod you may refine filtering or use additional fields.

const axios = require("axios");

async function searchClinicalTrials(extracted) {
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
  const response = await axios.get(url);

  const studies = response.data?.studies || [];

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
      locationsSummary: [firstLoc.city, firstLoc.country].filter(Boolean).join(", "),
      briefSummary: descriptionModule.briefSummary || "",
      url: idModule.nctId ? `https://clinicaltrials.gov/study/${idModule.nctId}` : null
    };
  });
}

module.exports = {
  searchClinicalTrials
};
