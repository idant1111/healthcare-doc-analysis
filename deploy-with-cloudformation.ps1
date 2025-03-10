# Deploy to S3 using CloudFormation script for Healthcare Document Analysis App

# Configuration
$STACK_NAME = "healthcare-doc-analysis-stack"
$BUCKET_NAME = "idant-s3-static-website-test"  # Change to your desired bucket name
$REGION = "eu-west-1"  # Change to your region

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow "Building application for S3 deployment..."
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Build failed. Aborting deployment."
    exit 1
}

Write-ColorOutput Yellow "Creating/Updating CloudFormation stack..."
aws cloudformation deploy `
    --template-file cloudformation-template.yaml `
    --stack-name $STACK_NAME `
    --parameter-overrides BucketName=$BUCKET_NAME Region=$REGION `
    --capabilities CAPABILITY_IAM

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "CloudFormation deployment failed. Check the AWS CloudFormation console for details."
    exit 1
}

Write-ColorOutput Yellow "Getting stack outputs..."
$outputs = aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

$websiteUrl = ($outputs | Where-Object { $_.OutputKey -eq "WebsiteURL" }).OutputValue
$s3BucketName = ($outputs | Where-Object { $_.OutputKey -eq "S3BucketName" }).OutputValue

Write-ColorOutput Yellow "Deploying files to S3 bucket: $s3BucketName..."
aws s3 sync dist/ s3://$s3BucketName --delete

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Failed to upload files to S3. Check your AWS credentials and bucket permissions."
    exit 1
}

Write-ColorOutput Green "Deployment successful!"
Write-ColorOutput Green "Your application is now available at: $websiteUrl"
Write-ColorOutput Yellow "Note: It may take a few minutes for the website configuration to propagate." 