import { NextResponse } from "next/server";
import { getDatabase, dbGet } from "@/lib/database";
import bcrypt from "bcryptjs";

type UserRow = { id: number; username: string; password_hash: string; created_at: string };

export async function POST(request: Request): Promise<Response> {
  try {
    console.log('Login attempt started');
    const body = await request.json().catch(() => ({} as { username?: string; password?: string }));
    const { username, password } = body;

    console.log('Login attempt for username:', username);

    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ message: "Username and password required" }, { status: 400 });
    }

    const db = getDatabase();
    console.log('Database connection established');
    
    const row = await dbGet<UserRow>(db, "SELECT * FROM users WHERE username = ?", [username]);
    console.log('User query result:', row ? 'User found' : 'User not found');

    if (!row) {
      console.log('User not found in database');
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    console.log('Login successful for user:', username);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "Authentication error" }, { status: 500 });
  }
}


