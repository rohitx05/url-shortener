"use client";

import { useState } from "react";

/**
 * Placeholder function for URL shortening.
 * Replace this with an actual API call to your backend.
 *
 * Example integration:
 *   const res = await fetch("/api/shorten", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ url }),
 *   });
 *   const data = await res.json();
 *   return data.shortUrl;
 */
async function shortenUrl(url: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a fake shortened URL for now
  const id = Math.random().toString(36).substring(2, 8);
  return `https://short.url/${id}`;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShortUrl("");
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
      // TODO: Replace with actual backend call
      const result = await shortenUrl(url);
      setShortUrl(result);
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
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px] bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8 sm:p-10">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">URL Shortener</h1>
        <p className="mt-1 text-sm text-[#666]">
          Paste a long URL and get a shorter one.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/your-very-long-url"
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
              className="text-sm text-[#1a1a1a] font-medium truncate hover:underline"
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
      </div>
    </main>
  );
}
