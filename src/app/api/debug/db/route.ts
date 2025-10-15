import { NextResponse } from "next/server";
import { getDatabase, dbGet } from "@/lib/database";

export async function GET() {
  try {
    const db = getDatabase();
    
    // Check if users table exists and get user count
    const userCount = await dbGet<{ count: number }>(db, "SELECT COUNT(*) as count FROM users");
    const adminUser = await dbGet<{ username: string; created_at: string }>(db, "SELECT username, created_at FROM users WHERE username = 'admin'");
    
    return NextResponse.json({
      database: "connected",
      userCount: userCount?.count || 0,
      adminUser: adminUser ? {
        username: adminUser.username,
        created_at: adminUser.created_at
      } : null,
      timestamp: new Date().toISOString()
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
