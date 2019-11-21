const { verify } = require('jsonwebtoken');
require('../config');

const verifyToken = (request, response, next) => {
  // use either the cookie or check the authorization header for the token
  const token = request.cookies.token || request.headers.authorization.split(' ')[1] || '';
  try {
    if (!token) throw new Error('Invalid token');
    const { userId } = verify(token, process.env.JWT_SECRET);
    if (request.body.userId && request.body.userId !== userId) throw new Error('Invalid user ID');
    next();
  } catch (err) {
    response.status(401).json({
      error: new Error('Invalid request'),
      status: 'error'
    });
    response.end();
  }
};

module.exports = verifyToken;
