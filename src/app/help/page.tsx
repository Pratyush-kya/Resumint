const faqs = [
  ["Where is my résumé stored?", "Builder drafts stay in this browser. ATS file uploads are processed in memory for one analysis request and are not saved by the application."],
  ["How do I download a PDF?", "Open the Builder, fill your details, then choose Print / save PDF. Select Save as PDF in your browser's print window."],
  ["Is the ATS score official?", "No. It is a transparent keyword and structure check designed to help you improve alignment. Employers use different ATS products and rules."],
  ["Should I copy every job-description keyword?", "No. Add only terms that truthfully match your skills and experience, and use them naturally in context."],
  ["Which template should I choose?", "Classic suits conservative roles, Modern works well for most applications, and Compact helps when you have more content."],
];

export default function HelpPage() {
  return (
    <section className="shell py-12 md:py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Help</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Questions, answered plainly.</h1>
        <p className="mt-3 text-[var(--muted)]">Everything you need to build, check, and export your résumé.</p>
      </div>
      <div className="mt-10 max-w-3xl space-y-3">
        {faqs.map(([question, answer]) => (
          <details key={question} className="faq-item premium-card group p-5">
            <summary className="cursor-pointer list-none pr-8 font-semibold">{question}</summary>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
