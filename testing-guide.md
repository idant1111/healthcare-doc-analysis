# Testing Guide for Healthcare Document Analysis App

This guide provides instructions for testing the Healthcare Document Analysis application both locally and after deployment.

## Local Testing

### Prerequisites

- Node.js and pnpm installed
- A local development environment

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your Lambda function URL:

```
VITE_LAMBDA_FUNCTION_URL=https://your-lambda-function-url.lambda-url.region.on.aws
```

### Running the Application Locally

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Testing the Build Output

1. Create a production build:

```bash
pnpm build
```

2. Serve the build output locally:

```bash
pnpm dlx serve dist
```

The application will be available at `http://localhost:3000`.

## Test Cases

### 1. Initial Load

- **Expected**: The application should load with a welcome message
- **Steps**:
  1. Open the application
  2. Verify the header, welcome message, and footer are displayed

### 2. Text Input

- **Expected**: The application should send the message to the Lambda function and display the response
- **Steps**:
  1. Type a message in the input field
  2. Press Enter or click the Send button
  3. Verify the message appears in the chat
  4. Verify a loading indicator appears
  5. Verify the response from the Lambda function is displayed

### 3. File Upload

- **Expected**: The application should upload the file to the Lambda function and display the analysis
- **Steps**:
  1. Click the Upload button
  2. Select a PDF file
  3. Verify the file name appears in the UI
  4. Verify a loading indicator appears
  5. Verify the analysis from the Lambda function is displayed

### 4. File Validation

- **Expected**: The application should validate file types and sizes
- **Steps**:
  1. Try uploading a non-PDF file
  2. Verify an error message appears
  3. Try uploading a file larger than 10MB
  4. Verify an error message appears

### 5. Error Handling

- **Expected**: The application should handle errors gracefully
- **Steps**:
  1. Disconnect from the internet
  2. Try sending a message
  3. Verify an error message appears
  4. Reconnect to the internet
  5. Try sending a message again
  6. Verify the message is sent and a response is received

### 6. Responsive Design

- **Expected**: The application should be responsive on different screen sizes
- **Steps**:
  1. Open the application on a desktop browser
  2. Resize the browser window to simulate tablet and mobile devices
  3. Verify the layout adjusts appropriately
  4. Verify all functionality works on smaller screens

## Post-Deployment Testing

After deploying to S3, perform the following tests:

### 1. S3 Website Access

- **Expected**: The application should be accessible via the S3 website URL
- **Steps**:
  1. Open the S3 website URL in a browser
  2. Verify the application loads correctly

### 2. Lambda Function Integration

- **Expected**: The application should communicate with the Lambda function
- **Steps**:
  1. Send a message through the application
  2. Verify the Lambda function receives the request
  3. Verify the response is displayed in the application

### 3. CORS Configuration

- **Expected**: The application should not encounter CORS errors
- **Steps**:
  1. Open the browser developer tools
  2. Monitor the network tab while sending messages and uploading files
  3. Verify no CORS errors appear in the console

### 4. IP Restrictions (if implemented)

- **Expected**: The application should only work from allowed IP addresses
- **Steps**:
  1. Access the application from an allowed IP address
  2. Verify functionality works
  3. If possible, access from a non-allowed IP address
  4. Verify appropriate error messages are displayed

## Troubleshooting

- If the application doesn't load, check the browser console for errors
- If file uploads fail, check the file size and type
- If the Lambda function doesn't respond, check the network tab for request/response details
- If CORS errors appear, verify the Lambda function's CORS configuration 