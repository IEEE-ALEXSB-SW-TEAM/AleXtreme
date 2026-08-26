import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../style/Leaderboard.css';
import api from "../api";

export const AdminLeaderboard = () => {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const [leaderboardData, setLeaderboardData] = useState({ problems: [], leaderboard: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminLeaderboard = async () => {
      try {
        const response = await api.get(`leaderboard/matrix/${contestId}`);
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchAdminLeaderboard();

    // Refresh every 10 seconds
    const interval = setInterval(fetchAdminLeaderboard, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [contestId]);

  const { problems, leaderboard } = leaderboardData;

  const getCellClass = (problemData) => {
    if (!problemData.isAttempted) return 'cell-grey';
    if (problemData.isSolved) return 'cell-green';
    return 'cell-red';
  };

  const getCellContent = (problemData) => {
    if (!problemData.isAttempted) return '0--';
    if (problemData.isSolved) {
      return `${problemData.attempts}/${problemData.penalty}`;
    }
    return `${problemData.attempts}--`;
  };

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <h1>Admin Leaderboard</h1>
        <p>Contest ID: {contestId}</p>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#787A91' }}>
          No entries in the leaderboard yet.
        </p>
      ) : (
        <div className="matrix-leaderboard-wrapper">
          <table className="leaderboard-table matrix-table">
            <thead>
              <tr>
                <th className="table-head-cell">Rank</th>
                <th className="table-head-cell">Team Name</th>
                <th className="table-head-cell">Solved</th>
                <th className="table-head-cell">Penalty</th>
                {problems.map((problem) => (
                  <th key={problem.id} className="table-head-cell problem-header">
                    {problem.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.team_id} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell">
                    <Link 
                      to={`/admin/leaderboard/team/${entry.team_id}?contestId=${contestId}`} 
                      className="team-link"
                      style={{ textDecoration: 'none', color: '#4682A9' }}
                    >
                      {entry.team_name}
                    </Link>
                  </td>
                  <td className="table-cell">{entry.solved_count}</td>
                  <td className="table-cell">{entry.total_penalty}</td>
                  {entry.problems.map((problem) => (
                    <td 
                      key={problem.id} 
                      className={`table-cell matrix-cell ${getCellClass(problem)}`}
                    >
                      {getCellContent(problem)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
