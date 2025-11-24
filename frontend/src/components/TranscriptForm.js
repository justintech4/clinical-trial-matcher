import React from "react";
import { Typography, TextField, Button, CircularProgress } from "@mui/material";

// Component for entering patient/doctor transcript
export function TranscriptForm({
  transcript,
  onChange,
  onSubmit,
  loading,
  error
}) {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
      <TextField
        label="Transcript"
        multiline
        minRows={10}
        fullWidth
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !transcript.trim()}
        >
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
  );
}
