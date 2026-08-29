const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;


// =========================
// TEAM AUTHENTICATION
// =========================

function authenticate(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const payload = jwt.verify(token, JWT_SECRET);

    // Make sure this is a TEAM token
    if (payload.type !== 'team') {
      return res.status(403).json({ error: 'Team access required' });
    }

    req.user = payload;

    next();

  } catch (err) {

    return res.status(401).json({ error: 'Invalid token' });

  }
}


// =========================
// ADMIN AUTHENTICATION
// =========================

function authenticateAdmin(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const payload = jwt.verify(token, JWT_SECRET);

    // Make sure this is an ADMIN token
    if (payload.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = payload;

    next();

  } catch (err) {

    return res.status(401).json({ error: 'Invalid token' });

  }
}


module.exports = {
  authenticate,
  authenticateAdmin
};