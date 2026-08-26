import React from "react";
import {
  Box,
  Typography,
  Divider,
  Chip
} from "@mui/material";

export const ProblemPreview = ({ formData }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" color="primary">Problem ID: {formData.id}</Typography>
      <Typography variant="h6">{formData.title}</Typography>
      <Divider />
      <Typography variant="subtitle2">Description:</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{formData.description}</Typography>
      <Divider />
      <Typography variant="subtitle2">Input Description:</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{formData.input_description}</Typography>
      <Divider />
      <Typography variant="subtitle2">Output Description:</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{formData.output_description}</Typography>
      <Divider />
      
      {/* Sample test cases from test_cases array */}
      {formData.test_cases.filter(tc => tc.is_sample).length > 0 && (
        <>
          <Typography variant="subtitle2">Sample Test Cases:</Typography>
          {formData.test_cases.filter(tc => tc.is_sample).map((tc, index) => (
            <Box key={index} sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">Sample {index + 1}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Input:</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, mt: 0.5 }}>
                {tc.input}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Output:</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'white', p: 1, mt: 0.5 }}>
                {tc.output}
              </Typography>
            </Box>
          ))}
          <Divider />
        </>
      )}
      
      {/* Legacy sample input/output fields */}
      {formData.sample_input && !formData.test_cases.some(tc => tc.is_sample) && (
        <>
          <Typography variant="subtitle2">Sample Input:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1 }}>{formData.sample_input}</Typography>
          <Divider />
        </>
      )}
      {formData.sample_output && !formData.test_cases.some(tc => tc.is_sample) && (
        <>
          <Typography variant="subtitle2">Sample Output:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1 }}>{formData.sample_output}</Typography>
          <Divider />
        </>
      )}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Chip label={`Time: ${formData.time_limit_ms}ms`} />
        <Chip label={`Memory: ${formData.memory_limit_mb}MB`} />
      </Box>
      
      {/* Test case summary */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total Test Cases: {formData.test_cases.length} ({formData.test_cases.filter(tc => tc.is_sample).length} sample, {formData.test_cases.filter(tc => !tc.is_sample).length} hidden)
        </Typography>
      </Box>
    </Box>
  );
};
