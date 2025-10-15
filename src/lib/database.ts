import bcrypt from 'bcryptjs';

// In-memory database for Netlify serverless environment
// In production, you should use a persistent database like PostgreSQL
interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

let users: User[] = [];
let isInitialized = false;

export function getDatabase(): any {
  if (!isInitialized) {
    initializeDatabase();
    isInitialized = true;
  }
  return {
    get: (sql: string, params: any[], callback: (err: any, row?: any) => void) => {
      if (sql.includes('SELECT COUNT(*)')) {
        const username = params[0];
        const count = users.filter(u => u.username === username).length;
        callback(null, { count });
      } else if (sql.includes('SELECT * FROM users WHERE username')) {
        const username = params[0];
        const user = users.find(u => u.username === username);
        callback(null, user);
      } else {
        callback(null, null);
      }
    },
    run: (sql: string, params: any[], callback?: (err: any) => void) => {
      if (sql.includes('CREATE TABLE')) {
        console.log('Users table created (in-memory)');
        callback?.(null);
      } else if (sql.includes('INSERT INTO users')) {
        const [username, password_hash] = params;
        const newUser: User = {
          id: users.length + 1,
          username,
          password_hash,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        console.log('User created:', username);
        callback?.(null);
      } else {
        callback?.(null);
      }
    }
  };
}

function initializeDatabase(): void {
  console.log('Initializing in-memory database');
  
  // Check if admin user exists, if not create it
  const adminExists = users.some(u => u.username === 'admin');
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    const adminUser: User = {
      id: 1,
      username: 'admin',
      password_hash: hashedPassword,
      created_at: new Date().toISOString()
    };
    users.push(adminUser);
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
}

export function closeDatabase(): void {
  // No-op for in-memory database
  console.log('Database connection closed (in-memory)');
}

// Small promise helpers to use async/await cleanly in route handlers
export function dbGet<T>(database: any, sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err: any, row?: any) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function dbRun(database: any, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
