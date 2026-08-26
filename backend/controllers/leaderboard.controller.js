const db = require('../config/db');

// Matrix leaderboard - returns per-problem attempts/penalty for each team
exports.getMatrixLeaderboard = async (req, res) => {
  const { contestId } = req.params;

  try {
    // Single SQL query to get all submission data with penalties
    const { rows: teamData } = await db.query(
      `
      WITH submission_stats AS (
        SELECT
          t.id AS team_id,
          t.name AS team_name,
          p.id AS problem_id,
          COUNT(s.id) AS attempts,
          MIN(CASE WHEN s.verdict = 'Accepted' THEN s.submitted_at END) AS first_accepted_at,
          MAX(CASE WHEN s.verdict = 'Accepted' THEN 1 ELSE 0 END) AS is_solved,
          c.start_time AS contest_start
        FROM teams t
        CROSS JOIN problems p
        CROSS JOIN contests c
        LEFT JOIN submissions s ON s.team_id = t.id AND s.problem_id = p.id AND s.contest_id = $1
        WHERE p.contest_id = $1 AND c.id = $1
        GROUP BY t.id, t.name, p.id, c.start_time
      ),
      with_penalties AS (
        SELECT
          team_id,
          team_name,
          problem_id,
          attempts,
          first_accepted_at,
          is_solved,
          CASE
            WHEN is_solved = 1 AND first_accepted_at IS NOT NULL THEN
              FLOOR(EXTRACT(EPOCH FROM (first_accepted_at - contest_start)) / 60)::INT + (attempts - 1) * 20
            ELSE 0
          END AS penalty,
          attempts > 0 AS is_attempted
        FROM submission_stats
      ),
      team_totals AS (
        SELECT
          team_id,
          team_name,
          SUM(is_solved) AS solved_count,
          SUM(penalty) AS total_penalty
        FROM with_penalties
        GROUP BY team_id, team_name
      )
      SELECT
        wp.team_id,
        wp.team_name,
        wp.problem_id,
        wp.attempts,
        wp.first_accepted_at,
        wp.is_solved,
        wp.penalty,
        wp.is_attempted,
        tt.solved_count,
        tt.total_penalty
      FROM with_penalties wp
      JOIN team_totals tt ON tt.team_id = wp.team_id
      ORDER BY tt.solved_count DESC, tt.total_penalty ASC, wp.team_id, wp.problem_id
      `,
      [contestId]
    );

    // Get all problems for this contest
    const { rows: problems } = await db.query(
      `SELECT id, title FROM problems WHERE contest_id = $1 ORDER BY id`,
      [contestId]
    );

    // Group by team (already sorted by SQL) - use Map to preserve insertion order
    const teamMap = new Map();

    for (const row of teamData) {
      if (!teamMap.has(row.team_id)) {
        teamMap.set(row.team_id, {
          team_id: row.team_id,
          team_name: row.team_name,
          solved_count: row.solved_count,
          total_penalty: row.total_penalty,
          problems: {}
        });
      }

      const team = teamMap.get(row.team_id);
      team.problems[row.problem_id] = {
        attempts: row.attempts,
        penalty: row.penalty,
        isSolved: row.is_solved === 1,
        isAttempted: row.is_attempted
      };
    }

    // Convert to array (already sorted by SQL - Map preserves insertion order)
    const leaderboard = Array.from(teamMap.values()).map(team => ({
      ...team,
      problems: problems.map(p => ({
        id: p.id,
        title: p.title,
        ...team.problems[p.id] || { attempts: 0, penalty: 0, isSolved: false, isAttempted: false }
      }))
    }));

    res.json({
      problems,
      leaderboard
    });
  } catch (err) {
    console.error('Matrix Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to load matrix leaderboard' });
  }
};

exports.getLeaderboard = async (req, res) => {
  const { contestId } = req.params;

  try {
    const { rows } = await db.query(
      `
      WITH first_accepts AS (
        SELECT
          s.team_id,
          s.problem_id,
          MIN(s.submitted_at) AS first_accepted_at
        FROM submissions s
        WHERE s.verdict = 'Accepted'
          AND s.contest_id = $1
        GROUP BY s.team_id, s.problem_id
      )
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        COUNT(DISTINCT fa.problem_id) AS solved_count,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM fa.first_accepted_at - c.start_time)/60 + (
            (SELECT COUNT(*) FROM submissions s2
             WHERE s2.team_id = fa.team_id AND s2.problem_id = fa.problem_id) - 1
          ) * 20
        ), 0)::INT AS total_penalty
      FROM teams t
      JOIN first_accepts fa ON fa.team_id = t.id
      JOIN contests c ON c.id = $1
      GROUP BY t.id, t.name
      ORDER BY solved_count DESC, total_penalty ASC;
      `,
      [contestId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};

// Admin leaderboard (all teams with details)
exports.adminLeaderboard = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      WITH first_accepts AS (
        SELECT
          s.team_id,
          s.problem_id,
          MIN(s.submitted_at) AS first_accepted_at
        FROM submissions s
        WHERE s.verdict = 'Accepted'
          AND s.contest_id = $1
        GROUP BY s.team_id, s.problem_id
      ),
      penalty_calc AS (
        SELECT
          fa.team_id,
          fa.problem_id,
          EXTRACT(EPOCH FROM fa.first_accepted_at - c.start_time) / 60 + (
            (SELECT COUNT(*) FROM submissions s2
             WHERE s2.team_id = fa.team_id AND s2.problem_id = fa.problem_id) - 1
          ) * 20 AS penalty
        FROM first_accepts fa
        JOIN contests c ON c.id = $1
      )
      SELECT
        t.id AS team_id,
        t.name AS team_name,

        COUNT(DISTINCT s.problem_id) FILTER (WHERE s.verdict = 'Accepted') AS solved_count,
        COUNT(s.id) AS total_submissions,
        COUNT(s.id) FILTER (WHERE s.verdict != 'Accepted') AS wrong_submissions,

        COALESCE(ARRAY_AGG(DISTINCT p.id) FILTER (WHERE s.verdict = 'Accepted'), '{}') AS solved_problem_ids,
        COALESCE(ARRAY_AGG(DISTINCT p.title) FILTER (WHERE s.verdict = 'Accepted'), '{}') AS solved_problem_titles,
        COALESCE(ARRAY_AGG(DISTINCT p.id) FILTER (WHERE s.verdict != 'Accepted'), '{}') AS attempted_problem_ids,

        MAX(s.submitted_at) AS last_submission_time,

        COALESCE(SUM(pc.penalty), 0)::INT AS total_penalty,

        ROUND(
          COALESCE(SUM(pc.penalty), 0)::NUMERIC
          / NULLIF(COUNT(DISTINCT s.problem_id) FILTER (WHERE s.verdict = 'Accepted'), 0),
          2
        ) AS avg_penalty_per_solved

      FROM teams t
      LEFT JOIN submissions s ON s.team_id = t.id
      LEFT JOIN contests c ON c.id = s.contest_id
      LEFT JOIN problems p ON p.id = s.problem_id AND p.contest_id = c.id
      LEFT JOIN penalty_calc pc ON pc.team_id = t.id AND pc.problem_id = s.problem_id
      WHERE c.id = $1
      GROUP BY t.id, t.name
      ORDER BY solved_count DESC, total_penalty ASC;
      `,
      [req.params.contestId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};

// Admin leaderboard for a single team
exports.adminLeaderboardTeamByID = async (req, res) => {
  try {
    const { contestId, teamId } = req.params;

    const { rows } = await db.query(
      `
      WITH first_accepts AS (
        SELECT
          s.team_id,
          s.problem_id,
          MIN(s.submitted_at) AS first_accepted_at
        FROM submissions s
        WHERE s.verdict = 'Accepted'
          AND s.contest_id = $1
          AND s.team_id = $2
        GROUP BY s.team_id, s.problem_id
      ),
      penalty_per_problem AS (
        SELECT
          fa.team_id,
          fa.problem_id,
          (
            FLOOR(EXTRACT(EPOCH FROM (fa.first_accepted_at - c.start_time)) / 60)::INT
            + COALESCE(w.total_other_submissions, 0) * 20
          ) AS penalty
        FROM first_accepts fa
        JOIN contests c ON c.id = $1
        LEFT JOIN LATERAL (
          SELECT (COUNT(*) - 1) AS total_other_submissions
          FROM submissions s2
          WHERE s2.team_id = fa.team_id
            AND s2.problem_id = fa.problem_id
            AND s2.contest_id = $1
        ) w ON true
      ),
      penalty_sum AS (
        SELECT team_id, SUM(penalty) AS total_penalty
        FROM penalty_per_problem
        GROUP BY team_id
      )
      SELECT
        t.id AS team_id,
        t.name AS team_name,

        COALESCE(COUNT(DISTINCT fa.problem_id), 0) AS solved_count,
        COALESCE(COUNT(s.id), 0) AS total_submissions,
        COALESCE(COUNT(s.id) FILTER (WHERE s.verdict != 'Accepted'), 0) AS wrong_submissions,

        COALESCE(
          (
            SELECT JSON_AGG(
              JSONB_BUILD_OBJECT(
                'id', p.id,
                'title', p.title,
                'accepted_at', fa2.first_accepted_at,
                'total_other_submissions', (
                  SELECT (COUNT(*) - 1) FROM submissions s3
                  WHERE s3.team_id = fa2.team_id
                    AND s3.problem_id = fa2.problem_id
                    AND s3.contest_id = $1
                )
              )
            )
            FROM first_accepts fa2
            JOIN problems p ON p.id = fa2.problem_id AND p.contest_id = $1
            WHERE fa2.team_id = t.id
          ),
          '[]'
        ) AS solved_problems,

        COALESCE(
          (
            SELECT JSON_AGG(JSONB_BUILD_OBJECT('id', p2.id, 'title', p2.title))
            FROM (
              SELECT DISTINCT s4.problem_id
              FROM submissions s4
              WHERE s4.contest_id = $1 AND s4.team_id = t.id
                AND s4.problem_id NOT IN (
                  SELECT problem_id FROM first_accepts fa3 WHERE fa3.team_id = t.id
                )
            ) q
            JOIN problems p2 ON p2.id = q.problem_id AND p2.contest_id = $1
          ),
          '[]'
        ) AS attempted_problems,

        COALESCE(
          (
            SELECT JSON_AGG(
              JSONB_BUILD_OBJECT(
                'id', s5.id,
                'problem_id', s5.problem_id,
                'verdict', s5.verdict,
                'submitted_at', s5.submitted_at
              )
              ORDER BY s5.submitted_at
            )
            FROM submissions s5
            WHERE s5.contest_id = $1 AND s5.team_id = t.id
          ),
          '[]'
        ) AS submissions,

        COALESCE(ps.total_penalty, 0)::INT AS total_penalty

      FROM teams t
      LEFT JOIN submissions s ON s.team_id = t.id AND s.contest_id = $1
      LEFT JOIN problems p ON p.id = s.problem_id AND p.contest_id = $1
      LEFT JOIN first_accepts fa ON fa.team_id = t.id AND fa.problem_id = p.id
      LEFT JOIN penalty_sum ps ON ps.team_id = t.id
      WHERE t.id = $2
      GROUP BY t.id, t.name, ps.total_penalty
      `,
      [contestId, teamId]
    );

    res.json(rows[0] || {});
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Failed to load team leaderboard' });
  }
};
