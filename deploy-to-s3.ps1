# Deploy to S3 script for Healthcare Document Analysis App (PowerShell version)

# Configuration
$BUCKET_NAME = "idant-s3-static-website-test"
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

Write-ColorOutput Yellow "Configuring S3 bucket for static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Failed to configure bucket for static website hosting. Check your AWS credentials and bucket permissions."
    exit 1
}

Write-ColorOutput Yellow "Setting bucket policy for public access..."

# Create policy JSON directly without using a file
$policyJson = "{""Version"":""2012-10-17"",""Statement"":[{""Sid"":""PublicReadGetObject"",""Effect"":""Allow"",""Principal"":""*"",""Action"":""s3:GetObject"",""Resource"":""arn:aws:s3:::$BUCKET_NAME/*""}]}"

# Apply the policy directly
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy $policyJson

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Failed to set bucket policy. Check your AWS credentials and bucket permissions."
    exit 1
}

Write-ColorOutput Yellow "Deploying to S3 bucket: $BUCKET_NAME..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Deployment failed. Check your AWS credentials and bucket permissions."
    exit 1
}

Write-ColorOutput Green "Deployment successful!"
Write-ColorOutput Green "Your application is now available at: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
Write-ColorOutput Yellow "Note: It may take a few minutes for the website configuration to propagate." 