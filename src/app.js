const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

require('./config');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.json({ message: 'Hello, world, from Express!' });
});

module.exports = app;
