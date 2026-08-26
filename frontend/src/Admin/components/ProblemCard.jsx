import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import {
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";

export const ProblemCard = ({ problem, onEdit }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {problem.id}: {problem.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${problem.time_limit_ms}ms`} size="small" />
              <Chip label={`${problem.memory_limit_mb}MB`} size="small" />
            </Box>
          </Box>
          <IconButton onClick={() => onEdit(problem)}>
            <EditIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">View Description</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box id={`problem-${problem.id}`}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {problem.description}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {problem.test_cases?.length || 0} test cases
        </Typography>
      </CardContent>
    </Card>
  );
};
