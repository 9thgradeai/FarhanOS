export type Theme = 'dark' | 'cyberpunk' | 'ai' | 'terminal' | 'light';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'AI' | 'NLP' | 'SaaS' | 'Open Source' | 'Research' | 'Productivity' | 'Design' | 'Education' | 'Developer Tools' | 'AI/ML' | 'AI/Code' | 'Automation' | 'MLOps' | 'Web' | 'CLI Tool';
  techStack: string[];
  architecture: string;
  timeline: string;
  metrics: { label: string; value: string }[];
  problem: string;
  solution: string;
  roadmap: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  /** Plain-language key finding, quotable on-site for readers and AI engines. */
  takeaway?: string;
  methodology: string;
  dataset: string;
  pipeline: string;
  results: { metric: string; score: string }[];
  citation: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  company: string;
  role: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Article {
  id: string;
  title: string;
  category: 'AI' | 'Engineering' | 'Productivity' | 'Research' | 'Life' | 'Startups' | 'Design' | 'Philosophy';
  readTime: string;
  date: string;
  excerpt: string;
  content: string;
  link?: string;
  imageUrl?: string;
}

export interface BuildLog {
  id: string;
  date: string;
  version: string;
  title: string;
  description: string;
  tasksCompleted: string[];
  metricsChanged: { metric: string; before: string; after: string }[];
}

export interface GardenNode {
  id: string;
  label: string;
  category: 'Intelligence' | 'Engineering' | 'Research' | 'Humanity';
  x?: number;
  y?: number;
}

export interface GardenLink {
  source: string;
  target: string;
}

export interface SkillNode {
  name: string;
  category: 'AI/ML' | 'Frontend' | 'Backend' | 'Research & Science' | 'Systems & Devops';
  weight: number; // 1 to 5, dictates node size
}

export interface ProfessionalTimelineEvent {
  year: string;
  title: string;
  company: string;
  role: string;
  description: string;
  achievements: string[];
  technologies: string[];
  badgeColor: 'emerald' | 'indigo' | 'pink' | 'amber';
}

export interface PortfolioData {
  name: string;
  title: string;
  tagline: string;
  about: string;
  focus: string;
  readingNow: string;
  learningNow: string;
  thinkingAbout: string;
  projects: Project[];
  projectLinks: Record<string, { github?: string; demo?: string }>;
  papers: Paper[];
  timeline: TimelineEvent[];
  professionalTimeline: ProfessionalTimelineEvent[];
  articles: Article[];
  buildLogs: BuildLog[];
  skills: SkillNode[];
  gardenNodes: GardenNode[];
  gardenLinks: GardenLink[];
  certifications: { title: string; issuer: string; date: string; skills: string[] }[];
  testimonials: { text: string; author: string; role: string; initials: string }[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  homepage: string | null;
}

export interface StyleSet {
  bg: string;
  glass: string;
  windowHeader: string;
  btnPrimary: string;
  btnSecondary: string;
  accentColor: string;
  accentBorder: string;
  indicator: string;
  panelHeader: string;
  badge: string;
}

