const db = require('../config/db');


// ============================================================
// TEAM: CREATE A CLARIFICATION
// ============================================================

exports.createClarification = async (req, res) => {

  const teamId = req.user.id;

  const { contest_id, problem_id, message } = req.body;

  if (!contest_id || !problem_id || !message) {
    return res.status(400).json({
      error: 'contest_id, problem_id, and message are required'
    });
  }

  try {

    // Make sure the problem actually belongs to this contest
    const problemResult = await db.query(
      `
      SELECT id
      FROM problems
      WHERE id = $1
        AND contest_id = $2
      `,
      [problem_id, contest_id]
    );

    if (problemResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Problem not found in this contest'
      });
    }


    // Create the clarification
    const clarificationResult = await db.query(
      `
      INSERT INTO clarifications
        (contest_id, team_id, problem_id)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [contest_id, teamId, problem_id]
    );

    const clarification = clarificationResult.rows[0];


    // Create the team's first message
    const messageResult = await db.query(
      `
      INSERT INTO clarification_messages
        (clarification_id, team_id, message, visibility)
      VALUES
        ($1, $2, $3, 'PRIVATE')
      RETURNING *
      `,
      [
        clarification.id,
        teamId,
        message
      ]
    );


    res.status(201).json({
      clarification,
      message: messageResult.rows[0]
    });

  } catch (err) {

    console.error('Create clarification error:', err);

    res.status(500).json({
      error: 'Failed to create clarification'
    });

  }
};



// ============================================================
// TEAM: GET THEIR OWN CLARIFICATIONS
// ============================================================

exports.getTeamClarifications = async (req, res) => {

  const teamId = req.user.id;

  try {

    const result = await db.query(
      `
      SELECT
        c.id,
        c.contest_id,
        c.problem_id,
        c.status,
        c.created_at,

        cm.id AS message_id,
        cm.message,
        cm.visibility,
        cm.created_at AS message_created_at,

        cm.team_id AS message_team_id,
        cm.admin_id AS message_admin_id

      FROM clarifications c

      JOIN clarification_messages cm
        ON cm.clarification_id = c.id

      WHERE c.team_id = $1

      ORDER BY c.created_at DESC, cm.created_at ASC
      `,
      [teamId]
    );


    res.json(result.rows);

  } catch (err) {

    console.error('Get team clarifications error:', err);

    res.status(500).json({
      error: 'Failed to retrieve clarifications'
    });

  }
};



// ============================================================
// TEAM: GET ONE CLARIFICATION
// ============================================================

exports.getTeamClarification = async (req, res) => {

  const teamId = req.user.id;
  const clarificationId = req.params.id;

  try {

    const result = await db.query(
      `
      SELECT
        c.id,
        c.contest_id,
        c.team_id,
        c.problem_id,
        c.status,
        c.created_at,

        cm.id AS message_id,
        cm.team_id AS message_team_id,
        cm.admin_id AS message_admin_id,
        cm.message,
        cm.visibility,
        cm.created_at AS message_created_at

      FROM clarifications c

      JOIN clarification_messages cm
        ON cm.clarification_id = c.id

      WHERE c.id = $1
        AND c.team_id = $2

      ORDER BY cm.created_at ASC
      `,
      [clarificationId, teamId]
    );


    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Clarification not found'
      });
    }


    res.json(result.rows);

  } catch (err) {

    console.error('Get clarification error:', err);

    res.status(500).json({
      error: 'Failed to retrieve clarification'
    });

  }
};



// ============================================================
// ADMIN: GET ALL CLARIFICATIONS
// ============================================================

exports.getAllClarifications = async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT
        c.id,
        c.contest_id,
        c.team_id,
        t.name AS team_name,
        c.problem_id,
        c.status,
        c.created_at,

        cm.id AS message_id,
        cm.team_id AS message_team_id,
        cm.admin_id AS message_admin_id,
        cm.message,
        cm.visibility,
        cm.created_at AS message_created_at

      FROM clarifications c

      JOIN teams t
        ON t.id = c.team_id

      JOIN clarification_messages cm
        ON cm.clarification_id = c.id

      ORDER BY c.created_at DESC, cm.created_at ASC
      `
    );


    res.json(result.rows);

  } catch (err) {

    console.error('Get all clarifications error:', err);

    res.status(500).json({
      error: 'Failed to retrieve clarifications'
    });

  }
};



// ============================================================
// ADMIN: RESPOND TO A CLARIFICATION
// ============================================================

exports.respondToClarification = async (req, res) => {

  const adminId = req.user.id;
  const clarificationId = req.params.id;

  const { message, visibility } = req.body;

  if (!message || !visibility) {
    return res.status(400).json({
      error: 'message and visibility are required'
    });
  }

  if (!['PRIVATE', 'PUBLIC'].includes(visibility)) {
    return res.status(400).json({
      error: 'visibility must be PRIVATE or PUBLIC'
    });
  }

  try {

    // Make sure the clarification exists
    const clarificationResult = await db.query(
      `
      SELECT id
      FROM clarifications
      WHERE id = $1
      `,
      [clarificationId]
    );

    if (clarificationResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Clarification not found'
      });
    }


    // Insert admin response
    const result = await db.query(
      `
      INSERT INTO clarification_messages
        (clarification_id, admin_id, message, visibility)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        clarificationId,
        adminId,
        message,
        visibility
      ]
    );


    // Mark clarification as answered
    await db.query(
      `
      UPDATE clarifications
      SET status = 'ANSWERED'
      WHERE id = $1
      `,
      [clarificationId]
    );


    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.error('Respond to clarification error:', err);

    res.status(500).json({
      error: 'Failed to respond to clarification'
    });

  }
};



// ============================================================
// ADMIN: SEND ANNOUNCEMENT TO EVERYONE
// ============================================================

exports.createAnnouncement = async (req, res) => {

  const adminId = req.user.id;

  const { contest_id, message } = req.body;

  if (!contest_id || !message) {
    return res.status(400).json({
      error: 'contest_id and message are required'
    });
  }

  try {

    // Make sure contest exists
    const contestResult = await db.query(
      `
      SELECT id
      FROM contests
      WHERE id = $1
      `,
      [contest_id]
    );

    if (contestResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Contest not found'
      });
    }


    const result = await db.query(
      `
      INSERT INTO contest_announcements
        (contest_id, admin_id, message)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [
        contest_id,
        adminId,
        message
      ]
    );


    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.error('Create announcement error:', err);

    res.status(500).json({
      error: 'Failed to create announcement'
    });

  }
};



// ============================================================
// TEAM: GET PUBLIC ANNOUNCEMENTS
// ============================================================

exports.getAnnouncements = async (req, res) => {

  const { contest_id } = req.query;

  if (!contest_id) {
    return res.status(400).json({
      error: 'contest_id is required'
    });
  }

  try {

    const result = await db.query(
      `
      SELECT
        ca.id,
        ca.contest_id,
        ca.admin_id,
        ca.message,
        ca.created_at

      FROM contest_announcements ca

      WHERE ca.contest_id = $1

      ORDER BY ca.created_at DESC
      `,
      [contest_id]
    );


    res.json(result.rows);

  } catch (err) {

    console.error('Get announcements error:', err);

    res.status(500).json({
      error: 'Failed to retrieve announcements'
    });

  }
};

// ============================================================
// TEAM: GET PUBLIC CLARIFICATION RESPONSES
// ============================================================

exports.getPublicClarifications = async (req, res) => {

  const { contest_id } = req.query;


  console.log('PUBLIC CLARIFICATIONS QUERY:', req.query);

  if (!contest_id) {
    return res.status(400).json({
      error: 'contest_id is required'
    });
  }

  try {

    const result = await db.query(
      `
      SELECT
        c.id AS clarification_id,
        c.contest_id,
        c.problem_id,

        cm.id AS message_id,
        cm.admin_id,
        cm.message,
        cm.created_at

      FROM clarifications c

      JOIN clarification_messages cm
        ON cm.clarification_id = c.id

      WHERE c.contest_id = $1
        AND cm.visibility = 'PUBLIC'
        AND cm.admin_id IS NOT NULL

      ORDER BY cm.created_at DESC
      `,
      [contest_id]
    );

    res.json(result.rows);

  } catch (err) {

    console.error('Get public clarifications error:', err);

    res.status(500).json({
      error: 'Failed to retrieve public clarifications'
    });

  }
};