# Healthcare Document Analysis Lambda Function

This is a simple AWS Lambda function that processes requests from the Healthcare Document Analysis frontend application. It receives messages and PDF files, and returns a simplified response.

## Functionality

The Lambda function:

1. Accepts both JSON and multipart/form-data requests
2. Handles text-only messages and file uploads
3. Returns a response with "OK" and information about the received message/file

## Deployment Instructions

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- Python 3.8 or later

### Deployment Steps

1. **Create a deployment package**

   ```bash
   cd healthcare-doc-analysis/lambda
   pip install -r requirements.txt -t ./package
   cp lambda_function.py ./package/
   cd package
   zip -r ../lambda_deployment.zip .
   cd ..
   ```

2. **Create the Lambda function**

   ```bash
   aws lambda create-function \
     --function-name healthcare-doc-analysis \
     --runtime python3.8 \
     --handler lambda_function.lambda_handler \
     --zip-file fileb://lambda_deployment.zip \
     --role arn:aws:iam::<YOUR_ACCOUNT_ID>:role/lambda-basic-execution
   ```

   Replace `<YOUR_ACCOUNT_ID>` with your AWS account ID.

3. **Create a Lambda Function URL**

   ```bash
   aws lambda create-function-url-config \
     --function-name healthcare-doc-analysis \
     --auth-type NONE
   ```

   Note: For production, use `AWS_IAM` auth type and configure proper permissions.

4. **Configure CORS for the Function URL**

   ```bash
   aws lambda update-function-url-config \
     --function-name healthcare-doc-analysis \
     --cors '{"AllowOrigins": ["*"], "AllowMethods": ["POST"], "AllowHeaders": ["*"], "ExposeHeaders": ["*"]}'
   ```

   Note: For production, restrict `AllowOrigins` to your application domain.

## Integration with Frontend

Update the `LAMBDA_FUNCTION_URL` in the frontend application's `src/services/api.ts` file with the Function URL provided by AWS after deployment.

```typescript
const LAMBDA_FUNCTION_URL = "https://your-lambda-function-url.lambda-url.region.on.aws";
```

## Testing the Lambda Function

### Test with a JSON request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the diagnosis in the latest report?"}' \
  https://your-lambda-function-url.lambda-url.region.on.aws
```

### Test with a file upload

```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.pdf" \
  -F "message=Please analyze this document" \
  https://your-lambda-function-url.lambda-url.region.on.aws
```

## Requirements File

Create a `requirements.txt` file with the following content:

```
# No external dependencies required for this simplified version
```

## Security Considerations

For a production deployment:

1. Use AWS IAM authentication for the Function URL
2. Restrict CORS to specific origins
3. Consider adding API Gateway with API key authentication
4. Implement proper input validation
5. Set up CloudWatch Logs and Alarms for monitoring
6. Configure appropriate IAM permissions for the Lambda function 