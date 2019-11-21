const jwt = require('jsonwebtoken');
require('../config');

const verifyToken = (request, response, next) => {
  // use either the cookie or check the authorization header for the token
  const token = request.cookies.token || request.headers.authorization.split(' ')[1] || '';
  try {
    if (!token) throw 'Invalid token';
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    if (request.body.userId && request.body.userId !== userId) throw 'Invalid user ID';
    next();
  } catch (err) {
    response.status(401).json({ error: new Error('Invalid request') });
    response.end();
  }
};

module.exports = verifyToken;
