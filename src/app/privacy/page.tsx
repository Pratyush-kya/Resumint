import { PageTransition } from "@/components/providers/page-transition";

export default function PrivacyPage() {
  return (
    <PageTransition>
      <section className="shell py-12 md:py-16">
        <div className="max-w-3xl">
          <span className="eyebrow">Privacy</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Your résumé stays yours.</h1>
          <div className="premium-card mt-8 space-y-5 p-6 leading-7 text-[var(--muted)] md:p-8">
            <p>The résumé Builder and pasted-text ATS check run in your browser. When you choose PDF or DOCX upload, the file is sent only to the résumé-analysis endpoint for that request.</p>
            <p>Uploaded files and extracted text are processed in memory, are not written to application storage, and are discarded after the response. Résumé contents are not intentionally logged.</p>
            <p>Builder drafts are stored in your browser&apos;s local storage on this device. Clearing browser site data removes them.</p>
            <p>The ATS result is a local guidance score, not a guarantee of acceptance or a score supplied by an employer.</p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
