import React, { useState } from "react";
import { API_BASE_URL } from "./config";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Link,
} from "@mui/material";

const SAMPLE_TRANSCRIPT = `Doctor: Hi Ms. Williams, it's good to see you again. How have you been feeling since the biopsy?

Patient: I've been anxious, to be honest. The soreness is okay, but I'm worried about what it means.

Doctor: That's completely understandable. Let's go through everything carefully. Just to confirm, you're 55 years old and still living here in Chicago, correct?

Patient: Yes, I'm 55 and I live in Chicago.

Doctor: Any other medical conditions we should keep in mind?

Patient: I have high blood pressure, but it's controlled with medication. No diabetes or heart disease. I've never been a smoker.

Doctor: Thank you. Based on your mammogram, ultrasound, and the core needle biopsy, you have stage II invasive ductal carcinoma of the breast. This is a common type of breast cancer. We also sent your tumor for receptor testing. The results show that the cancer is estrogen receptor positive, progesterone receptor positive, and HER2 negative.

Patient: Is that good or bad?

Doctor: It means your tumor is hormone receptor positive and not overexpressing HER2. That usually gives us more options for hormone-based therapy, and we may also consider chemotherapy depending on risk factors. Your ECOG performance status is 1, which means you're up and about most of the day and able to do light work.

Patient: What are my treatment options?

Doctor: Standard treatment usually involves surgery, possibly chemotherapy, radiation, and hormone therapy. Another option is to look at clinical trials for stage II hormone receptor positive, HER2 negative breast cancer. Trials may offer new combinations of chemotherapy, targeted therapy, or different durations of hormone therapy.

Patient: I would be open to clinical trials, as long as I don't have to travel too far.

Doctor: That makes sense. You do not have major heart or kidney issues, your blood pressure is controlled, and you have no significant lung disease, so you would likely meet basic eligibility for several trials. Our goal is to match your diagnosis and risk profile with trials that are currently recruiting for breast cancer.

Patient: Okay. I just want to understand my options and do what gives me the best chance.

Doctor: Absolutely. I will have our team search for clinical trials focused on stage II, hormone receptor positive, HER2 negative breast cancer. We'll review a short list of options with you, including the main drugs being tested and what each study is measuring as the primary outcome, at your next visit.`;

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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clinical Trial Matcher
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Paste a patient and doctor transcript, extract structured data, and see
        matching clinical trials.
      </Typography>

      {/* Transcript input + button */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <TextField
          label="Transcript"
          multiline
          minRows={10}
          fullWidth
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <Button type="submit" variant="contained" disabled={loading || !transcript.trim()}>
            {loading ? "Finding trials..." : "Find clinical trials"}
          </Button>
          {loading && <CircularProgress size={20} />}
          {error && (
            <Typography variant="body2" color="error">
              Error: {error}
            </Typography>
          )}
        </div>
      </form>

      {/* Extracted data (simple JSON view) */}
      {extracted && (
        <div style={{ marginBottom: 24 }}>
          <Typography variant="h6" gutterBottom>
            Extracted patient data
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <pre style={{ margin: 0, fontSize: 12 }}>
                {JSON.stringify(extracted, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trials list */}
      {trials && trials.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Typography variant="h6" gutterBottom>
            Clinical trial matches ({trials.length})
          </Typography>

          {trials.map((trial) => {
            const {
              nctId,
              title,
              briefSummary,
              url,
              eligibility,
              conditions,
              interventions,
              primaryOutcome,
            } = trial;

            const firstIntervention = interventions && interventions[0];
            const ages =
              eligibility && (eligibility.minimumAge || eligibility.maximumAge)
                ? `${eligibility.minimumAge || "N/A"} to ${
                    eligibility.maximumAge || "N/A"
                  }`
                : null;

            const sex = eligibility && eligibility.sex;
            const healthyVolunteers = eligibility?.healthyVolunteers;
            const conditionsLine =
              conditions && conditions.length > 0 ? conditions.join(", ") : null;

            const hasOutcome =
              primaryOutcome &&
              (primaryOutcome.measure || primaryOutcome.timeFrame);

            return (
              <Card
                key={nctId || title}
                variant="outlined"
                sx={{ mb: 2, paddingY: 1 }}
              >
                <CardContent>
                  {/* Title + NCT + link (simple, consistent) */}
                  <Typography variant="h6">
                    {title}
                  </Typography>
                  {nctId && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      NCT: {nctId}
                    </Typography>
                  )}
                  {url && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <Link href={url} target="_blank" rel="noreferrer">
                        View study
                      </Link>
                    </Typography>
                  )}

                  {/* Summary */}
                  {briefSummary && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {briefSummary}
                    </Typography>
                  )}

                  {/* Eligibility */}
                  {(ages || sex || healthyVolunteers != null) && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Eligibility: </strong>
                      {ages && <>Ages {ages}. </>}
                      {sex && <>Sex: {sex}. </>}
                      {healthyVolunteers != null && (
                        <>Healthy volunteers: {healthyVolunteers ? "Yes" : "No"}.</>
                      )}
                    </Typography>
                  )}

                  {/* Conditions */}
                  {conditionsLine && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Conditions: </strong>
                      {conditionsLine}
                    </Typography>
                  )}

                  {/* Intervention */}
                  {firstIntervention &&
                    (firstIntervention.type || firstIntervention.name) && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Intervention: </strong>
                        {firstIntervention.type && `${firstIntervention.type}: `}
                        {firstIntervention.name}
                      </Typography>
                    )}

                  {/* Primary outcome */}
                  {hasOutcome && (
                    <Typography variant="body2">
                      <strong>Primary outcome: </strong>
                      {primaryOutcome.measure}
                      {primaryOutcome.measure &&
                        primaryOutcome.timeFrame &&
                        " "}
                      {primaryOutcome.timeFrame &&
                        `(${primaryOutcome.timeFrame})`}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {extracted && (!trials || trials.length === 0) && !loading && !error && (
        <Typography variant="body2">
          No trials found for this query.
        </Typography>
      )}
    </Container>
  );
}

export default App;
