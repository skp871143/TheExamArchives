const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the project's root directory
app.use(express.static(path.join(__dirname)));

// When the server starts, log a message to the console
app.listen(port, () => {
  console.log(`Server is running successfully.`);
  console.log(`View your project at: http://localhost:${port}`);
});