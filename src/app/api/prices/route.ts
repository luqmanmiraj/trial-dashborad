import { NextResponse } from "next/server";

// We'll use Yahoo finance chart endpoint (unofficial) via fetch to avoid requiring Node >=20 for yahoo-finance2
// Symbols mapping: BRNT -> BZ=F, WTI -> CL=F, NG -> NG=F, USD/RUB -> RUB=X
const SYMBOLS: Record<string, string> = {
  BRNT: "BZ=F",
  WTI: "CL=F",
  NG: "NG=F",
  "USD/RUB": "RUB=X",
};

type Point = { t: number; c: number };

async function fetchSeries(symbol: string): Promise<Point[]> {
  const period1 = Math.floor(Date.now() / 1000) - 60 * 60 * 24; // 24h ago
  const period2 = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?period1=${period1}&period2=${period2}&interval=5m`;
  const r = await fetch(url, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error(`Failed to fetch ${symbol}`);
  const json = await r.json();
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp || [];
  const closes: number[] = result?.indicators?.quote?.[0]?.close || [];
  const points: Point[] = timestamps
    .map((ts: number, i: number) => ({ t: ts * 1000, c: closes[i] }))
    .filter((p) => Number.isFinite(p.c));
  return points;
}

export async function GET() {
  try {
    const entries = await Promise.all(
      Object.entries(SYMBOLS).map(async ([key, sym]) => {
        const series = await fetchSeries(sym);
        const first = series[0]?.c ?? null;
        const last = series[series.length - 1]?.c ?? null;
        const diffUp = first !== null && last !== null ? last >= first : true;
        return [key, { series, up: diffUp }] as const;
      })
    );
    const data = Object.fromEntries(entries);
    return NextResponse.json({ data }, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}


