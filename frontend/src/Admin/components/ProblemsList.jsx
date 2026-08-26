import React from "react";
import {
  Typography,
  Grid
} from "@mui/material";
import { ProblemCard } from "./ProblemCard";

export const ProblemsList = ({ problems, onEdit }) => {
  if (problems.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">No problems found for this contest.</Typography>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>Current Problems ({problems.length})</Typography>
      <Grid container spacing={2}>
        {problems.map((problem) => (
          <Grid item xs={12} md={6} lg={4} key={problem.id}>
            <ProblemCard problem={problem} onEdit={onEdit} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};
