# PuTTY Connection & Backend Setup Commands

## PuTTY Connection Settings

### Initial Connection
1. **Open PuTTY**
2. **Host Name (or IP address)**: `35.170.56.29`
3. **Port**: `22`
4. **Connection Type**: SSH
5. **Click "Open"**

### SSH Key Authentication
1. Before connecting, go to: **Connection → SSH → Auth**
2. Under "Private key file for authentication", browse and select your `.pem` file
3. Go back to "Session" and save the session for future use
4. Click "Open"

### Alternative: Convert .pem to .ppk
If PuTTY doesn't accept `.pem`:
1. Open **PuTTYgen**
2. Click "Load" → Select your `.pem` file
3. Click "Save private key" → Save as `.ppk`
4. Use this `.ppk` file in PuTTY

## Commands to Run After Connecting

### 1. Navigate to Project Directory
```bash
cd ~/legal-platform/backend
```

### 2. Check Node.js Installation
```bash
node --version
npm --version
```

**If Node.js is NOT installed**, run:
```bash
# For Amazon Linux 2
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install Dependencies
```bash
cd ~/legal-platform/backend
npm install --production
```

### 4. Set Up Prisma
```bash
# Generate Prisma Client
npx prisma generate

# Push database schema (creates dev.db if it doesn't exist)
npx prisma db push
```

### 5. Create .env File
```bash
cd ~/legal-platform/backend
nano .env
```

**Paste this content** (adjust values as needed):
```env
# Database Configuration
DATABASE_URL=file:./prisma/dev.db

# Server Configuration
PORT=5000
NODE_ENV=production

# API URLs
BACKEND_URL=http://35.170.56.29:5000
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net

# JWT Secret - Generate a strong secret
JWT_SECRET=your-strong-jwt-secret-change-this-in-production

# OAuth (Optional - if using SSO)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### 6. Generate JWT Secret (Optional but Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as `JWT_SECRET` in `.env`

### 7. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 8. Start the Application
```bash
cd ~/legal-platform/backend
pm2 start src/server.js --name legal-platform-api
```

### 9. Save PM2 Configuration
```bash
pm2 save
pm2 startup
```
Follow the instructions from `pm2 startup` to enable auto-start on reboot.

### 10. Check Application Status
```bash
# Check if running
pm2 status

# View logs
pm2 logs legal-platform-api

# Monitor in real-time
pm2 monit
```

### 11. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","timestamp":"...","database":"connected"}
```

## Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs legal-platform-api

# Restart application
pm2 restart legal-platform-api

# Stop application
pm2 stop legal-platform-api

# Delete from PM2
pm2 delete legal-platform-api

# Monitor resources
pm2 monit

# View detailed info
pm2 show legal-platform-api
```

## Security Group Configuration

Make sure your EC2 Security Group allows:
- **Port 22 (SSH)**: From your IP address
- **Port 5000 (Backend API)**: From CloudFront IPs or 0.0.0.0/0 (if public)

### Update Security Group via AWS Console:
1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rule:
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0 (or CloudFront IPs for better security)

## Troubleshooting

### Connection Issues
```bash
# Check if SSH is running
sudo systemctl status sshd

# Check if port 22 is open
sudo netstat -tlnp | grep :22
```

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs legal-platform-api --lines 50

# Check if port is in use
sudo netstat -tlnp | grep :5000

# Try running directly to see errors
cd ~/legal-platform/backend
node src/server.js
```

### Database Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or just push schema
npx prisma db push
```

### Permission Issues
```bash
# Fix file permissions
cd ~/legal-platform/backend
chmod -R 755 .
```

## Quick Setup Script

You can create a setup script on the server:

```bash
cd ~/legal-platform/backend

# Create setup script
cat > setup.sh << 'EOF'
#!/bin/bash
echo "Installing dependencies..."
npm install --production

echo "Setting up Prisma..."
npx prisma generate
npx prisma db push

echo "Installing PM2..."
sudo npm install -g pm2

echo "Setup complete!"
echo "Don't forget to create .env file with your configuration"
EOF

chmod +x setup.sh
./setup.sh
```

## Verification Checklist

- [ ] Connected to EC2 via PuTTY
- [ ] Node.js installed (v18+)
- [ ] Files uploaded via WinSCP
- [ ] Dependencies installed (`npm install --production`)
- [ ] Prisma set up (`npx prisma generate && npx prisma db push`)
- [ ] `.env` file created with correct values
- [ ] PM2 installed
- [ ] Application started with PM2
- [ ] Health endpoint working: `curl http://localhost:5000/health`
- [ ] Security group allows port 5000
- [ ] PM2 auto-start configured

## Next Steps

1. Test backend: `curl http://35.170.56.29:5000/health`
2. Update frontend CORS if needed
3. Set up monitoring and logging
4. Configure domain name (optional)
