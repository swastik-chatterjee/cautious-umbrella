/**
 * Storage Service for Weight Tracker
 * Uses localStorage for persistent local storage
 */

export interface WeightRecord {
  id: string;
  CREATED_AT: string;
  WEIGHT: number;
}

export class StorageService {
  private readonly STORAGE_KEY = 'weight_records';

  /**
   * Retrieves all weight records ordered by creation date (newest first)
   */
  getAllRecords(): WeightRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const records: WeightRecord[] = JSON.parse(stored);
      return records.sort((a, b) => 
        new Date(b.CREATED_AT).getTime() - new Date(a.CREATED_AT).getTime()
      );
    } catch (error) {
      console.error('Failed to retrieve records:', error);
      return [];
    }
  }

  /**
   * Adds a new weight record to storage
   */
  addRecord(weight: number, createdAt?: string): WeightRecord {
    try {
      const records = this.getAllRecords();
      const newRecord: WeightRecord = {
        id: Date.now().toString(),
        CREATED_AT: createdAt || new Date().toISOString(),
        WEIGHT: weight
      };
      
      records.unshift(newRecord);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
      return newRecord;
    } catch (error) {
      console.error('Failed to add record:', error);
      throw new Error('Failed to save weight record');
    }
  }

  /**
   * Updates an existing weight record
   */
  updateRecord(id: string, weight: number): void {
    try {
      const records = this.getAllRecords();
      const index = records.findIndex(r => r.id === id);
      
      if (index === -1) {
        throw new Error('Record not found');
      }
      
      records[index].WEIGHT = weight;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to update record:', error);
      throw new Error('Failed to update weight record');
    }
  }

  /**
   * Deletes a weight record by ID
   */
  deleteRecord(id: string): void {
    try {
      const records = this.getAllRecords();
      const filtered = records.filter(r => r.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw new Error('Failed to delete weight record');
    }
  }

  /**
   * Gets statistics about recorded weights
   */
  getStatistics(): {
    totalRecords: number;
    averageWeight: number;
    highestWeight: number;
    lowestWeight: number;
  } {
    try {
      const records = this.getAllRecords();

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
        averageWeight: parseFloat((sum / records.length).toFixed(2)),
        highestWeight: Math.max(...weights),
        lowestWeight: Math.min(...weights)
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw new Error('Failed to calculate statistics');
    }
  }

  /**
   * Clears all records from storage (use with caution)
   */
  clearAllRecords(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear records:', error);
      throw new Error('Failed to clear database');
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
