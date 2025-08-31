const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Test server is working!',
    timestamp: new Date().toISOString()
  }));
});

server.listen(5000, '127.0.0.1', () => {
  console.log('Test server running at http://127.0.0.1:5000/');
});
