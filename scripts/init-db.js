const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'auth.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

db.serialize(() => {
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
      process.exit(1);
    }
    console.log('Users table created/verified');
  });

  // Check if admin user exists, if not create it
  db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err);
      process.exit(1);
      return;
    }
    
    if (row.count === 0) {
      const hashedPassword = bcrypt.hashSync('password', 10);
      db.run(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        ['admin', hashedPassword],
        function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
            process.exit(1);
          } else {
            console.log('Admin user created successfully');
            console.log('Username: admin');
            console.log('Password: password');
            db.close();
            process.exit(0);
          }
        }
      );
    } else {
      console.log('Admin user already exists');
      console.log('Username: admin');
      console.log('Password: password');
      db.close();
      process.exit(0);
    }
  });
});
