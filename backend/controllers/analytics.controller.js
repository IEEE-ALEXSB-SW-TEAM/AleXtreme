const db = require('../config/db');

exports.getContestAnalytics = async (req, res) => {
  const { contestId } = req.params;

  try {
    // Get all problems for this contest
    const { rows: problems } = await db.query(
      `SELECT id, title FROM problems WHERE contest_id = $1 ORDER BY id`,
      [contestId]
    );

    // Get total teams
    const { rows: teamCount } = await db.query(
      `SELECT COUNT(DISTINCT t.id) as count
       FROM teams t
       JOIN submissions s ON s.team_id = t.id
       WHERE s.contest_id = $1`,
      [contestId]
    );
    const totalTeams = teamCount[0].count;
    const totalProblems = problems.length;

    // Get problem solve statistics using SQL
    const { rows: problemStats } = await db.query(
      `SELECT
        p.id,
        p.title,
        COUNT(DISTINCT s.team_id) FILTER (WHERE s.verdict = 'Accepted') as solved_count
      FROM problems p
      LEFT JOIN submissions s ON s.problem_id = p.id AND s.contest_id = $1
      WHERE p.contest_id = $1
      GROUP BY p.id, p.title
      ORDER BY p.id`,
      [contestId]
    );

    const problemAnalytics = problemStats.map(p => ({
      id: p.id,
      title: p.title,
      solved_count: p.solved_count || 0,
      solve_ratio: `${p.solved_count || 0}/${totalTeams}`
    }));

    // Contest solve ratio (how many problems were solved by at least one team)
    const problemsSolvedByAnyone = problemAnalytics.filter(p => p.solved_count > 0).length;
    const contestSolveRatio = `${problemsSolvedByAnyone}/${totalProblems}`;

    res.json({
      total_teams: totalTeams,
      total_problems: totalProblems,
      contest_solve_ratio: contestSolveRatio,
      problem_analytics: problemAnalytics
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};
