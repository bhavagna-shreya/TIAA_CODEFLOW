import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { RDSDataClient, ExecuteStatement } from '@aws-sdk/client-rds-data';
import { profileData } from './pipeline/profiler.js';
import { checkQuality } from './pipeline/quality.js';
import { transformData } from './pipeline/transformer.js';
import { storeMetadata } from './storage/metadata.js';
import { logger } from './utils/logger.js';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const rdsClient = new RDSDataClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    logger.info('Processing new data pipeline request');

    // Get input data from S3 trigger
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = event.Records[0].s3.object.key;

    // Fetch data from S3
    const getCommand = new GetObjectCommand({
      Bucket: srcBucket,
      Key: srcKey
    });
    const response = await s3Client.send(getCommand);
    const rawData = await response.Body.transformToString();

    // Process the data through pipeline
    const profilerResults = await profileData(rawData);
    const qualityResults = await checkQuality(rawData);
    const transformedData = await transformData(rawData);

    // Store metadata in RDS
    const metadata = {
      sourceFile: srcKey,
      timestamp: new Date().toISOString(),
      profilerResults,
      qualityResults
    };
    await storeMetadata(metadata, rdsClient);

    // Store transformed data in S3
    const putCommand = new PutObjectCommand({
      Bucket: process.env.OUTPUT_BUCKET,
      Key: `transformed/${srcKey}`,
      Body: JSON.stringify(transformedData),
      ContentType: 'application/json'
    });
    await s3Client.send(putCommand);

    logger.info('Pipeline processing completed successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data processing completed successfully',
        outputFile: `transformed/${srcKey}`
      })
    };
  } catch (error) {
    logger.error('Pipeline processing failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Data processing failed',
        error: error.message
      })
    };
  }
}