# Quick Deployment Guide - WinSCP + PuTTY

## Step 1: WinSCP - Upload Files

### Connection
- **Host**: `35.170.56.29`
- **Protocol**: SFTP
- **User**: `ec2-user`
- **Key**: Your `.pem` file

### Upload Location
Right side (EC2): `/home/ec2-user/legal-platform/backend/`

### Files to Upload
1. Drag `backend/src/` folder
2. Drag `backend/prisma/` folder  
3. Drag `backend/package.json`
4. Drag `backend/package-lock.json`

## Step 2: PuTTY - Run Commands

### Connect
- **Host**: `35.170.56.29`
- **Port**: `22`
- **Key**: Your `.pem` or `.ppk` file

### Run These Commands (Copy-Paste)

```bash
# 1. Navigate to project
cd ~/legal-platform/backend

# 2. Install Node.js (if needed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Install dependencies
npm install --production

# 4. Setup Prisma
npx prisma generate
npx prisma db push

# 5. Create .env file
cat > .env << 'EOF'
DATABASE_URL=file:./prisma/dev.db
PORT=5000
NODE_ENV=production
BACKEND_URL=http://35.170.56.29:5000
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EOF

# 6. Install PM2
sudo npm install -g pm2

# 7. Start application
pm2 start src/server.js --name legal-platform-api

# 8. Save PM2 config
pm2 save
pm2 startup

# 9. Test
curl http://localhost:5000/health
```

## Step 3: Verify

```bash
# Check status
pm2 status

# View logs
pm2 logs legal-platform-api

# Test from outside (if security group allows)
curl http://35.170.56.29:5000/health
```

## Done! ✅

Your backend is now running on EC2 at `35.170.56.29:5000`
