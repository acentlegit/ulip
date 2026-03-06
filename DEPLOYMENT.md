# AWS Deployment Guide

## Overview
This document provides instructions for deploying the Legal Platform Enterprise application to AWS.

## Architecture
- **Frontend**: Static files deployed to S3 bucket with CloudFront CDN
- **Backend**: Node.js/Express API running on EC2 instance (IP: 35.170.56.29)

## S3 Bucket Structure for Frontend

```
s3://your-bucket-name/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── vendor-[hash].js
│   ├── axios-[hash].js
│   └── index-[hash].css
└── [other static assets]
```

### Detailed S3 Structure

```
legal-platform-frontend/
│
├── index.html                    # Main entry point
│
├── assets/                        # Compiled JavaScript and CSS
│   ├── index-[hash].js          # Main application bundle
│   ├── vendor-[hash].js         # Vendor dependencies (React, React-DOM, React-Router)
│   ├── axios-[hash].js          # Axios HTTP client
│   └── index-[hash].css         # Compiled CSS styles
│
└── [other static files]          # Any additional static assets
```

### S3 Bucket Configuration

1. **Bucket Name**: `legal-platform-frontend` (or your preferred name)
2. **Region**: Choose your preferred AWS region
3. **Public Access**: Enable for static website hosting
4. **Static Website Hosting**: Enable with `index.html` as index document
5. **Error Document**: `index.html` (for SPA routing)

### S3 Upload Steps

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://legal-platform-frontend --region us-east-1
   ```

2. **Enable Static Website Hosting**:
   - Go to S3 Console → Your Bucket → Properties → Static website hosting
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html`

3. **Set Bucket Policy** (for public read access):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::legal-platform-frontend/*"
       }
     ]
   }
   ```

4. **Upload Build Files**:
   ```bash
   cd frontend
   aws s3 sync dist/ s3://legal-platform-frontend/ --delete
   ```

5. **Set Cache Control** (optional, for better performance):
   ```bash
   aws s3 sync dist/ s3://legal-platform-frontend/ \
     --cache-control "max-age=31536000" \
     --exclude "index.html" \
     --delete
   
   aws s3 cp dist/index.html s3://legal-platform-frontend/index.html \
     --cache-control "no-cache, no-store, must-revalidate"
   ```

## CloudFront Distribution (Recommended)

For better performance and HTTPS support:

1. **Create CloudFront Distribution**:
   - Origin: S3 bucket (or S3 website endpoint)
   - Default root object: `index.html`
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS

2. **Custom Error Pages**:
   - 403 → 200 → `/index.html`
   - 404 → 200 → `/index.html`

3. **Cache Behaviors**:
   - Default: Cache based on headers
   - Assets: Long cache (1 year)
   - HTML: No cache

## Backend Configuration (EC2)

### Environment Variables

Create a `.env` file on your EC2 instance:

```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Server
PORT=5000
NODE_ENV=production

# API URLs
BACKEND_URL=http://35.170.56.29:5000
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net

# JWT Secret (generate a strong secret)
JWT_SECRET=your-strong-jwt-secret-here

# OAuth (if using SSO)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### EC2 Setup Steps

1. **SSH into EC2 instance**:
   ```bash
   ssh -i your-key.pem ec2-user@35.170.56.29
   ```

2. **Install Node.js** (if not installed):
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Clone/Upload application**:
   ```bash
   git clone <your-repo> legal-platform
   cd legal-platform/backend
   ```

4. **Install dependencies**:
   ```bash
   npm install --production
   ```

5. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Create .env file** with the configuration above

7. **Set up PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name legal-platform-api
   pm2 save
   pm2 startup
   ```

8. **Configure Security Group**:
   - Allow inbound traffic on port 5000 from CloudFront IPs or your frontend domain
   - Or use Application Load Balancer for better security

9. **Set up Nginx** (reverse proxy, optional):
   ```nginx
   server {
       listen 80;
       server_name 35.170.56.29;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## CORS Configuration

The backend is configured to accept requests from your frontend domain. Update CORS settings in `backend/src/server.js` if needed:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-cloudfront-url.cloudfront.net',
  credentials: true
}));
```

## Deployment Checklist

- [ ] S3 bucket created and configured
- [ ] Frontend build files uploaded to S3
- [ ] CloudFront distribution created (optional but recommended)
- [ ] EC2 instance configured with Node.js
- [ ] Backend dependencies installed
- [ ] Database initialized
- [ ] Environment variables set on EC2
- [ ] Backend service running (PM2 or systemd)
- [ ] Security groups configured
- [ ] CORS settings updated
- [ ] SSL certificates configured (CloudFront or ALB)
- [ ] Domain name configured (optional)

## Testing

1. **Frontend**: Access via S3 website URL or CloudFront distribution
2. **Backend**: Test health endpoint: `http://35.170.56.29:5000/health`
3. **Integration**: Verify frontend can communicate with backend API

## Monitoring

- **CloudWatch**: Monitor S3 and CloudFront metrics
- **PM2**: Monitor backend process: `pm2 monit`
- **Logs**: Check PM2 logs: `pm2 logs legal-platform-api`

## Rollback Procedure

1. **Frontend**: Revert to previous S3 version or CloudFront distribution
2. **Backend**: Use PM2 to restart previous version: `pm2 restart legal-platform-api`

## Cost Optimization

- Use S3 Intelligent-Tiering for storage
- Enable CloudFront caching
- Use EC2 Spot Instances for development
- Set up auto-scaling for production
