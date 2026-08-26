import React from "react";
import {
  TextField,
  Grid
} from "@mui/material";

export const ProblemForm = ({ formData, isEditing, onChange }) => {
  return (
    <>
      <TextField
        label="Problem ID"
        name="id"
        value={formData.id}
        onChange={onChange}
        disabled={isEditing}
        required
        fullWidth
      />
      <TextField
        label="Title"
        name="title"
        value={formData.title}
        onChange={onChange}
        required
        fullWidth
      />
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={onChange}
        required
        fullWidth
        multiline
        rows={4}
      />
      <TextField
        label="Input Description"
        name="input_description"
        value={formData.input_description}
        onChange={onChange}
        required
        fullWidth
        multiline
        rows={2}
      />
      <TextField
        label="Output Description"
        name="output_description"
        value={formData.output_description}
        onChange={onChange}
        required
        fullWidth
        multiline
        rows={2}
      />
      <TextField
        label="Sample Input"
        name="sample_input"
        value={formData.sample_input}
        onChange={onChange}
        fullWidth
        multiline
        rows={2}
      />
      <TextField
        label="Sample Output"
        name="sample_output"
        value={formData.sample_output}
        onChange={onChange}
        fullWidth
        multiline
        rows={2}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Time Limit (ms)"
            name="time_limit_ms"
            value={formData.time_limit_ms}
            onChange={onChange}
            required
            fullWidth
            type="number"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Memory Limit (MB)"
            name="memory_limit_mb"
            value={formData.memory_limit_mb}
            onChange={onChange}
            required
            fullWidth
            type="number"
          />
        </Grid>
      </Grid>
    </>
  );
};
