
# Resumint

**🌍 Live Demo:** [https://resumint.vercel.app](https://resumint.vercel.app)
resume-ats — free, client-side resume builder + ATS score checker. Next.js 16, React 19, Tailwind v4, Lenis, Motion. Dark-premium "Watermelon" UI: gradient hero, bento cards, eyebrow labels, VibeBox vivid mode. Upload or build a resume, parse in-browser (pdfjs), get a real ATS score — no login, no backend, no cost.

# resume-ats

A free, fully client-side **resume builder + ATS score checker**. Build a resume,
upload a PDF/DOCX, and get a real Applicant Tracking System readability score —
all in your browser. No login, no backend storage, no cost.

## Highlights

- **Resume builder** — pick a template, fill in your details, preview live.
- **ATS checker** — upload a PDF or DOCX and get a content + structure score with
  concrete fixes (columns, tables, missing text layer, fonts, headers/footers,
  text boxes, filename quality).
- **Private by design** — parsing runs in-browser / via a stateless API; nothing
  is stored on a server.
- **Dark-premium "Watermelon" UI** — gradient hero, bento cards, eyebrow labels,
  and a one-shot **VibeBox** vivid background mode.
- **No login / no cost** — client-side only.

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Lenis (smooth scroll) ·
Motion (animations) · pdf.js (PDF parsing) · JSZip + fast-xml-parser (DOCX) ·
Vitest (tests).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest run
```

## Project layout

```
src/app/            # routes: /, /builder, /ats, /templates, /help, /privacy
src/components/     # marketing, tools, layout, providers
src/lib/            # ats-engine, resume types, upload validation, server parsers
tests/              # vitest: ats-engine, pdf/docx analysis
```

## Privacy

This tool parses resumes locally in your browser. See `/privacy` in the app for
the full policy.

## License

MIT — free to use, modify, and share.
