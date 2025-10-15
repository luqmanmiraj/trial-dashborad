import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json().catch(() => ({}));
    
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = getDatabase();
    
    return new Promise((resolve) => {
      // Check if user already exists
      db.get(
        "SELECT id FROM users WHERE username = ?",
        [username],
        (err, row: { id: number } | undefined) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ message: "Registration error" }, { status: 500 }));
            return;
          }

          if (row) {
            resolve(NextResponse.json({ message: "Username already exists" }, { status: 409 }));
            return;
          }

          // Hash password and create user
          const hashedPassword = bcrypt.hashSync(password, 10);
          
          db.run(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            [username, hashedPassword],
            function(err) {
              if (err) {
                console.error('Error creating user:', err);
                resolve(NextResponse.json({ message: "Registration error" }, { status: 500 }));
                return;
              }

              resolve(NextResponse.json({ 
                message: "User created successfully",
                userId: this.lastID 
              }));
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: "Registration error" }, { status: 500 });
  }
}
