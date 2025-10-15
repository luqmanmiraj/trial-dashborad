"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const next = params.get("next") || "/dashboard";
      router.replace(next);
    } else {
      const data = await res.json().catch(() => ({ message: "Login failed" }));
      setError(data.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f12] text-white flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-[#12171b] rounded-xl border border-white/10 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        <h1 className="text-2xl font-semibold tracking-wide mb-6">Sign in</h1>
        <label className="block text-sm mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/60"
          placeholder="admin"
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/60"
          placeholder="password"
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 py-2 hover:bg-emerald-500/30 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}


