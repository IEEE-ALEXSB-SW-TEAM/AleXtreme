import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Button,
  FormControlLabel,
  Switch
} from "@mui/material";

export const TestCaseForm = ({ testCaseForm, editingTestCaseIndex, onChange, onSubmit, onCancel }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          {editingTestCaseIndex !== null ? 'Edit Test Case' : 'Add New Test Case'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Input"
            value={testCaseForm.input}
            onChange={(e) => onChange({ ...testCaseForm, input: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Output"
            value={testCaseForm.output}
            onChange={(e) => onChange({ ...testCaseForm, output: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={testCaseForm.is_sample}
                  onChange={(e) => onChange({ ...testCaseForm, is_sample: e.target.checked })}
                  size="small"
                />
              }
              label={testCaseForm.is_sample ? 'Sample' : 'Hidden'}
            />
            <Button
              variant="contained"
              onClick={onSubmit}
              size="small"
            >
              {editingTestCaseIndex !== null ? 'Update' : 'Add'} Test Case
            </Button>
            {editingTestCaseIndex !== null && (
              <Button
                variant="outlined"
                onClick={onCancel}
                size="small"
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
