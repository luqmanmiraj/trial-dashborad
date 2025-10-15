import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'auth.db');
let db: sqlite3.Database | null = null;
let isInitialized = false;

export function getDatabase(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  
  // Initialize database synchronously if not already done
  if (!isInitialized) {
    initializeDatabase();
    isInitialized = true;
  }
  
  return db;
}

function initializeDatabase(): void {
  if (!db) return;
  
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    
    // Check if admin user exists, if not create it
    db!.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row: { count: number } | undefined) => {
      if (err) {
        console.error('Error checking admin user:', err);
        return;
      }
      
      const count = row?.count ?? 0;
      if (count === 0) {
        const hashedPassword = bcrypt.hashSync('password', 10);
        db!.run(
          "INSERT INTO users (username, password_hash) VALUES (?, ?)",
          ['admin', hashedPassword],
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err);
            } else {
              console.log('Admin user created successfully');
            }
          }
        );
      } else {
        console.log('Admin user already exists');
      }
    });
  });
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Small promise helpers to use async/await cleanly in route handlers
export function dbGet<T>(database: sqlite3.Database, sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function dbRun(database: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
