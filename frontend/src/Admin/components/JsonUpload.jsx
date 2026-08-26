import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from "@mui/material";

export const JsonUpload = ({ onFileChange, onSubmit }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Upload Problems JSON</Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <input
            type="file"
            onChange={onFileChange}
            accept=".json"
            required
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="contained">Upload</Button>
        </Box>
      </CardContent>
    </Card>
  );
};
