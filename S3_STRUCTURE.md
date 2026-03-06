# S3 Bucket Structure for Frontend Deployment

## Recommended S3 Bucket Structure

```
legal-platform-frontend/
│
├── index.html                    # Main HTML entry point (SPA)
│
├── assets/                        # Compiled and optimized assets
│   ├── index-[hash].js           # Main application JavaScript bundle
│   ├── vendor-[hash].js           # Vendor libraries (React, React-DOM, React-Router)
│   ├── axios-[hash].js            # HTTP client library
│   └── index-[hash].css          # Compiled CSS stylesheet
│
└── [other static assets]          # Any additional static files (images, fonts, etc.)
```

## File Details

### Root Level
- **index.html**: Single Page Application entry point. All routes are handled client-side.

### Assets Directory
All compiled JavaScript and CSS files are placed in the `assets/` directory with content-based hashing for cache busting:
- Hash in filename ensures new deployments invalidate browser cache
- Files are minified and optimized for production
- Vendor code is split for better caching

## S3 Configuration

### Bucket Settings
- **Bucket Name**: `legal-platform-frontend` (or your preferred name)
- **Region**: Choose based on your primary user base
- **Versioning**: Enable for rollback capability
- **Public Access**: Enable for static website hosting

### Static Website Hosting
- **Index Document**: `index.html`
- **Error Document**: `index.html` (required for SPA routing)
- **Redirect Rules**: Not needed for basic setup

### Bucket Policy (Public Read)
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

### CORS Configuration (if needed)
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Upload Commands

### Basic Upload
```bash
cd frontend
aws s3 sync dist/ s3://legal-platform-frontend/ --delete
```

### Upload with Cache Control
```bash
# Upload assets with long cache (1 year)
aws s3 sync dist/assets/ s3://legal-platform-frontend/assets/ \
  --cache-control "max-age=31536000, public" \
  --delete

# Upload index.html with no cache
aws s3 cp dist/index.html s3://legal-platform-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"
```

### Upload with Compression
```bash
# Enable gzip compression (if not done by CloudFront)
aws s3 sync dist/ s3://legal-platform-frontend/ \
  --content-encoding gzip \
  --exclude "*.html" \
  --delete
```

## CloudFront Integration

When using CloudFront, the structure remains the same, but CloudFront handles:
- HTTPS termination
- Gzip compression
- Edge caching
- Custom error pages for SPA routing

### CloudFront Cache Behaviors
1. **Default Behavior**: Cache based on headers
2. **Assets Path Pattern** (`/assets/*`): 
   - Cache TTL: 1 year
   - Compress: Yes
3. **HTML Files** (`*.html`):
   - Cache TTL: 0 (no cache)
   - Compress: Yes

## File Sizes (Approximate)

After build, typical file sizes:
- `index.html`: ~0.5-1 KB
- `index-[hash].js`: ~250-300 KB (gzipped: ~45 KB)
- `vendor-[hash].js`: ~160-170 KB (gzipped: ~53 KB)
- `axios-[hash].js`: ~35-40 KB (gzipped: ~15 KB)
- `index-[hash].css`: ~3-4 KB (gzipped: ~1-2 KB)

## Maintenance

### Updating the Frontend
1. Build new version: `npm run build`
2. Upload to S3: `aws s3 sync dist/ s3://legal-platform-frontend/ --delete`
3. Invalidate CloudFront cache (if using): 
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

### Monitoring
- Monitor S3 requests in CloudWatch
- Track CloudFront metrics (if using)
- Set up S3 access logging

## Security Considerations

1. **HTTPS**: Always use CloudFront or ALB with SSL certificate
2. **Bucket Policy**: Restrict to CloudFront OAI if using CloudFront
3. **Versioning**: Enable for disaster recovery
4. **Lifecycle Policies**: Archive old versions to Glacier (optional)

## Cost Optimization

1. **S3 Intelligent-Tiering**: Automatically moves files to cheaper storage
2. **CloudFront Caching**: Reduces S3 requests
3. **Compression**: Reduces bandwidth costs
4. **Lifecycle Policies**: Move old versions to cheaper storage classes
