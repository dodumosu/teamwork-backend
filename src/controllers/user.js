const pool = require('../database/connection');
const UserHelper = require('../database/user');
const generateToken = require('../utils');

const createUser = async (request, response) => {
  const userHelper = new UserHelper(pool);
  const currentUserId = request.body.userId || 0;
  const currentUser = await userHelper.getUser(currentUserId);
  if (currentUser.email !== 'admin@example.com') {
    response
      .status(403)
      .json({
        status: 'error',
        error: 'You are not allowed to perform this action'
      })
      .end();
  }

  const newUser = await userHelper.createUser(request.body);
  if (newUser === null)
    response.status(400).json({
      status: 'error',
      error: 'You need to specify all data fields for the user'
    });
  else
    response.status(200).json({
      status: 'success',
      data: {
        message: 'User account successfully created',
        userId: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });
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
