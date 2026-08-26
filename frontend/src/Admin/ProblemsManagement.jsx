import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/contrib/auto-render';
import api from "../api";
import { problemSchema } from "./components/problemSchema";
import { z } from "zod";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  IconButton,
  Typography
} from "@mui/material";
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Visibility as PreviewIcon
} from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";
import { ProblemForm } from "./components/ProblemForm";
import { ProblemPreview } from "./components/ProblemPreview";
import { TestCaseForm } from "./components/TestCaseForm";
import { TestCaseList } from "./components/TestCaseList";
import { ProblemsList } from "./components/ProblemsList";
import { JsonUpload } from "./components/JsonUpload";


export const ProblemsManagement = () => {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    input_description: "",
    output_description: "",
    sample_input: "",
    sample_output: "",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    test_cases: []
  });
  const [testCaseForm, setTestCaseForm] = useState({
    input: "",
    output: "",
    is_sample: false
  });
  const [editingTestCaseIndex, setEditingTestCaseIndex] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  useEffect(() => {
    problems.forEach((problem) => {
      const el = document.getElementById(`problem-${problem.id}`);
      if (el) {
        renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
        });
      }
    });
  }, [problems]);

  const fetchProblems = async () => {
    try {
      const response = await api.get(`/problems/${contestId}`);
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to fetch problems');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleJsonUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate JSON with zod
      const problemsArray = Array.isArray(json) ? json : [json];
      problemsArray.forEach(problem => {
        problemSchema.parse(problem);
      });

      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        `/problems/admin/${contestId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Problems uploaded successfully!");
      fetchProblems();
      setFile(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(`Validation error: ${error.errors[0].message}`);
      } else {
        console.error("Error uploading problems:", error);
        toast.error("Upload failed. Please check the file format.");
      }
    }
  };

  const handleFormSubmit = async () => {
    try {
      const validatedData = problemSchema.parse(formData);

      if (isEditing && selectedProblem) {
        // Update existing problem
        await api.put(
          `/problems/${contestId}/${selectedProblem.id}`,
          validatedData
        );
        toast.success("Problem updated successfully!");
        setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      } else {
        // Add new problem via JSON upload
        const json = JSON.stringify([validatedData]);
        const blob = new Blob([json], { type: 'application/json' });
        const formData = new FormData();
        formData.append("file", blob);

        await api.post(
          `/problems/admin/${contestId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Problem added successfully!");
      }

      fetchProblems();
      resetForm();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(`Validation error: ${error.errors[0].message}`);
      } else {
        console.error("Error saving problem:", error);
        toast.error("Failed to save problem.");
      }
    }
  };

  const handleEdit = (problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    setIsAdding(false);
    const formData = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      input_description: problem.input_description,
      output_description: problem.output_description,
      sample_input: problem.sample_input || "",
      sample_output: problem.sample_output || "",
      time_limit_ms: problem.time_limit_ms || 1000,
      memory_limit_mb: problem.memory_limit_mb || 64,
      test_cases: problem.test_cases || []
    };
    setFormData(formData);
    setOriginalFormData(JSON.parse(JSON.stringify(formData)));
    setTabValue(0);
  };

  const handleAdd = () => {
    setSelectedProblem(null);
    setIsEditing(false);
    setIsAdding(true);
    const formData = {
      id: "",
      title: "",
      description: "",
      input_description: "",
      output_description: "",
      sample_input: "",
      sample_output: "",
      time_limit_ms: 1000,
      memory_limit_mb: 64,
      test_cases: []
    };
    setFormData(formData);
    setOriginalFormData(JSON.parse(JSON.stringify(formData)));
  };

  const resetForm = () => {
    setSelectedProblem(null);
    setIsEditing(false);
    setIsAdding(false);
    setIsPreviewMode(false);
    setOriginalFormData(null);
    setFormData({
      id: "",
      title: "",
      description: "",
      input_description: "",
      output_description: "",
      sample_input: "",
      sample_output: "",
      time_limit_ms: 1000,
      memory_limit_mb: 64,
      test_cases: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'time_limit_ms' || name === 'memory_limit_mb' ? Number(value) : value
    }));
  };

  const handleAddTestCase = async () => {
    if (testCaseForm.input && testCaseForm.output) {
      try {
        if (editingTestCaseIndex !== null) {
          // Update existing test case
          const testCase = formData.test_cases[editingTestCaseIndex];
          await api.put(
            `/problems/${contestId}/${formData.id}/test-cases/${testCase.id}`,
            testCaseForm
          );
          toast.success("Test case updated successfully!");
          setEditingTestCaseIndex(null);
        } else {
          // Add new test case
          await api.post(
            `/problems/${contestId}/${formData.id}/test-cases`,
            testCaseForm
          );
          toast.success("Test case added successfully!");
        }
        setTestCaseForm({ input: "", output: "", is_sample: false });
        // Refresh problem data to get updated test cases
        fetchProblems();
      } catch (error) {
        console.error("Error saving test case:", error);
        toast.error("Failed to save test case.");
      }
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleUpdateFromPreview = () => {
    setIsPreviewMode(false);
    handleFormSubmit();
  };

  const hasChanges = () => {
    if (!originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleEditTestCase = (index) => {
    setTestCaseForm(formData.test_cases[index]);
    setEditingTestCaseIndex(index);
  };

  const handleDeleteTestCase = async (index) => {
    try {
      const testCase = formData.test_cases[index];
      await api.delete(
        `/problems/${contestId}/${formData.id}/test-cases/${testCase.id}`
      );
      toast.success("Test case deleted successfully!");
      // Refresh problem data to get updated test cases
      fetchProblems();
    } catch (error) {
      console.error("Error deleting test case:", error);
      toast.error("Failed to delete test case.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ bgcolor: '#141E61', '&:hover': { bgcolor: '#0F044C' } }}
        >
          Add New Problem
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setIsAdding(!isAdding)}
        >
          Upload JSON
        </Button>
      </Box>

      {isAdding && (
        <JsonUpload
          onFileChange={handleFileChange}
          onSubmit={handleJsonUpload}
        />
      )}

      <Dialog open={isEditing || isAdding} onClose={resetForm} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{isEditing ? 'Edit Problem' : 'Add New Problem'}</Typography>
              {isEditing && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPreviewMode}
                      onChange={(e) => setIsPreviewMode(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Preview"
                />
              )}
            </Box>
            <IconButton onClick={resetForm}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Test Cases" />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isPreviewMode ? (
                <ProblemPreview formData={formData} />
              ) : (
                <ProblemForm
                  formData={formData}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Test Cases ({formData.test_cases.length})</Typography>
              
              <TestCaseForm
                testCaseForm={testCaseForm}
                editingTestCaseIndex={editingTestCaseIndex}
                onChange={setTestCaseForm}
                onSubmit={handleAddTestCase}
                onCancel={() => {
                  setEditingTestCaseIndex(null);
                  setTestCaseForm({ input: "", output: "", is_sample: false });
                }}
              />

              {formData.test_cases.length > 0 && (
                <TestCaseList
                  testCases={formData.test_cases}
                  onEdit={handleEditTestCase}
                  onDelete={handleDeleteTestCase}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          {tabValue === 0 && (
            <>
              {isPreviewMode ? (
                <Button 
                  onClick={handleUpdateFromPreview} 
                  variant="contained"
                  disabled={!hasChanges()}
                >
                  Update Problem
                </Button>
              ) : (
                <Button 
                  onClick={handlePreview} 
                  variant="contained" 
                  startIcon={<PreviewIcon />}
                >
                  Preview
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      <ProblemsList problems={problems} onEdit={handleEdit} />
    </Box>
  );
};
