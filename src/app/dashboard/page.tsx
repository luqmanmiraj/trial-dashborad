"use client";
import useSWR from "swr";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis } from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1418] flex-1 h-[280px] select-none outline-none focus:outline-none" tabIndex={-1}>
      {/* Text header - reserved space */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 text-sm text-white/80 bg-gradient-to-b from-[#0f1418] to-transparent pointer-events-none">
        <span className="font-medium">{title}</span>
        {last !== null && (
          <span className={`tabular-nums ${change !== null && change >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {last.toFixed(3)}{change !== null && (
              <span className="ml-2 text-white/60">{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
            )}
          </span>
        )}
      </div>
      {/* Chart area - starts below header */}
      <div className="absolute top-10 left-0 right-0 bottom-0 w-full pointer-events-none">
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
    </div>
  );
}

type InitialRequestData = {
  vessel_name: string;
  mgo_tons: string;
  ifo_tons: string;
  bunker_date_start: string;
  bunker_date_end: string;
  port: string;
  agent_name: string;
  full_order_text: string;
};

type FirstNominationData = {
  vessel_name: string;
  vessel_imo: string;
  vessel_flag: string;
};

type FinalNominationData = {
  vessel_name: string;
  actual_mgo_tons: string;
  mgo_price: string;
  actual_ifo_tons: string;
  ifo_price: string;
  bunker_date: string;
};

type NominationFormData = {
  vessel_name: string;
  vessel_imo: string;
  vessel_flag: string;
  vessel_port: string;
  bdn_numbers: string;
  mgo_tons: string;
  mgo_price: string;
  ifo_tons: string;
  ifo_price: string;
  vessel_supply_date: string; // DD.MM.YYYY
  vessel_trader: string;
  vessel_agent: string;
  currency: string;
  exchange_rate: string;
};

const PORTS = [
  "Singapore", "Rotterdam", "Fujairah", "Gibraltar", "Houston", "Antwerp",
  "Panama", "Las Palmas", "Piraeus", "Algeciras", "Zhoushan", "Busan",
  "Istanbul", "Port Said", "Colombo", "Hong Kong", "Dubai", "Jebel Ali",
  "Saint-Petersburg", "Ust-Luga", "Bronca", "Kronshstadt", "Primorsk", "InterFerum"
];

function PortDropdown({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition text-white text-left flex items-center justify-between"
      >
        <span className={value ? "text-white" : "text-white/50"}>{value || "Select port"}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1f24] border border-white/10 rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
          {PORTS.map((port) => (
            <button
              key={port}
              type="button"
              onClick={() => {
                onChange(port);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left transition ${
                value === port ? "bg-emerald-500/20 text-emerald-300" : "text-white"
              }`}
            >
              {port}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Initial Request Form
function InitialRequestForm({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<InitialRequestData>({
    vessel_name: "",
    mgo_tons: "",
    ifo_tons: "",
    bunker_date_start: "",
    bunker_date_end: "",
    port: "",
    agent_name: "",
    full_order_text: "",
  });

  const update = (k: keyof InitialRequestData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // Implement API call for initial request
      setMessage("Initial request submitted successfully");
    } catch (err: any) {
      setMessage(`Error: ${err?.message || "failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#11171c] to-[#0c1115] p-5 grid gap-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-wide">Initiate new request</h3>
        <button type="button" className="text-white/60" onClick={onClose}>Close</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Vessel Name</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.vessel_name} onChange={(e) => update("vessel_name", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">MGO tons</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.mgo_tons} onChange={(e) => update("mgo_tons", e.target.value)} placeholder="e.g. 120" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">IFO tons</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.ifo_tons} onChange={(e) => update("ifo_tons", e.target.value)} placeholder="e.g. 180" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Bunker date (start)</span>
          <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.bunker_date_start} onChange={(e) => update("bunker_date_start", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Bunker date (end)</span>
          <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.bunker_date_end} onChange={(e) => update("bunker_date_end", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Port</span>
          <PortDropdown value={form.port} onChange={(val) => update("port", val)} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Agent name</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.agent_name} onChange={(e) => update("agent_name", e.target.value)} />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-white/70">Full order text</span>
        <textarea className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition min-h-[100px] resize-none" value={form.full_order_text} onChange={(e) => update("full_order_text", e.target.value)} placeholder="e.g. 75 mt MGO&#10;Supply 17-19.08.&#10;&#10;Mv Kaari&#10;St.Petersburg&#10;&#10;Rusnautic&#10;Agency dept." />
      </label>

      <div className="flex items-center gap-3 justify-end">
        <button disabled={submitting} className="px-5 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 transition font-medium">
          {submitting ? "Submitting…" : "Submit request"}
        </button>
        {message && <span className="text-sm text-white/70">{message}</span>}
      </div>
    </form>
  );
}

// First Nomination Form
function FirstNominationForm({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FirstNominationData>({
    vessel_name: "",
    vessel_imo: "",
    vessel_flag: "",
  });

  const update = (k: keyof FirstNominationData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // Implement API call for first nomination
      setMessage("First nomination submitted successfully");
    } catch (err: any) {
      setMessage(`Error: ${err?.message || "failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#11171c] to-[#0c1115] p-5 grid gap-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-wide">Generate first nomination</h3>
        <button type="button" className="text-white/60" onClick={onClose}>Close</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Vessel name</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.vessel_name} onChange={(e) => update("vessel_name", e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Vessel IMO</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.vessel_imo} onChange={(e) => update("vessel_imo", e.target.value)} placeholder="e.g. 9876543" inputMode="numeric" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Vessel flag</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.vessel_flag} onChange={(e) => update("vessel_flag", e.target.value)} placeholder="e.g. Panama" />
        </label>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button disabled={submitting} className="px-5 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 transition font-medium">
          {submitting ? "Generating…" : "Generate & email"}
        </button>
        {message && <span className="text-sm text-white/70">{message}</span>}
      </div>
    </form>
  );
}

// Final Nomination Form
function FinalNominationForm({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FinalNominationData>({
    vessel_name: "",
    actual_mgo_tons: "",
    mgo_price: "",
    actual_ifo_tons: "",
    ifo_price: "",
    bunker_date: "",
  });

  const update = (k: keyof FinalNominationData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // Implement API call for final nomination
      setMessage("Final nomination submitted successfully");
    } catch (err: any) {
      setMessage(`Error: ${err?.message || "failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#11171c] to-[#0c1115] p-5 grid gap-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-wide">Generate final nomination</h3>
        <button type="button" className="text-white/60" onClick={onClose}>Close</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Vessel name</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.vessel_name} onChange={(e) => update("vessel_name", e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Actual MGO tons</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.actual_mgo_tons} onChange={(e) => update("actual_mgo_tons", e.target.value)} placeholder="e.g. 120" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">MGO price</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.mgo_price} onChange={(e) => update("mgo_price", e.target.value)} placeholder="e.g. 535.00" inputMode="decimal" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Actual IFO tons</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.actual_ifo_tons} onChange={(e) => update("actual_ifo_tons", e.target.value)} placeholder="e.g. 180" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">IFO price</span>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.ifo_price} onChange={(e) => update("ifo_price", e.target.value)} placeholder="e.g. 505.00" inputMode="decimal" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Bunker date (single date)</span>
          <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition" value={form.bunker_date} onChange={(e) => update("bunker_date", e.target.value)} />
        </label>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button disabled={submitting} className="px-5 py-2 text-sm rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 transition font-medium">
          {submitting ? "Generating…" : "Generate & email"}
        </button>
        {message && <span className="text-sm text-white/70">{message}</span>}
      </div>
    </form>
  );
}

function NominationForm({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const [useMgo, setUseMgo] = useState(true);
  const [useIfo, setUseIfo] = useState(false);
  const [form, setForm] = useState<NominationFormData>({
    vessel_name: "",
    vessel_imo: "",
    vessel_flag: "",
    vessel_port: "",
    bdn_numbers: "",
    mgo_tons: "0",
    mgo_price: "0",
    ifo_tons: "0",
    ifo_price: "0",
    vessel_supply_date: "",
    vessel_trader: "",
    vessel_agent: "",
    currency: "USD",
    exchange_rate: "1",
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const update = (k: keyof NominationFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const supplyDateFormatted = (() => {
        // If user picked a native date (yyyy-mm-dd), convert to DD.MM.YYYY as required
        const v = form.vessel_supply_date?.trim();
        if (!v) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          const [y, m, d] = v.split("-");
          return `${d}.${m}.${y}`;
        }
        return v;
      })();
      const res = await fetch(`${apiBase}/endpoint1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_name: form.vessel_name,
          vessel_imo: Number(form.vessel_imo || 0),
          vessel_port: form.vessel_port,
          mgo_tons: form.mgo_tons,
          mgo_price: Number(form.mgo_price || 0),
          ifo_tons: form.ifo_tons,
          ifo_price: Number(form.ifo_price || 0),
          vessel_supply_date: supplyDateFormatted,
          vessel_trader: form.vessel_trader,
          vessel_agent: form.vessel_agent,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const firstUrl = data?.files?.[0]?.url;
      setMessage(firstUrl ? `File: ${firstUrl}` : `Generated successfully`);
    } catch (err: any) {
      setMessage(`Error: ${err?.message || "failed"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const input = (
    name: keyof NominationFormData,
    label: string,
    props?: React.InputHTMLAttributes<HTMLInputElement>,
    wrapperClass?: string
  ) => (
    <label className={`grid gap-1 ${wrapperClass || ""}`}>
      <span className="text-sm text-white/70">{label}</span>
      <input
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        {...props}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#11171c] to-[#0c1115] p-5 grid gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-wide">Generate nomination</h3>
        <button type="button" className="text-white/60" onClick={onClose}>Close</button>
      </div>
      {/* Vessel Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {input("vessel_name", "Vessel name")}
        {input("vessel_imo", "Vessel IMO", { inputMode: "numeric", placeholder: "e.g. 9876543" })}
        {input("vessel_flag", "Vessel flag", { placeholder: "e.g. Panama" })}
      </div>

      {/* Port, Date, BDN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Port</span>
          <PortDropdown value={form.vessel_port} onChange={(val) => update("vessel_port", val)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Supply date (DD.MM.YYYY)</span>
          <input
            type="text"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
            value={form.vessel_supply_date}
            onChange={(e) => update("vessel_supply_date", e.target.value)}
            placeholder="DD.MM.YYYY"
          />
        </label>
        {input("bdn_numbers", "BDN numbers", { placeholder: "e.g. 2807/01,2807/02" })}
      </div>

      {/* Product toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/60">Products:</span>
        <button type="button" onClick={() => setUseMgo(v => !v)} className={`px-2.5 py-1 rounded-full text-xs border ${useMgo ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-white/5 border-white/15 text-white/70"}`}>MGO</button>
        <button type="button" onClick={() => setUseIfo(v => !v)} className={`px-2.5 py-1 rounded-full text-xs border ${useIfo ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-white/5 border-white/15 text-white/70"}`}>IFO</button>
      </div>

      {/* Conditional product fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {useMgo && (
          <>
            {input("mgo_tons", "MGO tons", { inputMode: "numeric", placeholder: "e.g. 120" })}
            {input("mgo_price", "MGO price", { inputMode: "decimal", placeholder: "e.g. 535.00" })}
          </>
        )}
        {useIfo && (
          <>
            {input("ifo_tons", "IFO tons", { inputMode: "numeric", placeholder: "e.g. 180" })}
            {input("ifo_price", "IFO price", { inputMode: "decimal", placeholder: "e.g. 505.00" })}
          </>
        )}
      </div>

      {/* Trader and Agent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {input("vessel_trader", "Trader")}
        {input("vessel_agent", "Agent")}
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button disabled={submitting} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 transition font-medium">
          {submitting ? "Generating…" : "Generate & email"}
        </button>
        {message && (
          <span className="text-sm text-white/70 truncate max-w-[60ch]">
            {/^https?:\/\//.test(message.replace(/^File: /, "")) ? (
              <a className="underline" href={message.replace(/^File: /, "")} target="_blank" rel="noreferrer">
                Download file
              </a>
            ) : (
              message
            )}
          </span>
        )}
      </div>
    </form>
  );
}

export default function DashboardPage() {
  const { data } = useSWR<PriceResp>("/api/prices", fetcher, { refreshInterval: 60_000 });
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const charts = ["BRNT", "WTI", "NG", "USD/RUB"] as const;

  return (
    <div className="min-h-screen bg-[#0b0f12] text-white flex">
      {/* Left navigation */}
      <aside 
        className={`${sidebarExpanded ? 'w-48' : 'w-16 sm:w-20'} bg-[#0a0e11] border-r border-white/10 flex flex-col py-4 gap-3 transition-all duration-300 ease-in-out relative overflow-hidden`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 border border-emerald-400/40 flex-shrink-0" />
          <span className={`text-sm font-medium text-white whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
            Dashboard
          </span>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center px-4 gap-3 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex-shrink-0" />
            <span className={`text-sm text-white/70 whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Item {i + 1}
            </span>
          </div>
        ))}
        {/* Bottom icons: user and settings */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            aria-label="Account"
            className="flex items-center px-4 gap-3 hover:bg-white/5 transition-colors w-full text-left"
          >
            <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 grid place-items-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <circle cx="12" cy="8" r="3" />
              <path d="M4 20c0-3.314 3.134-6 8-6s8 2.686 8 6" />
            </svg>
            </div>
            <span className={`text-sm text-white/70 whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Account
            </span>
          </button>
          <button
            aria-label="Settings"
            className="flex items-center px-4 gap-3 hover:bg-white/5 transition-colors w-full text-left"
            onClick={logout}
          >
            <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 grid place-items-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .68.39 1.3 1.01 1.59.31.15.66.41.66.41" />
            </svg>
            </div>
            <span className={`text-sm text-white/70 whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              Logout
            </span>
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
              series={data?.data?.[name as string]?.series || []}
              up={data?.data?.[name as string]?.up ?? true}
            />
          ))}
        </div>

        <div className="h-px bg-white/10 my-6" />

        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Buttons section */}
          <div className="grid gap-3 w-full lg:w-[280px] flex-shrink-0">
            {["Initiate new request", "Generate first nomination", "Generate final nomination", "Generate invoice", "Record trade"].map(
              (label) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === "Generate invoice" || label === "Record trade") {
                      setActiveForm(null);
                    } else {
                      setActiveForm(label);
                    }
                  }}
                  className="text-left px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  {label}
                </button>
              )
            )}
          </div>
          
          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-white/10 mx-5 self-stretch" />
          
          {/* Form section */}
          <div className="flex-1 mt-4 lg:mt-0">
            {activeForm === "Initiate new request" ? (
              <InitialRequestForm onClose={() => setActiveForm(null)} />
            ) : activeForm === "Generate first nomination" ? (
              <FirstNominationForm onClose={() => setActiveForm(null)} />
            ) : activeForm === "Generate final nomination" ? (
              <FinalNominationForm onClose={() => setActiveForm(null)} />
            ) : activeForm ? (
              <NominationForm onClose={() => setActiveForm(null)} />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] min-h-[320px] grid place-items-center text-white/50">
                Select an action to open the form
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


