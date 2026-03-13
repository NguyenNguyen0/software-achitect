const jwt = require('jsonwebtoken');
const config = require('../../config/default');

const ROLE_HIERARCHY = { admin: 4, editor: 3, author: 2, viewer: 1 };

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const required = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] || 99));
    if (userLevel < required) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
