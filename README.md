# Enterprise Data Transformation Pipeline

This application is designed to run on AWS Lambda for processing data through a transformation pipeline using Generative AI.

## Setup Instructions

1. Create AWS Resources:
   - S3 buckets for input and output data
   - RDS Aurora Serverless cluster for metadata
   - IAM role for Lambda with necessary permissions

2. Configure Environment:
   - Copy `.env.example` to `.env`
   - Fill in all required AWS configuration values

3. Deploy to Lambda:
   ```bash
   npm install
   npm run build
   ```
   Upload the generated `function.zip` to AWS Lambda

4. Configure Lambda:
   - Set runtime to Node.js 18.x
   - Set handler to "src/lambda.handler"
   - Configure environment variables
   - Set memory and timeout appropriately
   - Add S3 trigger for input bucket

## Architecture

- AWS Lambda processes data pipeline requests
- S3 triggers Lambda on new file uploads
- Input data is processed through:
  - Data profiling
  - Quality checks
  - AI-powered transformation
- Metadata stored in RDS Aurora
- Transformed data stored in S3

## Local Development

```bash
npm install
npm start
```

## Testing

```bash
npm test
```