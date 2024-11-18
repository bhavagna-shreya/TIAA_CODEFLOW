import { logger } from '../utils/logger.js';

export class QualityChecker {
  constructor() {
    this.rules = [
      this._checkNullThreshold,
      this._checkUniqueConstraints,
      this._checkDataTypes
    ];
  }

  async check(profile) {
    logger.info('Starting quality checks');
    
    const results = [];
    let passed = true;

    for (const rule of this.rules) {
      const result = await rule(profile);
      results.push(result);
      
      if (!result.passed) {
        passed = false;
      }
    }

    logger.info('Quality checks completed');
    
    return {
      passed,
      results,
      timestamp: new Date()
    };
  }

  async _checkNullThreshold(profile) {
    const MAX_NULL_PERCENTAGE = 20;
    const failures = [];

    for (const [column, stats] of Object.entries(profile.columns)) {
      if (stats.nullPercentage > MAX_NULL_PERCENTAGE) {
        failures.push({
          column,
          message: `Null percentage (${stats.nullPercentage}%) exceeds threshold`
        });
      }
    }

    return {
      name: 'Null Threshold Check',
      passed: failures.length === 0,
      failures
    };
  }

  async _checkUniqueConstraints(profile) {
    const UNIQUE_COLUMNS = ['id', 'email'];
    const failures = [];

    for (const column of UNIQUE_COLUMNS) {
      if (profile.columns[column]) {
        const uniqueRatio = profile.columns[column].uniqueCount / profile.rowCount;
        if (uniqueRatio < 1) {
          failures.push({
            column,
            message: 'Column should contain unique values'
          });
        }
      }
    }

    return {
      name: 'Unique Constraints Check',
      passed: failures.length === 0,
      failures
    };
  }

  async _checkDataTypes(profile) {
    const failures = [];

    for (const [column, stats] of Object.entries(profile.columns)) {
      if (column.includes('date') && stats.type !== 'date') {
        failures.push({
          column,
          message: `Column should be of type date, found ${stats.type}`
        });
      }
    }

    return {
      name: 'Data Type Check',
      passed: failures.length === 0,
      failures
    };
  }
}