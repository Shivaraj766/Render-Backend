# Render Deployment Configuration

## Service Type: Web Service

### Build Command:
```
npm install
```

### Start Command:
```
npm start
```

### Environment Variables:
- `NODE_ENV`: `production`
- `PORT`: (Auto-configured by Render)

### Auto-Deploy:
✅ Enable auto-deploy from main branch

### Health Check:
- Path: `/`
- Expected Status: 200

### Instance Type:
- Free tier (512 MB RAM, 0.1 CPU)

### Custom Domain:
- Available on free tier
- Example: `your-backend.onrender.com`
