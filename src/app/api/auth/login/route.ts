import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json().catch(() => ({}));
    
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 });
    }

    const db = getDatabase();
    
    return new Promise((resolve) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row: { id: number; username: string; password_hash: string; created_at: string } | undefined) => {
          if (err) {
            console.error('Database error:', err);
            resolve(NextResponse.json({ message: "Authentication error" }, { status: 500 }));
            return;
          }

          if (!row) {
            resolve(NextResponse.json({ message: "Invalid credentials" }, { status: 401 }));
            return;
          }

          // Verify password
          bcrypt.compare(password, row.password_hash, (err, isMatch) => {
            if (err) {
              console.error('Password comparison error:', err);
              resolve(NextResponse.json({ message: "Authentication error" }, { status: 500 }));
              return;
            }

            if (isMatch) {
              const res = NextResponse.json({ ok: true });
              res.cookies.set("auth", "1", { httpOnly: true, sameSite: "lax", path: "/" });
              resolve(res);
            } else {
              resolve(NextResponse.json({ message: "Invalid credentials" }, { status: 401 }));
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "Authentication error" }, { status: 500 });
  }
}


