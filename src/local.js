import dotenv from 'dotenv';
import { handler } from './lambda.js';

// Load environment variables for local testing
dotenv.config();

// Mock S3 event for local testing
const mockEvent = {
  Records: [
    {
      s3: {
        bucket: {
          name: process.env.INPUT_BUCKET
        },
        object: {
          key: 'test-data.csv'
        }
      }
    }
  ]
};

// Local execution wrapper
async function runLocal() {
  try {
    const result = await handler(mockEvent);
    console.log('Local execution result:', result);
  } catch (error) {
    console.error('Local execution failed:', error);
  }
}

runLocal();