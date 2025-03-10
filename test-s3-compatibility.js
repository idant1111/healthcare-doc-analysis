/**
 * S3 Compatibility Test Script
 * 
 * This script checks the build output for common issues that might affect
 * compatibility with S3 static website hosting.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Check if the dist directory exists
if (!fs.existsSync('./dist')) {
  console.error(chalk.red('Error: dist directory not found. Run pnpm build first.'));
  process.exit(1);
}

console.log(chalk.blue('Starting S3 compatibility test...'));

// Check for index.html
if (!fs.existsSync('./dist/index.html')) {
  console.error(chalk.red('Error: index.html not found in dist directory.'));
  process.exit(1);
}

// Read index.html
const indexHtml = fs.readFileSync('./dist/index.html', 'utf8');

// Check for absolute paths in index.html
const absolutePathRegex = /src=["']\/[^"']*["']|href=["']\/[^"']*["']/g;
const absolutePaths = indexHtml.match(absolutePathRegex);

if (absolutePaths && absolutePaths.length > 0) {
  console.warn(chalk.yellow('Warning: Found absolute paths in index.html:'));
  absolutePaths.forEach(path => {
    console.warn(chalk.yellow(`  - ${path}`));
  });
  console.warn(chalk.yellow('These paths may cause issues with S3 static website hosting.'));
} else {
  console.log(chalk.green('✓ No absolute paths found in index.html'));
}

// Check for HashRouter
const routerCheck = indexHtml.includes('HashRouter') || 
                   fs.existsSync('./dist/assets') && 
                   fs.readdirSync('./dist/assets')
                     .some(file => file.endsWith('.js') && 
                           fs.readFileSync(`./dist/assets/${file}`, 'utf8').includes('HashRouter'));

if (!routerCheck) {
  console.warn(chalk.yellow('Warning: Could not confirm HashRouter usage. Make sure you are using HashRouter for S3 compatibility.'));
} else {
  console.log(chalk.green('✓ HashRouter detected'));
}

// Check for environment variables
console.log(chalk.blue('Checking for environment variables...'));
const envVars = [
  'VITE_LAMBDA_FUNCTION_URL'
];

envVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(chalk.yellow(`Warning: Environment variable ${envVar} is not set.`));
  } else {
    console.log(chalk.green(`✓ Environment variable ${envVar} is set`));
  }
});

console.log(chalk.blue('S3 compatibility test completed.'));
console.log(chalk.green('Your application should be compatible with S3 static website hosting.'));
console.log(chalk.blue('For deployment instructions, see s3-deployment-guide.md')); 