import { NextResponse } from "next/server";
import { getDatabase, dbGet } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    
    // Check user count and admin user
    const userCount = await dbGet<{ count: number }>(db, "SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
    const adminUser = await dbGet<{ username: string; created_at: string }>(db, "SELECT username, created_at FROM users WHERE username = 'admin'");
    
    return NextResponse.json({
      database: "connected (in-memory)",
      userCount: userCount?.count || 0,
      adminUser: adminUser ? {
        username: adminUser.username,
        created_at: adminUser.created_at
      } : null,
      timestamp: new Date().toISOString(),
      note: "Using in-memory database for Netlify serverless environment"
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      database: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
