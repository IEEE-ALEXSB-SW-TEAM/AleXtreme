import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import '../style/ContestAnalytics.css';

export const ContestAnalytics = () => {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!contestId) return;
      
      try {
        const response = await api.get(`/analytics/${contestId}`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [contestId]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">No analytics data available</div>;
  }

  return (
    <div className="contest-analytics">
      <div className="analytics-card">
        <h3>📊 Contest Overview</h3>
        <div className="analytics-stats">
          <div className="stat-item">
            <span className="stat-label">Total Teams:</span>
            <span className="stat-value">{analytics.total_teams}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Problems:</span>
            <span className="stat-value">{analytics.total_problems}</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-label">Problems Solved:</span>
            <span className="stat-value">{analytics.contest_solve_ratio}</span>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h3>🎯 Problem Statistics</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Title</th>
              <th>Solved By</th>
              <th>Solve Ratio</th>
            </tr>
          </thead>
          <tbody>
            {analytics.problem_analytics.map((problem) => (
              <tr key={problem.id}>
                <td>{problem.id}</td>
                <td>{problem.title}</td>
                <td>{problem.solved_count}</td>
                <td className="ratio-cell">{problem.solve_ratio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
