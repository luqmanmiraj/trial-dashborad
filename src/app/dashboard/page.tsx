"use client";
import useSWR from "swr";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis } from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SeriesPoint = { t: number; c: number };

type PriceResp = {
  data: Record<string, { series: SeriesPoint[]; up: boolean }>;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function MiniChart({ title, series, up }: { title: string; series: SeriesPoint[]; up: boolean }) {
  const color = up ? "#34d399" : "#f87171"; // emerald / red
  const data = series.map((p) => ({ x: p.t, y: p.c }));
  const safeId = `g-${title.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const last = data[data.length - 1]?.y ?? null;
  const first = data[0]?.y ?? null;
  const change = last !== null && first !== null ? ((last - first) / first) * 100 : null;
  const min = data.reduce((m, d) => (Number.isFinite(d.y) && d.y < m ? d.y : m), Number.POSITIVE_INFINITY);
  const max = data.reduce((m, d) => (Number.isFinite(d.y) && d.y > m ? d.y : m), Number.NEGATIVE_INFINITY);
  const pad = Number.isFinite(min) && Number.isFinite(max) ? Math.max((max - min) * 0.1, (max || 1) * 0.001) : 1;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1418] flex-1 h-[280px]">
      <div className="absolute inset-0 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={safeId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <YAxis hide width={0} tickLine={false} axisLine={false} domain={[min - pad, max + pad]} />
            <XAxis
              hide
              height={0}
              axisLine={false}
              tickLine={false}
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              padding={{ left: 0, right: 0 }}
              allowDataOverflow
            />
            <Area type="monotone" dataKey="y" stroke={color} fill={`url(#${safeId})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 text-sm text-white/80 backdrop-blur-[1px]">
        <span className="font-medium">{title}</span>
        {last !== null && (
          <span className={`tabular-nums ${change !== null && change >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {last.toFixed(3)}{change !== null && (
              <span className="ml-2 text-white/60">{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useSWR<PriceResp>("/api/prices", fetcher, { refreshInterval: 60_000 });
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const charts = ["BRNT", "WTI", "NG", "USD/EUR"] as const;

  return (
    <div className="min-h-screen bg-[#0b0f12] text-white flex">
      {/* Left navigation */}
      <aside className="w-16 sm:w-20 bg-[#0a0e11] border-r border-white/10 flex flex-col items-center py-4 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/40" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-md bg-white/5 border border-white/10" />
        ))}
        {/* Bottom icons: user and settings */}
        <div className="mt-auto flex flex-col items-center gap-3 pb-1">
          <button
            aria-label="Account"
            className="w-9 h-9 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 grid place-items-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <circle cx="12" cy="8" r="3" />
              <path d="M4 20c0-3.314 3.134-6 8-6s8 2.686 8 6" />
            </svg>
          </button>
          <button
            aria-label="Settings"
            className="w-9 h-9 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 grid place-items-center"
            onClick={logout}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .68.39 1.3 1.01 1.59.31.15.66.41.66.41" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold tracking-wide">Dashboard</h1>
        {/* Time bar */}
        <div className="mt-2 text-sm text-white/70 flex flex-wrap gap-8">
          <span>
            {now.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" })}
            {"  "}
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>
            New York: {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" })}
          </span>
          <span>
            London: {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}
          </span>
          <span>
            Hong Kong: {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Hong_Kong" })}
          </span>
        </div>
        <div className="h-px bg-white/10 my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
          {charts.map((name) => (
            <MiniChart
              key={name}
              title={name}
              series={data?.data?.[name === "USD/EUR" ? "EUR/USD" : (name as string)]?.series || []}
              up={data?.data?.[name === "USD/EUR" ? "EUR/USD" : (name as string)]?.up ?? true}
            />
          ))}
        </div>

        <div className="h-px bg-white/10 my-6" />

        <div className="grid gap-3 max-w-sm">
          {["Initiate new request", "Generate first nomination", "Generate final nomination", "Generate invoice", "Record trade"].map(
            (label) => (
              <button
                key={label}
                className="text-left px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                {label}
              </button>
            )
          )}
        </div>
      </main>
    </div>
  );
}


