const express = require('express');

const app = express();
app.get('/', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.json({ message: 'Hello, world, from Express!' });
});

module.exports = app;
