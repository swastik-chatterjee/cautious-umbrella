import Sqlite from "nativescript-sqlite";

export interface WeightRecord {
  id?: number;
  CREATED_AT: string; // ISO string text format
  WEIGHT: number; // Weight stored in KG
}

export class StorageService {
  private db: any = null;

  // Initializes the SQLite database file and creates the table if it doesn't exist
  async initDb(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await new Sqlite("weight_tracker.db");
      await this.db.execSQL(
        `CREATE TABLE IF NOT EXISTS weight_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          CREATED_AT TEXT NOT NULL,
          WEIGHT REAL NOT NULL
        )`,
      );
    } catch (error) {
      console.error("Failed to open database initialization:", error);
    }
  }

  // Fetch all stored logs ordered chronologically (newest first)
  async getAllRecords(): Promise<WeightRecord[]> {
    await this.initDb();
    const rows = await this.db.all(
      "SELECT id, CREATED_AT, WEIGHT FROM weight_records ORDER BY CREATED_AT DESC",
      [],
    );

    // Standardizing raw array response into easily mapped objects
    return rows.map((row: any) => ({
      id: row[0],
      CREATED_AT: row[1],
      WEIGHT: row[2],
    }));
  }

  // Insert a new weight record
  async addRecord(weight: number, createdAt: string): Promise<void> {
    await this.initDb();
    await this.db.execSQL(
      "INSERT INTO weight_records (CREATED_AT, WEIGHT) VALUES (?, ?)",
      [createdAt, weight],
    );
  }

  // Modify the weight value of a targeted row index
  async updateRecord(id: number, weight: number): Promise<void> {
    await this.initDb();
    await this.db.execSQL("UPDATE weight_records SET WEIGHT = ? WHERE id = ?", [
      weight,
      id,
    ]);
  }

  // Permanently delete a targeted row index
  async deleteRecord(id: number): Promise<void> {
    await this.initDb();
    await this.db.execSQL("DELETE FROM weight_records WHERE id = ?", [id]);
  }
}

export const storageService = new StorageService();
