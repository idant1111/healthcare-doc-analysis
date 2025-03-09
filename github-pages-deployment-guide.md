# GitHub Pages Deployment Guide for Healthcare Document Analysis App

This guide provides instructions for deploying the Healthcare Document Analysis application to GitHub Pages.

## Prerequisites

- GitHub account
- Repository with the Healthcare Document Analysis code

## Configuration

1. **Set up the base URL in Vite configuration**

The `vite.config.ts` file has been configured with a base path for GitHub Pages:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/healthcare-doc-analysis/',
})
```

If your repository has a different name, update the `base` path accordingly. For example, if your repository is named `medical-document-analyzer`, change it to:

```ts
base: '/medical-document-analyzer/',
```

2. **Configure GitHub Actions**

The repository includes a GitHub Actions workflow file (`.github/workflows/deploy.yml`) that automates the deployment process.

3. **Set up environment variables**

To securely store your Lambda Function URL, add it as a repository secret:

- Go to your GitHub repository
- Navigate to Settings > Secrets and variables > Actions
- Click "New repository secret"
- Name: `LAMBDA_FUNCTION_URL`
- Value: Your Lambda Function URL (e.g., `https://your-lambda-function-url.lambda-url.region.on.aws`)
- Click "Add secret"

## Deployment

### Automatic Deployment

The GitHub Actions workflow will automatically deploy your application to GitHub Pages whenever you push changes to the `main` branch.

### Manual Deployment

You can also trigger a deployment manually:

1. Go to your GitHub repository
2. Navigate to Actions
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow"
5. Select the branch you want to deploy from
6. Click "Run workflow"

## Enabling GitHub Pages

If this is your first time using GitHub Pages in this repository:

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. The page will be automatically deployed by the workflow

## Accessing Your Application

Once deployed, your application will be available at:

```
https://[your-username].github.io/healthcare-doc-analysis/
```

Replace `[your-username]` with your GitHub username and `healthcare-doc-analysis` with your repository name if different.

## CORS Configuration for Lambda Function

When using GitHub Pages, you need to update the CORS configuration of your Lambda function to allow requests from your GitHub Pages domain:

```json
{
  "AllowOrigins": [
    "https://[your-username].github.io"
  ],
  "AllowMethods": ["POST", "OPTIONS"],
  "AllowHeaders": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
  "MaxAge": 86400
}
```

Replace `[your-username]` with your GitHub username.

## Troubleshooting

- If the deployment fails, check the GitHub Actions logs for error messages
- If the application loads but can't connect to the Lambda function, verify your CORS configuration
- Make sure the `LAMBDA_FUNCTION_URL` secret is correctly set in your repository settings 