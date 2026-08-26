import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

export const TestCaseList = ({ testCases, onEdit, onDelete }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {testCases.map((testCase, index) => (
        <Card key={index} variant="outlined" size="small">
          <CardContent sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2">Test Case {index + 1}</Typography>
                  <Chip
                    label={testCase.is_sample ? 'Sample' : 'Hidden'}
                    size="small"
                    color={testCase.is_sample ? 'primary' : 'default'}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Input: {testCase.input.substring(0, 50)}...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Output: {testCase.output.substring(0, 50)}...
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => onEdit(index)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(index)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
