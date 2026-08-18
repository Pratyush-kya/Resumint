"use client";

import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

const links = [
  { href: "/builder", label: "Builder" },
  { href: "/ats", label: "ATS Checker" },
  { href: "/templates", label: "Templates" },
  { href: "/help", label: "Help" },
];
export function Nav() {
  return (
    <header className="site-header nav-glass sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur-md">
      <nav className="shell flex h-16 items-center justify-between">
        <Link href="/" transitionTypes={["nav-back"]} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-grad)] text-white">
            <FileText size={16} />
          </span>
          <span className="gradient-text">Resumint</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} transitionTypes={["nav-forward"]} className="transition hover:text-[var(--text)]">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            transitionTypes={["nav-forward"]}
            className="hidden items-center gap-1.5 rounded-full bg-[var(--accent-grad)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/20 transition hover:opacity-90 sm:inline-flex"
          >
            <Sparkles size={15} /> Start building
          </Link>
        </div>
      </nav>
    </header>
  );
}
