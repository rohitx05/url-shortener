"use client";

import { useState } from "react";

interface UrlStats {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

async function shortenUrl(url: string): Promise<{ shortUrl: string; shortCode: string }> {
  const res = await fetch("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to shorten URL.");
  }

  return { shortUrl: data.shortUrl, shortCode: data.shortCode };
}

async function fetchStats(shortCode: string): Promise<UrlStats> {
  const res = await fetch(`/api/stats/${shortCode}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch stats.");
  }

  return data;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setStats(null);
    setCopied(false);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }

    setIsLoading(true);

    try {
      const result = await shortenUrl(url);
      setShortUrl(result.shortUrl);

      // Automatically fetch stats after shortening
      const urlStats = await fetchStats(result.shortCode);
      setStats(urlStats);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px] bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8 sm:p-10">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">URL Shortener</h1>
        <p className="mt-1 text-sm text-[#666]">
          Paste a URL below to create a shorter link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="w-full px-4 py-3 text-sm border border-[#ddd] rounded-[10px] outline-none focus:border-[#999] placeholder:text-[#aaa]"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-[10px] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Shortening…" : "Shorten"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {shortUrl && (
          <div className="mt-5 p-4 bg-[#f9f9f9] rounded-[10px] flex items-center justify-between gap-3">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-[#1a1a1a] font-medium truncate hover:underline"
            >
              {shortUrl}
            </a>
            <button
              onClick={handleCopy}
              className="shrink-0 text-sm text-[#666] hover:text-[#1a1a1a] cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {stats && (
          <div className="mt-4 pt-4 border-t border-[#eee] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#999]">Original</span>
              <span className="text-[#1a1a1a] truncate ml-4 max-w-[300px] text-right" title={stats.originalUrl}>
                {stats.originalUrl}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#999]">Clicks</span>
              <span className="text-[#1a1a1a] font-mono">{stats.clicks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#999]">Created</span>
              <span className="text-[#1a1a1a]">
                {new Date(stats.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[#999] text-center">Fast. Simple. Free.</p>
    </main>
  );
}
