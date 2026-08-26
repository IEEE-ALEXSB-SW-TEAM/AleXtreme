import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import About from "./Components/About";
import { Login } from "./Auth/Login";
import { Register } from "./Auth/Register";
import { Leaderboard } from "./Components/Leaderboard";
import { FetchAllYourSubmissions } from "./Components/FetchAllYourSubmissions";
import { ShowSubmissionById } from "./Components/ShowSubmissionById";
import Problems from "./Components/Problems";
import ProblemDetails from "./Components/ProblemDetails";
import { ContestProvider } from "./context/ContestContext";
import Logout from "./Auth/Logout";
import "./App.css";
import { AuthProvider } from "./context/AuthProvider";
import { CONTEST_ID } from "./config/config";
import { AdminLogin } from "./Admin/AdminLogin";
import { AddContest } from "./Admin/AddContest";
import { AdminDashboard } from "./Admin/AdminDashboard";
import { DropProblemsFile } from "./Admin/DropProblemsFile";
import { AdminLeaderboard } from "./Admin/AdminLeaderboard";
import { TeamByIDLeaderboard } from "./Admin/TeamByIDLeaderboard";
import { GenerateTeams } from "./Admin/GenerateTeams";
import { AdminProtectedRoute } from "./Admin/AdminProtectedRoute";
import { AdminShowAllSubmission } from "./Admin/AdminShowAllSubmission";
import { AdminShowSubmissonById } from "./Admin/AdminShowSubmissonById";
import Clarifications from "./Components/Clarifications";
import { AdminClarifications } from "./Admin/AdminClarifications";
import NotificationManager from "./Components/NotificationManager";

function App() {
  return (
    <ContestProvider contestId={CONTEST_ID}>
      <AuthProvider>
        <Router>
          <Navbar />
          <NotificationManager />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/clarifications" element={<Clarifications />} />
            <Route path="/problems/:id" element={<ProblemDetails />} />
            <Route path={`/leaderboard/${CONTEST_ID}`} element={<Leaderboard />} />
            <Route path="/submissions/" element={<FetchAllYourSubmissions />} />
            <Route path="/submissions/:id" element={<ShowSubmissionById />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route
              path="/admin/clarifications"
              element={
                <AdminProtectedRoute>
                  <AdminClarifications />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin/add-contest" element={<AdminProtectedRoute><AddContest /></AdminProtectedRoute>} />
            <Route path="/admin/drop-problems/:contestId" element={<AdminProtectedRoute><DropProblemsFile /></AdminProtectedRoute>} />
            <Route path="/admin/leaderboard/:contestId" element={<AdminProtectedRoute><AdminLeaderboard /></AdminProtectedRoute>} />
            <Route path="/admin/leaderboard/:contestId/team/:teamId" element={<AdminProtectedRoute><TeamByIDLeaderboard /></AdminProtectedRoute>} />
            <Route path="/admin/generate-teams" element={<AdminProtectedRoute><GenerateTeams /></AdminProtectedRoute>} />
            <Route path="/admin/submissions" element={<AdminProtectedRoute><AdminShowAllSubmission /></AdminProtectedRoute>} />
            <Route path="/admin/submissions/:id" element={<AdminProtectedRoute><AdminShowSubmissonById /></AdminProtectedRoute>} />
            
          </Routes>
        </Router>
      </AuthProvider>
    </ContestProvider>
  );
}

export default App;
