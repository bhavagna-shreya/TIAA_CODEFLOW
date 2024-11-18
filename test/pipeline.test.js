import { expect, test, vi } from 'vitest';
import { handler } from '../src/lambda.js';

// Mock AWS SDK clients
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn()
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn()
}));

vi.mock('@aws-sdk/client-rds-data', () => ({
  RDSClient: vi.fn(() => ({
    send: vi.fn()
  })),
  ExecuteStatement: vi.fn()
}));

test('handler processes data successfully', async () => {
  const event = {
    Records: [
      {
        s3: {
          bucket: { name: 'test-bucket' },
          object: { key: 'test-file.csv' }
        }
      }
    ]
  };

  const result = await handler(event);
  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toHaveProperty('message');
});