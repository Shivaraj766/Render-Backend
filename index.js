const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for separate frontend deployment
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://your-frontend-app.vercel.app', // Production frontend URL
    /^https:\/\/.*\.vercel\.app$/ // Any Vercel subdomain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); 
// Serve syllabus.json data at /syllabus
app.get('/', (req, res) => {
  const syllabusPath = path.join(__dirname, 'syllabus.json');
  fs.readFile(syllabusPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read syllabus.json' });
    }
    res.json(JSON.parse(data));
  });
});

// For Vercel serverless functions
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}