import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../style/FetchSubmissions.css';
import { CONTEST_ID } from "../config/config";
import api from "../api";

export const FetchAllYourSubmissions = () => {
  const [row, setRow] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const contestId = CONTEST_ID;

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/submissions/mine', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params:{
            contest_id : contestId
          }
        });
        setRow(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch submissions:', err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          setError('❌ Unauthorized. Please log in again.');
        } else {
          setError('❌ Could not load submissions. Try again later.');
          setRow([]);
        }
      }
    };

    fetchSubmissions();
  }, []);

  const handleRowClick = (submissionId) => {
    navigate(`/submissions/${submissionId}`); // route to detail view
  };

  return (
    <div className="submissions-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading submissions...</div>}
      <h2>Your Submissions</h2>
      <table className="submissions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Problem ID</th>
            <th>Title</th>
            <th>Verdict</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {row.map(submission => (
            <tr
              key={submission.id}
              onClick={() => handleRowClick(submission.id)}
              style={{ cursor: "pointer" }}
            >
              <td>{submission.id}</td>
              <td>{submission.problem_id}</td>
              <td>{submission.title}</td>
              <td>{submission.verdict}</td>
              <td>{new Date(submission.submitted_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && row.length === 0 && <div className="alert alert-info">No submissions found.</div>}
      {row.length > 0 && !loading && (
        <>
          <div className="alert alert-success">Total Submissions: {row.length}</div>
          <div className="alert alert-success">Last Submission: {new Date(row[0].submitted_at).toLocaleString()}</div>
        </>
      )}
    </div>
  );
};
