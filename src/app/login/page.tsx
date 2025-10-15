"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
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
    <div className="min-h-screen bg-[#0b0f12] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm bg-[#12171b]/90 backdrop-blur-sm rounded-xl border border-white/10 p-8 shadow-[0_0_60px_rgba(0,0,0,0.7)] hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] transition-all duration-500 hover:border-emerald-500/30 hover:-translate-y-1"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Sign in
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-emerald-400 transition-colors">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50 hover:border-white/20 transition-all duration-300 placeholder-gray-500"
              placeholder="user"
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-emerald-400 transition-colors">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/50 hover:border-white/20 transition-all duration-300 placeholder-gray-500"
              placeholder="password"
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-shake">
              <p className="text-red-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-4 hover:from-emerald-600 hover:to-blue-600 hover:shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/30 focus:outline-none relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure access to your dashboard
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0f12] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#12171b] rounded-xl border border-white/10 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-semibold tracking-wide mb-6">Sign in</h1>
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded-md mb-4"></div>
            <div className="h-10 bg-white/10 rounded-md mb-6"></div>
            <div className="h-10 bg-white/10 rounded-md"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}


