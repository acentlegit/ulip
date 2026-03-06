# Production Setup Guide

## Quick Start

### 1. Frontend Deployment to S3

```bash
# Build the frontend
cd frontend
npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://legal-platform-frontend/ --delete

# Set cache control
aws s3 cp dist/index.html s3://legal-platform-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

aws s3 sync dist/assets/ s3://legal-platform-frontend/assets/ \
  --cache-control "max-age=31536000, public"
```

### 2. Backend Deployment to EC2

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@35.170.56.29

# Install Node.js (if needed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone or upload your code
cd ~
git clone <your-repo> legal-platform
cd legal-platform/backend

# Install dependencies
npm install --production

# Set up Prisma
npx prisma generate
npx prisma db push

# Create .env file
cp .env.production.example .env
# Edit .env with your values
nano .env

# Install PM2
npm install -g pm2

# Start the application
pm2 start src/server.js --name legal-platform-api
pm2 save
pm2 startup
```

### 3. Environment Variables

**Frontend** (already configured in build):
- API base URL defaults to: `http://35.170.56.29:5000`
- Can be overridden with `VITE_API_BASE_URL` environment variable during build

**Backend** (on EC2):
- Copy `backend/.env.production.example` to `backend/.env`
- Update with your actual values:
  - `BACKEND_URL=http://35.170.56.29:5000`
  - `FRONTEND_URL=https://your-cloudfront-url.cloudfront.net`
  - `JWT_SECRET=<generate-strong-secret>`

### 4. Security Group Configuration

On EC2, configure security group to allow:
- Port 5000: From CloudFront IPs or your frontend domain
- Port 22: From your IP (for SSH)

### 5. CORS Configuration

The backend is already configured to accept CORS requests. If needed, update in `backend/src/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-cloudfront-url.cloudfront.net',
  credentials: true
}));
```

## File Structure After Cleanup

```
legal-platform-enterprise/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── .env.production.example
│   └── (no node_modules - install on server)
├── frontend/
│   ├── src/
│   ├── dist/              # Production build (upload to S3)
│   ├── package.json
│   └── (no node_modules - install locally for builds)
├── DEPLOYMENT.md
├── S3_STRUCTURE.md
└── PRODUCTION_SETUP.md
```

## Verification

1. **Backend Health Check**:
   ```bash
   curl http://35.170.56.29:5000/health
   ```
   Should return: `{"status":"ok","database":"connected"}`

2. **Frontend**: Access via S3 website URL or CloudFront distribution

3. **Integration**: Login and verify API calls work

## Troubleshooting

### Backend not responding
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs legal-platform-api`
- Verify security group allows port 5000
- Check .env file exists and has correct values

### Frontend can't connect to backend
- Verify CORS settings
- Check backend URL in frontend config
- Verify security group allows requests from CloudFront

### Database errors
- Run: `npx prisma generate`
- Run: `npx prisma db push`
- Check DATABASE_URL in .env

## Maintenance

### Update Frontend
```bash
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://legal-platform-frontend/ --delete
# Invalidate CloudFront if using
```

### Update Backend
```bash
# On EC2
cd ~/legal-platform/backend
git pull
npm install --production
npx prisma generate
pm2 restart legal-platform-api
```

## Monitoring

- **PM2**: `pm2 monit` or `pm2 logs`
- **CloudWatch**: Monitor S3 and EC2 metrics
- **Health Endpoint**: Set up monitoring for `/health`
