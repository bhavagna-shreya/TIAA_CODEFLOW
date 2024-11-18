import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

export class DataProfiler {
  async profile(inputPath) {
    logger.info('Starting data profiling');
    
    const stats = {
      rowCount: 0,
      columns: new Map(),
      nullCounts: new Map(),
      uniqueValues: new Map(),
      patterns: new Map()
    };

    return new Promise((resolve, reject) => {
      createReadStream(inputPath)
        .pipe(parse({ columns: true }))
        .on('data', (record) => {
          stats.rowCount++;
          this._updateColumnStats(stats, record);
        })
        .on('end', () => {
          const profile = this._generateProfile(stats);
          logger.info('Data profiling completed');
          resolve(profile);
        })
        .on('error', reject);
    });
  }

  _updateColumnStats(stats, record) {
    for (const [column, value] of Object.entries(record)) {
      if (!stats.columns.has(column)) {
        stats.columns.set(column, {
          type: this._inferType(value),
          minLength: value.length,
          maxLength: value.length
        });
        stats.nullCounts.set(column, 0);
        stats.uniqueValues.set(column, new Set());
      }

      if (!value || value.trim() === '') {
        stats.nullCounts.set(
          column, 
          stats.nullCounts.get(column) + 1
        );
      }

      stats.uniqueValues.get(column).add(value);
    }
  }

  _inferType(value) {
    const schemas = {
      number: z.number(),
      date: z.date(),
      boolean: z.boolean(),
      string: z.string()
    };

    for (const [type, schema] of Object.entries(schemas)) {
      try {
        schema.parse(value);
        return type;
      } catch {
        continue;
      }
    }

    return 'string';
  }

  _generateProfile(stats) {
    const profile = {
      rowCount: stats.rowCount,
      columns: {}
    };

    for (const [column, metadata] of stats.columns) {
      profile.columns[column] = {
        type: metadata.type,
        nullCount: stats.nullCounts.get(column),
        uniqueCount: stats.uniqueValues.get(column).size,
        nullPercentage: (stats.nullCounts.get(column) / stats.rowCount) * 100
      };
    }

    return profile;
  }
}