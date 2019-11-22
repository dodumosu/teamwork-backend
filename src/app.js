const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

require('./config');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const gifRoutes = require('./routes/gif');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors());
app.use(helmet());
app.use('/api/v1', [articleRoutes, gifRoutes, userRoutes]);

module.exports = app;
