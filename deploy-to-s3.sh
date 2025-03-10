#!/bin/bash

# Deploy to S3 script for Healthcare Document Analysis App

# Configuration
BUCKET_NAME="your-bucket-name"
REGION="us-east-1"  # Change to your region

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building application for S3 deployment...${NC}"
pnpm build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Aborting deployment.${NC}"
  exit 1
fi

echo -e "${YELLOW}Configuring S3 bucket for static website hosting...${NC}"
aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to configure bucket for static website hosting. Check your AWS credentials and bucket permissions.${NC}"
  exit 1
fi

echo -e "${YELLOW}Setting bucket policy for public access...${NC}"
POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF
)

aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy "$POLICY"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to set bucket policy. Check your AWS credentials and bucket permissions.${NC}"
  exit 1
fi

echo -e "${YELLOW}Deploying to S3 bucket: ${BUCKET_NAME}...${NC}"
aws s3 sync dist/ s3://${BUCKET_NAME} --delete

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed. Check your AWS credentials and bucket permissions.${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Your application is now available at: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the website configuration to propagate.${NC}" 