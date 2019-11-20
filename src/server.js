const { createServer } = require('http');
require('./config');
const app = require('./app');

const normalizePort = value => {
  const port = parseInt(value, 10);

  if (Number.isNaN(port)) return value;

  if (port >= 0) return port;

  return false;
};

const port = normalizePort(process.env.PORT || 3000);
const server = createServer(app);

server.listen(port);
