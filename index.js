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
    /^https:\/\/.*\.vercel\.app$/, // Any Vercel subdomain
    /^https:\/\/.*\.onrender\.com$/ // Any Render subdomain (for testing)
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

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Digital Library API'
  });
});

// For Render and other platforms
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});