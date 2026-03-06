# EC2 Server File Structure

## Complete Directory Structure on EC2

```
/home/ec2-user/
└── legal-platform/
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
        │   └── dev.db (created after: npx prisma db push)
        ├── node_modules/ (created after: npm install)
        ├── package.json
        ├── package-lock.json
        └── .env (create manually with your values)
```

## What to Upload via WinSCP

### ✅ Upload These Files/Folders:

1. **`src/`** - Entire source code directory
2. **`prisma/`** - Database schema and migrations
3. **`package.json`** - Dependencies list
4. **`package-lock.json`** - Locked dependency versions

### ❌ Do NOT Upload:

1. **`node_modules/`** - Install on server with `npm install`
2. **`.env`** - Create manually on server with your values
3. **`prisma/dev.db`** - Will be created automatically
4. **`.git/`** - Not needed on server
5. **Any frontend files** - Already in S3

## WinSCP Right Side (EC2) View

After upload, the right side should show:

```
/home/ec2-user/legal-platform/backend/
├── [📁] src/
├── [📁] prisma/
├── [📄] package.json
└── [📄] package-lock.json
```

## After Upload - Files Created on Server

After running setup commands, these will be added:

```
/home/ec2-user/legal-platform/backend/
├── [📁] src/
├── [📁] prisma/
│   └── dev.db (created)
├── [📁] node_modules/ (created)
├── [📄] package.json
├── [📄] package-lock.json
└── [📄] .env (you create this)
```

## File Sizes (Approximate)

- `src/` folder: ~200-300 KB
- `prisma/` folder: ~50-100 KB (without dev.db)
- `package.json`: ~2-3 KB
- `package-lock.json`: ~100-200 KB
- `node_modules/` (after install): ~50-100 MB
- `dev.db` (database): Grows with data

## Verification Commands

After upload, verify files on EC2:

```bash
# Check if files are uploaded
cd ~/legal-platform/backend
ls -la

# Should show:
# src/
# prisma/
# package.json
# package-lock.json

# Check file sizes
du -sh *

# Verify structure
tree -L 2
```

## Quick Upload Checklist

- [ ] Connected to EC2 via WinSCP
- [ ] Created `/home/ec2-user/legal-platform/` directory
- [ ] Uploaded `src/` folder
- [ ] Uploaded `prisma/` folder
- [ ] Uploaded `package.json`
- [ ] Uploaded `package-lock.json`
- [ ] Verified all files are present
- [ ] Ready to run setup commands via PuTTY
