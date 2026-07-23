import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px] bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">404</h1>
        <p className="mt-1 text-sm text-[#666]">
          That short link doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block w-full py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-[10px] hover:bg-[#333]"
        >
          Create a new one
        </Link>
      </div>
    </main>
  );
}
