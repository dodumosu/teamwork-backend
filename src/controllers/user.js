const pool = require('../database/connection');
const UserHelper = require('../database/user');
const generateToken = require('../utils');

const createUser = (request, response) => {
  const userHelper = new UserHelper(pool);
};

const login = async (request, response) => {
  const userHelper = new UserHelper(pool);
  const user = await userHelper.authenticate(request.body.email, request.body.password);
  if (user !== null) {
    const token = generateToken(user.id);
    response.cookie('token', token, { httpOnly: true, signed: true, maxAge: 60 * 60 * 1000 });
    response.status(200).json({
      status: 'success',
      data: {
        token: token,
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
