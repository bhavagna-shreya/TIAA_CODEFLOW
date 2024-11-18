import { DataProfiler } from './profiler.js';
import { QualityChecker } from './quality.js';
import { Transformer } from './transformer.js';
import { MetadataStore } from '../storage/metadata.js';
import { logger } from '../utils/logger.js';

class Pipeline {
  constructor() {
    this.profiler = new DataProfiler();
    this.qualityChecker = new QualityChecker();
    this.transformer = new Transformer();
    this.metadataStore = new MetadataStore();
  }

  async initialize(config) {
    this.config = config;
    await this.metadataStore.initialize(config.metadataDb);
    logger.info('Pipeline initialized');
  }

  async run() {
    // 1. Profile Data
    const profile = await this.profiler.profile(this.config.inputPath);
    await this.metadataStore.saveProfile(profile);

    // 2. Quality Check
    const qualityReport = await this.qualityChecker.check(profile);
    if (!qualityReport.passed) {
      throw new Error('Data quality checks failed');
    }

    // 3. Transform Data
    const transformedData = await this.transformer.transform(
      this.config.inputPath,
      profile
    );

    // 4. Store Results
    await this.metadataStore.saveTransformationMetadata({
      timestamp: new Date(),
      profile,
      qualityReport,
      outputPath: this.config.outputPath
    });

    return transformedData;
  }
}

export const pipeline = new Pipeline();