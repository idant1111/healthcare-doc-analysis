# S3 Deployment Troubleshooting Guide

This guide addresses common issues that may occur when deploying the Healthcare Document Analysis application to Amazon S3.

## Common Issues

### 404 Not Found - "The specified bucket does not have a website configuration"

**Problem**: You see a 404 error page with the message "The specified bucket does not have a website configuration" when trying to access your S3 website.

**Solution**:

1. **Configure the bucket for static website hosting**:

   ```bash
   aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
   ```

   In PowerShell:
   ```powershell
   aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
   ```

2. **Verify the bucket policy allows public access**:

   ```bash
   aws s3api get-bucket-policy --bucket your-bucket-name
   ```

   If the policy is missing or incorrect, apply the correct policy:

   ```bash
   aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }'
   ```

3. **Check S3 Block Public Access settings**:

   Make sure that the bucket's "Block Public Access" settings are not preventing public access. You can check and modify these settings in the AWS Management Console:
   
   - Go to the S3 bucket in the AWS Management Console
   - Click on the "Permissions" tab
   - Look for "Block public access" settings
   - Make sure the appropriate settings are disabled to allow public access

### Assets Not Loading (404 for CSS/JS files)

**Problem**: The website loads but CSS, JavaScript, or other assets return 404 errors.

**Solution**:

1. **Check the paths in the HTML**:
   
   Make sure all asset paths in the HTML are relative, not absolute. For example, use `./assets/main.js` instead of `/assets/main.js`.

2. **Rebuild with correct Vite configuration**:
   
   Make sure your `vite.config.ts` file is configured correctly for S3:

   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/',
     build: {
       assetsDir: 'assets',
       rollupOptions: {
         output: {
           entryFileNames: 'assets/[name]-[hash].js',
           chunkFileNames: 'assets/[name]-[hash].js',
           assetFileNames: 'assets/[name]-[hash].[ext]'
         }
       }
     }
   })
   ```

3. **Verify all files were uploaded**:
   
   Check that all files in the `dist` directory were uploaded to S3:

   ```bash
   aws s3 ls s3://your-bucket-name --recursive
   ```

### Routing Issues (404 on Page Refresh)

**Problem**: The application works initially, but refreshing the page or directly accessing a route results in a 404 error.

**Solution**:

1. **Ensure you're using HashRouter**:
   
   Make sure your application is using `HashRouter` from React Router, not `BrowserRouter`:

   ```jsx
   import { HashRouter as Router } from 'react-router-dom';
   ```

2. **Configure S3 to redirect all requests to index.html**:
   
   If you're using `BrowserRouter`, you need to configure S3 to redirect all requests to `index.html`:

   ```bash
   aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
   ```

   This will ensure that all routes are handled by your React application.

### CORS Issues

**Problem**: API requests to your Lambda function fail with CORS errors.

**Solution**:

1. **Update Lambda CORS configuration**:
   
   Make sure your Lambda function's CORS configuration includes your S3 website URL:

   ```json
   {
     "AllowOrigins": ["http://your-bucket-name.s3-website-region.amazonaws.com"],
     "AllowMethods": ["POST", "OPTIONS"],
     "AllowHeaders": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
     "MaxAge": 86400
   }
   ```

2. **Check browser console for specific CORS errors**:
   
   The browser console will provide more details about the specific CORS issue.

## Using the Updated Deployment Scripts

The updated deployment scripts (`deploy-to-s3.sh` and `deploy-to-s3.ps1`) now automatically configure the S3 bucket for static website hosting and set the correct bucket policy. If you're still encountering issues after using these scripts, please refer to the troubleshooting steps above.

## Additional Resources

- [Amazon S3 Static Website Hosting Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [React Router HashRouter Documentation](https://reactrouter.com/en/main/router-components/hash-router)
- [AWS CLI S3 Commands Reference](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html) 