import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AddContest } from "./AddContest";
import { ProblemsManagement } from "./ProblemsManagement";
import { AdminLeaderboard } from "./AdminLeaderboard";
import { GenerateTeams } from "./GenerateTeams";
import "../style/AdminDashboard.css";
import {AdminShowAllSubmission} from "./AdminShowAllSubmission";
import api from "../api";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await api.get('/contests');
        setContests(response.data);
        
        // Get contestId from query params (default to 1 if not present)
        const contestIdFromParams = searchParams.get('contestId') || '1';
        setSelectedContest(Number(contestIdFromParams));
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };
    fetchContests();
  }, [searchParams]);

  const handleContestChange = (e) => {
    const newContestId = Number(e.target.value);
    setSelectedContest(newContestId);
    setSearchParams({ contestId: newContestId });
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage contests, upload problems, and track leaderboards.</p>
      </div>

      {/* Contest Selector */}
      <div className="admin-section">
        <h2 className="section-title">🎯 Select Contest</h2>
        <FormControl fullWidth>
          <InputLabel>Select a contest</InputLabel>
          <Select
            value={selectedContest || ''}
            onChange={handleContestChange}
            label="Select a contest"
          >
            <MenuItem value="">Select a contest</MenuItem>
            {contests.map((contest) => (
              <MenuItem key={contest.id} value={contest.id}>
                {contest.name} (ID: {contest.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Grid Layout */}
      <div className="admin-grid">
        {/* Left column */}
        <div className="admin-section">
          <h2 className="section-title">➕ Create Contest</h2>
          <AddContest />
        </div>

        <div className="admin-section">
          <h2 className="section-title">📂 Problems Management</h2>
          {selectedContest ? (
            <ProblemsManagement />
          ) : (
            <p>Please select a contest first</p>
          )}
        </div>
      </div>

      {/* Full-width leaderboard */}
      <div className="admin-section leaderboard-section">
        <h2 className="section-title">🏆 Contest Leaderboard</h2>
        {selectedContest ? <AdminLeaderboard /> : <p>Please select a contest first</p>}
      </div>

      <div className="admin-section leaderboard-section">
        <h2 className="section-title">📄 All Submissions</h2>
        {selectedContest ? <AdminShowAllSubmission /> : <p>Please select a contest first</p>}
      </div>
      
    {/* Right column */}
    <div className="admin-section">
      <h2 className="section-title">🔄 Generate Teams</h2>
      {selectedContest ? <GenerateTeams /> : <p>Please select a contest first</p>}
    </div>
  </div>
  );
};
