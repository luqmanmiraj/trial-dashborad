import { NextResponse } from "next/server";
import { getDatabase, dbGet, dbRun } from "@/lib/database";
import bcrypt from "bcryptjs";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({} as { username?: string; password?: string }));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = getDatabase();
    const exists = await dbGet<{ id: number }>(db, "SELECT id FROM users WHERE username = ?", [username]);
    if (exists) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbRun(db, "INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hashedPassword]);
    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: "Registration error" }, { status: 500 });
  }
}
