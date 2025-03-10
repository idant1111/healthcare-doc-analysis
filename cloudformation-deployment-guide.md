# CloudFormation Deployment Guide for Healthcare Document Analysis App

This guide provides instructions for deploying the Healthcare Document Analysis application to Amazon S3 using AWS CloudFormation.

## What is CloudFormation?

AWS CloudFormation is a service that helps you model and set up your AWS resources so you can spend less time managing those resources and more time focusing on your applications. You create a template that describes all the AWS resources that you want (like S3 buckets), and CloudFormation takes care of provisioning and configuring those resources for you.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and pnpm installed

## CloudFormation Template

The included `cloudformation-template.yaml` file defines the following resources:

1. **S3 Bucket**: Configured for static website hosting with proper CORS settings
2. **Bucket Policy**: Allows public read access to the bucket contents

## Deployment Options

### Option 1: Using the Deployment Scripts

We've included deployment scripts to simplify the process:

#### For Windows users (PowerShell):

1. Edit the `deploy-with-cloudformation.ps1` script to set your stack name, bucket name, and region:

```powershell
# Open the file in a text editor and update these values
$STACK_NAME = "healthcare-doc-analysis-stack"
$BUCKET_NAME = "s3-28f14e36-0efd-446b-8b57-ac287350d5aa"  # Must be globally unique
$REGION = "eu-west-1"  # Change to your region
```

2. Run the script in PowerShell:

```powershell
.\deploy-with-cloudformation.ps1
```

#### For Linux/Mac users:

1. Edit the `deploy-with-cloudformation.sh` script to set your stack name, bucket name, and region:

```bash
# Open the file
nano deploy-with-cloudformation.sh

# Update these values
STACK_NAME="healthcare-doc-analysis-stack"
BUCKET_NAME="your-unique-bucket-name"  # Must be globally unique
REGION="eu-west-1"  # Change to your region
```

2. Make the script executable and run it:

```bash
chmod +x deploy-with-cloudformation.sh
./deploy-with-cloudformation.sh
```

### Option 2: Manual Deployment

1. Build the application:

```bash
pnpm build
```

2. Deploy the CloudFormation stack:

```bash
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name healthcare-doc-analysis-stack \
  --parameter-overrides BucketName=your-unique-bucket-name Region=eu-west-1 \
  --capabilities CAPABILITY_IAM
```

3. Get the S3 bucket name from the stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name healthcare-doc-analysis-stack \
  --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
  --output text
```

4. Upload the files to the S3 bucket:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

## Accessing Your Website

After deployment, your website will be available at:

```
http://your-bucket-name.s3-website-region.amazonaws.com
```

The exact URL will be displayed in the output of the deployment script.

## Updating Your Website

To update your website, simply run the deployment script again. The CloudFormation stack will be updated if necessary, and the new files will be uploaded to the S3 bucket.

## Cleaning Up

To delete all resources created by the CloudFormation stack:

```bash
aws cloudformation delete-stack --stack-name healthcare-doc-analysis-stack
```

Note: This will delete the S3 bucket and all its contents. Make sure you have a backup if needed.

## Troubleshooting

- If the CloudFormation deployment fails, check the AWS CloudFormation console for error details
- If file uploads fail, check your AWS credentials and bucket permissions
- If the website doesn't load, verify that the bucket policy allows public read access
- For CORS issues with the Lambda function, update the Lambda function's CORS configuration to include your S3 website URL 