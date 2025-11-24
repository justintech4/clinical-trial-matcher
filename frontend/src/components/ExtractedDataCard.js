import React from "react";
import { Typography, Card, CardContent } from "@mui/material";

// Component for patient data extracted from transcript
export function ExtractedDataCard({ extracted }) {
  if (!extracted) return null;

  return (
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
  );
}
