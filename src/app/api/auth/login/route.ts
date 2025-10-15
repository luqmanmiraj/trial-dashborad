import { NextResponse } from "next/server";
import { getDatabase, dbGet } from "@/lib/database";
import bcrypt from "bcryptjs";

type UserRow = { id: number; username: string; password_hash: string; created_at: string };

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({} as { username?: string; password?: string }));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 });
    }

    const db = getDatabase();
    const row = await dbGet<UserRow>(db, "SELECT * FROM users WHERE username = ?", [username]);

    if (!row) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "Authentication error" }, { status: 500 });
  }
}


