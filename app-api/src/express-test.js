// In this file, let's create a very simple server for testing
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.json({
    message: 'Express test server is working!',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Express test server running at http://localhost:${port}/`);
});
