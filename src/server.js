const { createServer } = require('http');
require('./config');

const normalizePort = value => {
  const port = parseInt(value, 10);

  if (isNaN(port)) return value;

  if (port >= 0) return port;

  return false;
};

const port = normalizePort(process.env.PORT || 3000);
const server = createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Hello, world!' }));
});

server.listen(port);
