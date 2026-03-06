# S3 Upload Guide - Quick Reference

## S3 Bucket Structure

```
s3://legal-platform-frontend/
│
├── index.html                    # 568 bytes - Main entry point
│
└── assets/                       # Compiled production assets
    ├── index-8e02b016.js        # 263 KB - Main app bundle
    ├── vendor-0eaea133.js       # 163 KB - React & dependencies
    ├── axios-48cf6512.js        # 36 KB - HTTP client
    └── index-e69a00fa.css       # 3.5 KB - Styles
```

## AWS CLI Upload Commands

### 1. Create S3 Bucket
```bash
aws s3 mb s3://legal-platform-frontend --region us-east-1
```

### 2. Enable Static Website Hosting
```bash
aws s3 website s3://legal-platform-frontend/ \
  --index-document index.html \
  --error-document index.html
```

### 3. Upload All Files
```bash
cd frontend
aws s3 sync dist/ s3://legal-platform-frontend/ --delete
```

### 4. Set Proper Cache Headers
```bash
# HTML - No cache (for SPA routing)
aws s3 cp dist/index.html s3://legal-platform-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Assets - Long cache (1 year)
aws s3 sync dist/assets/ s3://legal-platform-frontend/assets/ \
  --cache-control "max-age=31536000, public" \
  --delete
```

### 5. Set Bucket Policy (Public Read)
```bash
aws s3api put-bucket-policy --bucket legal-platform-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::legal-platform-frontend/*"
  }]
}'
```

## File Mapping

| Local File | S3 Location | Size | Cache |
|-----------|-------------|------|-------|
| `dist/index.html` | `s3://legal-platform-frontend/index.html` | 568 B | No cache |
| `dist/assets/index-*.js` | `s3://legal-platform-frontend/assets/index-*.js` | 263 KB | 1 year |
| `dist/assets/vendor-*.js` | `s3://legal-platform-frontend/assets/vendor-*.js` | 163 KB | 1 year |
| `dist/assets/axios-*.js` | `s3://legal-platform-frontend/assets/axios-*.js` | 36 KB | 1 year |
| `dist/assets/index-*.css` | `s3://legal-platform-frontend/assets/index-*.css` | 3.5 KB | 1 year |

## Verification

After upload, verify files:
```bash
aws s3 ls s3://legal-platform-frontend/ --recursive
```

Expected output:
```
2026-03-06 16:00:00        568 index.html
2026-03-06 16:00:00     3563 assets/index-e69a00fa.css
2026-03-06 16:00:00    36488 assets/axios-48cf6512.js
2026-03-06 16:00:00   263165 assets/index-8e02b016.js
2026-03-06 16:00:00   163297 assets/vendor-0eaea133.js
```

## Website URL

After enabling static website hosting, your website URL will be:
```
http://legal-platform-frontend.s3-website-us-east-1.amazonaws.com
```

Or with region:
```
http://legal-platform-frontend.s3-website.<region>.amazonaws.com
```

## Next Steps

1. ✅ Upload files to S3
2. ⬜ Configure CloudFront (recommended for HTTPS)
3. ⬜ Set up custom domain (optional)
4. ⬜ Configure CORS if needed
5. ⬜ Test the deployment

## Troubleshooting

**Files not accessible?**
- Check bucket policy allows public read
- Verify static website hosting is enabled
- Check file permissions

**404 errors on routes?**
- Ensure error document is set to `index.html`
- Verify CloudFront error pages (if using)

**API calls failing?**
- Check CORS configuration on backend
- Verify backend URL in frontend config
- Check EC2 security group allows requests
