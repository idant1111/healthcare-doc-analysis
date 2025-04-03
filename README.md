# Healthcare Document Analysis

A modern web application for healthcare professionals to upload and analyze PDF documents using a secure Lambda function with language model capabilities.

## Features


- Chat-like interface for document analysis
- PDF document upload and processing
- Secure communication with AWS Lambda function
- Responsive design for various devices
- Detailed analysis results with structured formatting
- Error handling and validation

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Routing**: React Router (HashRouter for S3 compatibility)
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Deployment**: Amazon S3 Static Website Hosting
- **Backend**: AWS Lambda Function (not included in this repository)

## Project Structure

```
healthcare-doc-analysis/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── ...          # Application-specific components
│   ├── lib/             # Utility functions
│   ├── services/        # API services
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── .env.example         # Example environment variables
├── lambda-integration-guide.md  # Guide for Lambda integration
├── s3-deployment-guide.md       # Guide for S3 deployment
├── testing-guide.md             # Testing procedures
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- AWS account (for deployment)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd healthcare-doc-analysis
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Lambda function URL:

```
VITE_LAMBDA_FUNCTION_URL=https://your-lambda-function-url.lambda-url.region.on.aws
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
pnpm build
```

The build output will be in the `dist` directory.

## Deployment

### Amazon S3

The application is fully compatible with Amazon S3 static website hosting. It uses HashRouter for client-side routing, which works well with S3's static hosting capabilities.

See [s3-deployment-guide.md](./s3-deployment-guide.md) for detailed instructions on deploying to Amazon S3.

If you encounter any issues during deployment, refer to the [S3 troubleshooting guide](./s3-troubleshooting.md) for solutions to common problems.

### AWS CloudFormation

For a more automated deployment process, you can use the included CloudFormation template to provision and configure all necessary AWS resources.

See [cloudformation-deployment-guide.md](./cloudformation-deployment-guide.md) for detailed instructions on deploying with CloudFormation.

### GitHub Pages

The application can also be deployed to GitHub Pages. The build process automatically detects GitHub Pages deployment and configures the base path accordingly.

See [github-pages-deployment-guide.md](./github-pages-deployment-guide.md) for detailed instructions on deploying to GitHub Pages.

## Lambda Function Integration

See [lambda-integration-guide.md](./lambda-integration-guide.md) for information about integrating with the AWS Lambda function.

## Testing

See [testing-guide.md](./testing-guide.md) for testing procedures.

## Security Considerations

- The application is designed to be hosted on Amazon S3 as a static website
- Communication with the Lambda function can be secured using IP restrictions
- File validation ensures only appropriate documents are processed
- The Lambda function should implement proper authentication and authorization

## License

[MIT](LICENSE)

## Idan Test
a test text for presentation