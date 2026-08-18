import Link from "next/link";

export function Placeholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <section className="shell py-24 text-center">
      <span className="eyebrow">Coming next</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">{blurb}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)]"
      >
        Back home
      </Link>
    </section>
  );
}
