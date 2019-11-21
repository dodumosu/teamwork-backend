const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('../config');
const pool = require('../database/connection');
const UserHelper = require('../database/user');

const createUser = (request, response) => {
  const userHelper = new UserHelper(pool);
};

const login = async (request, response) => {
  const userHelper = new UserHelper(pool);
  const user = await userHelper.authenticate(request.body.email, request.body.password);
  if (user !== null) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    response.cookies('token', token, { httpOnly: true, signed: true });
    response.status(200).json({
      status: 'success',
      data: {
        token: JSON.stringify(token),
        userId: user.id
      }
    });
  } else {
    response.status(401).json({
      status: 'error',
      error: 'Login failed. Please check your credentials'
    });
  }
};

module.exports = {
  createUser,
  login
};
