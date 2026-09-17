import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-navy/70">That URL is not on the new site.</p>
      <Link href="/" className="mt-4 inline-block text-teal underline">
        Back home
      </Link>
    </div>
  );
}
