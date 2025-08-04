const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 🚀 Performance optimizations
let syllabusCache = null; // Cache the JSON data in memory
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load syllabus data into memory on startup
const loadSyllabusData = () => {
  console.log('📦 Loading syllabus data into memory...');
  const syllabusPath = path.join(__dirname, 'syllabus.json');
  try {
    const data = fs.readFileSync(syllabusPath, 'utf8');
    syllabusCache = JSON.parse(data);
    cacheTime = Date.now();
    console.log('✅ Syllabus data cached successfully');
  } catch (error) {
    console.error('❌ Error loading syllabus data:', error);
  }
};

// Load data on startup
loadSyllabusData();

// CORS configuration for separate frontend deployment
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://vercel-frontend-lime-two.vercel.app', // Your actual Vercel frontend URL
    /^https:\/\/.*\.vercel\.app$/, // Any Vercel subdomain
    /^https:\/\/.*\.onrender\.com$/ // Any Render subdomain (for testing)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); 

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Serve syllabus.json data at / with caching
app.get('/', (req, res) => {
  console.log('📚 Syllabus data requested');
  const start = Date.now();
  
  // Check if cache needs refresh
  if (!syllabusCache || (Date.now() - cacheTime) > CACHE_DURATION) {
    console.log('🔄 Refreshing syllabus cache...');
    loadSyllabusData();
  }
  
  if (syllabusCache) {
    // Set cache headers for browser caching
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
      'ETag': `"${cacheTime}"`,
      'Last-Modified': new Date(cacheTime).toUTCString()
    });
    
    const duration = Date.now() - start;
    console.log(`✅ Syllabus data sent in ${duration}ms (${Object.keys(syllabusCache).length} regulations)`);
    res.json(syllabusCache);
  } else {
    console.error('❌ No syllabus data available');
    res.status(500).json({ 
      error: 'Syllabus data not available',
      message: 'Please try again in a few moments'
    });
  }
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