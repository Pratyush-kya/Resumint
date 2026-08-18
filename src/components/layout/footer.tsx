import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-soft)]/70 backdrop-blur-xl">
      <div className="shell flex flex-col gap-6 py-10 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Resumint— free, private, no login.</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/builder" className="hover:text-[var(--text)]">Builder</Link>
          <Link href="/ats" className="hover:text-[var(--text)]">ATS Checker</Link>
          <Link href="/templates" className="hover:text-[var(--text)]">Templates</Link>
          <Link href="/help" className="hover:text-[var(--text)]">Help</Link>
          <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
