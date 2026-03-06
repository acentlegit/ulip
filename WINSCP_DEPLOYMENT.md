# WinSCP Deployment Guide - Backend to EC2

## WinSCP Connection Settings

### Connection Details
- **File Protocol**: SFTP
- **Host Name**: `35.170.56.29`
- **Port Number**: `22`
- **User Name**: `ec2-user` (or `ubuntu` for Ubuntu instances)
- **Password**: Leave empty (use key file)
- **Private Key File**: Browse and select your `.pem` key file

### Connection Steps
1. Open WinSCP
2. Click "New Session"
3. Enter the connection details above
4. Click "Advanced" → "SSH" → "Authentication"
5. Select your `.pem` private key file
6. Click "OK" and "Login"

## File Structure on EC2 (Right Side)

Upload only the **backend** folder contents. Here's what should be on your EC2 server:

```
/home/ec2-user/legal-platform/
└── backend/
    ├── src/
    │   ├── constants/
    │   │   └── roles.js
    │   ├── middleware/
    │   │   ├── audit.js
    │   │   └── auth.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── calendar.js
    │   │   ├── case-factors.js
    │   │   ├── cases.js
    │   │   ├── clients.js
    │   │   ├── dashboard.js
    │   │   ├── documents.js
    │   │   ├── invoices.js
    │   │   ├── organizations.js
    │   │   ├── predictive-analysis.js
    │   │   ├── tasks.js
    │   │   ├── time-tracking.js
    │   │   └── users.js
    │   └── server.js
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   │   ├── 20260226174007_init/
    │   │   │   └── migration.sql
    │   │   ├── 20260305170941_add_case_factors/
    │   │   │   └── migration.sql
    │   │   ├── add_case_factors.sql
    │   │   └── migration_lock.toml
    │   └── dev.db (will be created on server)
    ├── package.json
    ├── package-lock.json
    └── .env (create this on server)

```

## Files to Upload via WinSCP

### ✅ Upload These (Select in WinSCP):
- `backend/src/` (entire folder)
- `backend/prisma/` (entire folder, including migrations)
- `backend/package.json`
- `backend/package-lock.json`

### ❌ DO NOT Upload:
- `backend/node_modules/` (install on server)
- `backend/.env` (create on server with your values)
- `frontend/` folder (already in S3)
- Any `.git/` folders
- `backend/prisma/dev.db` (will be created on server)

## WinSCP Upload Steps

1. **Connect to EC2** using WinSCP with your credentials

2. **Navigate to home directory** on right side (EC2):
   ```
   /home/ec2-user/
   ```

3. **Create project directory** (if it doesn't exist):
   - Right-click in right panel → "New" → "Directory"
   - Name: `legal-platform`

4. **Navigate into** `legal-platform` folder

5. **Upload backend folder**:
   - On left side (your PC): Navigate to `C:\MY APPLICATIONS\legal-platform-enterprise\backend`
   - Select these folders/files:
     - `src/` folder
     - `prisma/` folder
     - `package.json`
     - `package-lock.json`
   - Drag and drop to right side (EC2) into `/home/ec2-user/legal-platform/`
   - Or right-click → "Upload"

6. **Verify upload**:
   - Right side should show:
     ```
     /home/ec2-user/legal-platform/
     ├── src/
     ├── prisma/
     ├── package.json
     └── package-lock.json
     ```

## After Upload - Next Steps

After uploading files, you'll need to:
1. Connect via PuTTY (see `PUTTY_COMMANDS.md`)
2. Install Node.js (if not installed)
3. Install dependencies: `npm install --production`
4. Set up Prisma: `npx prisma generate && npx prisma db push`
5. Create `.env` file with your configuration
6. Start the server with PM2

See `PUTTY_COMMANDS.md` for detailed commands.
