# Lambda Function Integration Guide

This guide provides information about integrating the Healthcare Document Analysis frontend with the AWS Lambda function.

## Lambda Function Requirements

The Lambda function should:

1. Accept HTTP POST requests
2. Handle both JSON and multipart/form-data requests
3. Process PDF documents
4. Return structured analysis results
5. Implement proper error handling

## API Interface

### Endpoint

The Lambda function is accessible via a Function URL:

```
https://your-lambda-function-url.lambda-url.region.on.aws
```

### Request Format

The frontend can send two types of requests:

#### 1. Text-only Query

```json
{
  "message": "What is the diagnosis in the latest report?"
}
```

#### 2. File Upload with Optional Message

For file uploads, the request is sent as `multipart/form-data` with the following fields:

- `file`: The PDF document (required)
- `message`: Additional context or question (optional)

### Response Format

The Lambda function should return responses in the following JSON format:

```json
{
  "message": "Analysis completed successfully",
  "analysis": {
    "summary": "This is a summary of the document...",
    "keyFindings": [
      "Finding 1",
      "Finding 2",
      "Finding 3"
    ],
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2"
    ],
    "followUp": "Contact Dr. Smith for further consultation."
  }
}
```

### Error Response

In case of errors, the Lambda function should return:

```json
{
  "message": "Error",
  "error": "Detailed error message"
}
```

## Security Considerations

### IP Restrictions

The Lambda function can be configured to only accept requests from specific IP ranges using a resource policy:

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

### Authentication Headers

For additional security, the Lambda function can require an API key:

```
x-api-key: your-api-key
```

The frontend application would need to include this header in all requests.

## CORS Configuration

The Lambda function should include the following CORS headers in its responses:

```
Access-Control-Allow-Origin: https://your-s3-bucket-website-url.amazonaws.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Api-Key
```

## Testing the Integration

You can test the Lambda function integration using curl:

### Text-only Query

```bash
curl -X POST \
  https://your-lambda-function-url.lambda-url.region.on.aws \
  -H 'Content-Type: application/json' \
  -d '{"message": "What is the diagnosis in the latest report?"}'
```

### File Upload

```bash
curl -X POST \
  https://your-lambda-function-url.lambda-url.region.on.aws \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/document.pdf' \
  -F 'message=Please analyze this document'
```

## Error Handling

The frontend application is designed to handle various error scenarios:

1. Network errors
2. Invalid file types
3. File size limits
4. Lambda function errors
5. Timeout errors

The Lambda function should provide clear error messages to help users understand and resolve issues. 