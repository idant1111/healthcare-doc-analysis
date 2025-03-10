#!/bin/bash

# Deploy to S3 using CloudFormation script for Healthcare Document Analysis App

# Configuration
STACK_NAME="healthcare-doc-analysis-stack"
BUCKET_NAME="healthcare-doc-analysis-website"  # Change to your desired bucket name
REGION="eu-west-1"  # Change to your region

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

echo -e "${YELLOW}Creating/Updating CloudFormation stack...${NC}"
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides BucketName=$BUCKET_NAME Region=$REGION \
  --capabilities CAPABILITY_IAM

if [ $? -ne 0 ]; then
  echo -e "${RED}CloudFormation deployment failed. Check the AWS CloudFormation console for details.${NC}"
  exit 1
fi

echo -e "${YELLOW}Getting stack outputs...${NC}"
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)
S3_BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)

echo -e "${YELLOW}Deploying files to S3 bucket: ${S3_BUCKET_NAME}...${NC}"
aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to upload files to S3. Check your AWS credentials and bucket permissions.${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Your application is now available at: ${WEBSITE_URL}${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the website configuration to propagate.${NC}" 