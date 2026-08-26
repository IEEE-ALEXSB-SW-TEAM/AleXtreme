import React from "react";
import { useNavigate } from "react-router-dom";
import { AddContest } from "./AddContest";
import { DropProblemsFile } from "./DropProblemsFile";
import { AdminLeaderboard } from "./AdminLeaderboard";
import { GenerateTeams } from "./GenerateTeams";
import "../style/AdminDashboard.css";
import { AdminShowAllSubmission } from "./AdminShowAllSubmission";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage contests, upload problems, and track leaderboards.</p>
      </div>

      {/* Grid Layout */}
      <div className="admin-grid">
        {/* Left column */}
        <div className="admin-section">
          <h2 className="section-title">➕ Create Contest</h2>
          <AddContest />
        </div>

        <div className="admin-section">
          <h2 className="section-title">📂 Upload Problems</h2>
          <DropProblemsFile />
        </div>
      </div>

      {/* Full-width leaderboard */}
      <div className="admin-section leaderboard-section">
        <h2 className="section-title">🏆 Contest Leaderboard</h2>
        <AdminLeaderboard />
      </div>

      {/* All submissions */}
      <div className="admin-section leaderboard-section">
        <h2 className="section-title">📄 All Submissions</h2>
        <AdminShowAllSubmission />
      </div>

      {/* Generate Teams */}
      <div className="admin-section">
        <h2 className="section-title">🔄 Generate Teams</h2>
        <GenerateTeams />
      </div>

      {/* Clarifications */}
      <div className="admin-section">
        <h2 className="section-title">💬 Clarifications</h2>

        <p>
          Manage contestant questions, private responses,
          public clarifications, and announcements.
        </p>

        <button
          onClick={() => navigate("/admin/clarifications")}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#141E61",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Open Clarifications
        </button>
      </div>
    </div>
  );
};