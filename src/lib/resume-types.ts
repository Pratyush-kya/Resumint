export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string; // newline separated
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  tech: string; // e.g. "Kotlin, Room DB, MVVM"
  bullets: string; // newline separated
}

export interface ResumeData {
  fullName: string;
  headline: string; // e.g. "Fresher Software Developer"
  email: string;
  phone: string;
  location: string;
  links: string; // e.g. GitHub / LinkedIn
  summary: string;
  skills: string; // comma separated
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export const EMPTY_RESUME: ResumeData = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  summary: "",
  skills: "",
  experience: [],
  education: [],
  projects: [],
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

const STORAGE_KEY = "resume-os-data";

export function loadResume(): ResumeData {
  if (typeof window === "undefined") return EMPTY_RESUME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_RESUME;
    return { ...EMPTY_RESUME, ...JSON.parse(raw) } as ResumeData;
  } catch {
    return EMPTY_RESUME;
  }
}

export function saveResume(data: ResumeData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
