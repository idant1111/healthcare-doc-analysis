# S3 Deployment Guide for Healthcare Document Analysis App

This guide provides instructions for deploying the Healthcare Document Analysis application to Amazon S3 as a static website.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and pnpm installed

## Build the Application

1. Create a production build of the application:

```bash
pnpm build
```

This will create a `dist` directory with the optimized production build.

## Configure S3 Bucket

1. Create an S3 bucket for hosting the static website:

```bash
aws s3 mb s3://your-bucket-name
```

2. Configure the bucket for static website hosting:

```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

3. Apply a bucket policy to make the contents publicly accessible:

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

## Configure CORS for Lambda Function

If your Lambda function is in a different domain, you need to configure CORS. Add the following CORS configuration to your Lambda function:

```json
{
  "AllowOrigins": ["http://your-bucket-name.s3-website-region.amazonaws.com"],
  "AllowMethods": ["POST", "OPTIONS"],
  "AllowHeaders": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
  "MaxAge": 86400
}
```

## Deploy to S3

### Option 1: Using the Deployment Scripts

We've included deployment scripts to simplify the process:

#### For Linux/Mac users:

1. Edit the `deploy-to-s3.sh` script to set your bucket name and region:

```bash
# Open the file
nano deploy-to-s3.sh

# Update these values
BUCKET_NAME="your-bucket-name"
REGION="us-east-1"  # Change to your region
```

2. Make the script executable and run it:

```bash
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh
```

#### For Windows users:

1. Edit the `deploy-to-s3.ps1` script to set your bucket name and region:

```powershell
# Open the file in a text editor and update these values
$BUCKET_NAME = "your-bucket-name"
$REGION = "us-east-1"  # Change to your region
```

2. Run the script in PowerShell:

```powershell
.\deploy-to-s3.ps1
```

### Option 2: Manual Deployment

1. Upload the contents of the `dist` directory to your S3 bucket:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

## Access the Website

Your static website is now available at:

```
http://your-bucket-name.s3-website-region.amazonaws.com
```

## IP Restriction (Optional)

To restrict access to specific IP addresses, you can use AWS CloudFront with AWS WAF (Web Application Firewall):

1. Create a CloudFront distribution pointing to your S3 bucket
2. Create a WAF rule to allow only specific IP addresses
3. Associate the WAF rule with your CloudFront distribution

## Lambda Function URL Configuration

For the Lambda function URL, you can configure IP-based restrictions using Resource Policies. Here's an example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "lambda:InvokeFunctionUrl",
      "Resource": "arn:aws:lambda:region:account-id:function:function-name",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": [
            "192.168.0.0/24",
            "10.0.0.0/16"
          ]
        }
      }
    }
  ]
}
```

## Troubleshooting

- If you encounter CORS issues, ensure your Lambda function has the correct CORS headers
- If the application doesn't load, check the S3 bucket policy and website configuration
- For routing issues, ensure your application is using HashRouter for client-side routing
- Check the browser console for any errors related to API calls or asset loading

For more detailed troubleshooting steps, see [s3-troubleshooting.md](./s3-troubleshooting.md). 