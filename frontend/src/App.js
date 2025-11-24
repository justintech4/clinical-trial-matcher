import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import { SAMPLE_TRANSCRIPT } from "./constants/sampleTranscript";
import { fetchRecommendations } from "./api/recommendations";
import { TranscriptForm } from "./components/TranscriptForm";
import { ExtractedDataCard } from "./components/ExtractedDataCard";
import { TrialsList } from "./components/TrialsList";

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
      const data = await fetchRecommendations(transcript);
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

      <TranscriptForm
        transcript={transcript}
        onChange={setTranscript}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />

      <ExtractedDataCard extracted={extracted} />
      <TrialsList trials={trials} />

      {extracted && (!trials || trials.length === 0) && !loading && !error && (
        <Typography variant="body2">
          No trials found for this query.
        </Typography>
      )}
    </Container>
  );
}

export default App;
