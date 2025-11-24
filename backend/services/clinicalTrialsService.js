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

  //  log url for dev purposes
  console.log("ClinicalTrials.gov URL:", url);

  const response = await axios.get(url);
  const data = response.data;

  const studies = data?.studies || [];

  return studies.map((study) => {
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
}

module.exports = {
  searchClinicalTrials
};
