import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

export class MetadataStore {
  async initialize(dbPath) {
    this.db = new Database(dbPath);
    await this._createTables();
    logger.info('Metadata store initialized');
  }

  async _createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS data_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        profile_data JSON NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transformations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        profile_id INTEGER,
        quality_report JSON NOT NULL,
        output_path TEXT NOT NULL,
        FOREIGN KEY(profile_id) REFERENCES data_profiles(id)
      );
    `);
  }

  async saveProfile(profile) {
    const stmt = this.db.prepare(
      'INSERT INTO data_profiles (profile_data) VALUES (?)'
    );
    
    const result = stmt.run(JSON.stringify(profile));
    logger.info('Saved data profile');
    
    return result.lastInsertRowid;
  }

  async saveTransformationMetadata(metadata) {
    const stmt = this.db.prepare(`
      INSERT INTO transformations 
        (profile_id, quality_report, output_path)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      metadata.profile.id,
      JSON.stringify(metadata.qualityReport),
      metadata.outputPath
    );

    logger.info('Saved transformation metadata');
    
    return result.lastInsertRowid;
  }
}