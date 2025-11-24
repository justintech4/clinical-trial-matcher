import React, { useState } from "react";
import { API_BASE_URL } from "./config";

const SAMPLE_TRANSCRIPT = `Doctor: Hi Ms. Johnson, good to see you again. How have you been feeling since our last visit?

Patient: Honestly, not great. I am still getting short of breath when I walk even half a block, and the cough has not really improved.

Doctor: Got it. Just to confirm, you are 62 now, correct?

Patient: Yes, 62. I turned 62 in March.

Doctor: And you are still living here in Chicago?

Patient: Yes, I live in Chicago, in the city.

Doctor: Any chest pain, weight loss, or coughing up blood?

Patient: I lost about 15 pounds over the past three months without trying. No blood when I cough, just thick mucus.

Doctor: You have a history of smoking. Are you still smoking?

Patient: I quit about 5 years ago. Before that, I smoked about a pack a day for 30 years.

Doctor: Thank you. So based on your CT scan and the biopsy results, you have stage IIIA non small cell lung cancer, adenocarcinoma type. We also tested for some biomarkers. Your tumor is EGFR negative, ALK negative, but PD L1 expression is around 60 percent.

Patient: Is that bad?

Doctor: It means certain immunotherapy drugs may work better. For treatment, the standard option is chemotherapy combined with radiation, and then an immunotherapy drug afterward. Given your ECOG performance status of 1, you are still a candidate for clinical trials if you are interested.

Patient: I am open to that, as long as it does not require me to travel far. I would prefer to stay in the Chicago area.

Doctor: That makes sense. You do not have major heart or kidney issues, correct?

Patient: Correct. I have high blood pressure that is controlled with medication, and mild asthma, but otherwise I am pretty healthy.

Doctor: Great. I will have our team look for clinical trials for stage III non small cell lung cancer with high PD L1 expression in the Chicago area that are currently recruiting. We will focus on phase II and III studies. We will avoid anything that excludes patients with mild asthma or controlled hypertension.

Patient: Thank you, I appreciate that.

Doctor: Of course. We will follow up with a list of eligible trials in the next week.`;

function App() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [trials, setTrials] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setExtracted(null);
    setTrials([]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transcript })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const data = await res.json();
      setExtracted(data.extracted || null);
      setTrials(data.trials || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Clinical Trial Matcher</h1>
      <p>
        Enter a patient doctor transcript, extract key medical info, and see
        clinical trial matches from ClinicalTrials.gov.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="transcript">Transcript</label>
        </div>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={16}
          style={{ width: "100%", maxWidth: "800px" }}
        />
        <div style={{ marginTop: "0.5rem" }}>
          <button type="submit" disabled={loading || !transcript.trim()}>
            {loading ? "Finding trials..." : "Find clinical trials"}
          </button>
        </div>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "0.5rem" }}>Error: {error}</p>
      )}

      {extracted && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Extracted Patient Data</h2>
          <h3>Patient</h3>
          <pre>{JSON.stringify(extracted.patient, null, 2)}</pre>

          <h3>Diagnosis</h3>
          <pre>{JSON.stringify(extracted.diagnosis, null, 2)}</pre>

          <h3>Trial Preferences</h3>
          <pre>{JSON.stringify(extracted.trialPreferences, null, 2)}</pre>
        </div>
      )}

      {trials && trials.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Clinical Trial Matches</h2>
          <ul>
            {trials.map((trial) => (
              <li key={trial.nctId} style={{ marginBottom: "1rem" }}>
                <div>
                  <strong>{trial.title}</strong>
                </div>
                {trial.nctId && (
                  <div>
                    NCT ID: {trial.nctId}
                  </div>
                )}
                {trial.phase && (
                  <div>
                    Phase: {trial.phase}
                  </div>
                )}
                {trial.overallStatus && (
                  <div>
                    Status: {trial.overallStatus}
                  </div>
                )}
                {trial.locationsSummary && (
                  <div>
                    Example location: {trial.locationsSummary}
                  </div>
                )}
                {trial.url && (
                  <div>
                    <a href={trial.url} target="_blank" rel="noreferrer">
                      View on ClinicalTrials.gov
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {extracted && (!trials || trials.length === 0) && !loading && !error && (
        <p style={{ marginTop: "1rem" }}>
          No trials found for this query.
        </p>
      )}
    </div>
  );
}

export default App;
