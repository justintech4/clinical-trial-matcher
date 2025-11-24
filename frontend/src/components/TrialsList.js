import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Link
} from "@mui/material";

// Component for matched clinical trials
export function TrialsList({ trials }) {
  if (!trials || trials.length === 0) return null;

  return (
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
          primaryOutcome
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
          conditions && conditions.length > 0
            ? conditions.join(", ")
            : null;

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
              <Typography variant="h6">{title}</Typography>
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

              {briefSummary && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {briefSummary}
                </Typography>
              )}

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

              {conditionsLine && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Conditions: </strong>
                  {conditionsLine}
                </Typography>
              )}

              {firstIntervention &&
                (firstIntervention.type || firstIntervention.name) && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Intervention: </strong>
                    {firstIntervention.type && `${firstIntervention.type}: `}
                    {firstIntervention.name}
                  </Typography>
                )}

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
  );
}
