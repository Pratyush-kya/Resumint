import type { ResumeData } from "@/lib/resume-types";

const TEMPLATE_CLASS: Record<string, string> = {
  modern: "t-modern",
  classic: "t-classic",
  compact: "t-compact",
};

/**
 * ATS-safe, single-column résumé preview.
 * Plain semantic structure, standard sans-serif, no graphics — this is what
 * prints to PDF. Three recruiter-friendly looks are driven by CSS variables.
 */
export function ResumePreview({
  data,
  template = "modern",
}: {
  data: ResumeData;
  template?: string;
}) {
  const tClass = TEMPLATE_CLASS[template] ?? "t-modern";
  const contactParts = [data.email, data.phone, data.location, data.links]
    .map((c) => c.trim())
    .filter(Boolean);
  const skills = data.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={`resume-sheet ${tClass} bg-white text-[#111]`}>
      <header className="resume-head">
        <h1>{data.fullName || "Your Name"}</h1>
        {data.headline && <div className="resume-sub">{data.headline}</div>}
        {contactParts.length > 0 && (
          <div className="resume-contact">
            {contactParts.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="r-sep">|</span>}
                {c}
              </span>
            ))}
          </div>
        )}
      </header>

      {data.summary && (
        <section className="resume-sec">
          <h2>Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      {data.skills.trim() && (
        <section className="resume-sec">
          <h2>Skills</h2>
          <div className="resume-skills">
            {skills.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="resume-sec">
          <h2>Experience</h2>
          {data.experience.map((e) => (
            <div key={e.id} className="resume-item">
              <div className="resume-item-top">
                <span className="resume-strong">
                  {[e.role, e.company].filter(Boolean).join(" · ")}
                </span>
                <span className="resume-muted">
                  {[e.start, e.end].filter(Boolean).join(" – ")}
                </span>
              </div>
              {e.bullets.trim() && (
                <ul>
                  {e.bullets
                    .split("\n")
                    .filter(Boolean)
                    .map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="resume-sec">
          <h2>Projects</h2>
          {data.projects.map((p) => (
            <div key={p.id} className="resume-item">
              <div className="resume-item-top">
                <span className="resume-strong">{p.name || "Project"}</span>
                {p.link && <span className="resume-muted">{p.link}</span>}
              </div>
              {p.tech?.trim() && (
                <div className="resume-muted" style={{ marginTop: "1.5pt" }}>
                  {p.tech}
                </div>
              )}
              {p.bullets.trim() && (
                <ul>
                  {p.bullets
                    .split("\n")
                    .filter(Boolean)
                    .map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="resume-sec">
          <h2>Education</h2>
          {data.education.map((e) => (
            <div key={e.id} className="resume-item">
              <div className="resume-item-top">
                <span className="resume-strong">{e.school || "School"}</span>
                <span className="resume-muted">
                  {[e.start, e.end].filter(Boolean).join(" – ")}
                </span>
              </div>
              {e.degree && <div className="resume-muted">{e.degree}</div>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
