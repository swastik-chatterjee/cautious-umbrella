import Sqlite from 'nativescript-sqlite';

/**
 * Represents a weight record in the database
 */
export interface WeightRecord {
  id?: number;
  CREATED_AT: string;
  WEIGHT: number;
}

/**
 * Service for managing weight records in SQLite database
 * Handles all database operations in a centralized location
 */
export class StorageService {
  private db: any = null;
  private readonly DB_NAME = 'weight_tracker.db';
  private readonly TABLE_NAME = 'weight_records';

  /**
   * Initializes the SQLite database and creates tables if needed
   */
  async initDb(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await new Sqlite(this.DB_NAME);
      await this.db.execSQL(
        `CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          CREATED_AT TEXT NOT NULL,
          WEIGHT REAL NOT NULL
        )`
      );
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error('Failed to initialize database');
    }
  }

  /**
   * Retrieves all weight records ordered by creation date (newest first)
   */
  async getAllRecords(): Promise<WeightRecord[]> {
    try {
      await this.initDb();
      const rows = await this.db.all(
        `SELECT id, CREATED_AT, WEIGHT FROM ${this.TABLE_NAME} ORDER BY CREATED_AT DESC`,
        []
      );

      return rows.map((row: any) => ({
        id: row[0],
        CREATED_AT: row[1],
        WEIGHT: row[2]
      }));
    } catch (error) {
      console.error('Failed to retrieve records:', error);
      throw new Error('Failed to load weight records');
    }
  }

  /**
   * Adds a new weight record to the database
   */
  async addRecord(weight: number, createdAt?: string): Promise<void> {
    try {
      await this.initDb();
      const timestamp = createdAt || new Date().toISOString();
      await this.db.execSQL(
        `INSERT INTO ${this.TABLE_NAME} (CREATED_AT, WEIGHT) VALUES (?, ?)`,
        [timestamp, weight]
      );
    } catch (error) {
      console.error('Failed to add record:', error);
      throw new Error('Failed to save weight record');
    }
  }

  /**
   * Updates an existing weight record
   */
  async updateRecord(id: number, weight: number): Promise<void> {
    try {
      await this.initDb();
      await this.db.execSQL(
        `UPDATE ${this.TABLE_NAME} SET WEIGHT = ? WHERE id = ?`,
        [weight, id]
      );
    } catch (error) {
      console.error('Failed to update record:', error);
      throw new Error('Failed to update weight record');
    }
  }

  /**
   * Deletes a weight record by ID
   */
  async deleteRecord(id: number): Promise<void> {
    try {
      await this.initDb();
      await this.db.execSQL(
        `DELETE FROM ${this.TABLE_NAME} WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw new Error('Failed to delete weight record');
    }
  }

  /**
   * Gets statistics about recorded weights
   */
  async getStatistics(): Promise<{
    totalRecords: number;
    averageWeight: number;
    highestWeight: number;
    lowestWeight: number;
  }> {
    try {
      await this.initDb();
      const records = await this.getAllRecords();

      if (records.length === 0) {
        return {
          totalRecords: 0,
          averageWeight: 0,
          highestWeight: 0,
          lowestWeight: 0
        };
      }

      const weights = records.map(r => r.WEIGHT);
      const sum = weights.reduce((a, b) => a + b, 0);

      return {
        totalRecords: records.length,
        averageWeight: sum / records.length,
        highestWeight: Math.max(...weights),
        lowestWeight: Math.min(...weights)
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw new Error('Failed to calculate statistics');
    }
  }

  /**
   * Clears all records from the database (use with caution)
   */
  async clearAllRecords(): Promise<void> {
    try {
      await this.initDb();
      await this.db.execSQL(`DELETE FROM ${this.TABLE_NAME}`);
    } catch (error) {
      console.error('Failed to clear records:', error);
      throw new Error('Failed to clear database');
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
