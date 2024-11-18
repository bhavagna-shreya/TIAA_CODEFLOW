import { pipeline } from './pipeline/index.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    const config = {
      inputPath: './data/input',
      outputPath: './data/output',
      metadataDb: './data/metadata.db'
    };

    await pipeline.initialize(config);
    await pipeline.run();
    
    logger.info('Pipeline completed successfully');
  } catch (error) {
    logger.error('Pipeline failed:', error);
    process.exit(1);
  }
}

main();