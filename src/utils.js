const jwt = require('jsonwebtoken');

require('./config');

module.exports = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
