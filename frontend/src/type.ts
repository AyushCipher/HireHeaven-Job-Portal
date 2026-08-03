import React, { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}

export interface ScoreBreakdown {
  formatting: { score: number; feedback: string };
  keywords: { score: number; feedback: string };
  structure: { score: number; feedback: string };
  readability: { score: number; feedback: string };
}

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysisResponse {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: Suggestion[];
  strengths: string[];
  summary: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter" | "admin";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: string | null;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  btnLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  updateProfilePic: (formData: any) => Promise<void>;
  updateResume: (formData: any) => Promise<void>;
  updateUser: (name: string, phoneNumber: string, bio: string) => Promise<void>;
  addSkill: (
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>
  ) => Promise<void>;
  removeSkill: (skill: string) => Promise<void>;
  applyJob: (job_id: number) => Promise<void>;
  applications: Application[];
  fetchApplications: () => Promise<void>;
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface AccontProps {
  user: User;
  isYourAccount: boolean;
}

export interface JobRound {
  round_id: number;
  round_order: number;
  name: string;
  description: string | null;
}

export interface JobQuestion {
  question_id: number;
  question_order: number;
  question_text: string;
}

export interface JobAttachment {
  attachment_id: number;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export type StageStatus = "upcoming" | "in_progress" | "completed" | "rejected";

export interface ApplicationStageHistoryEntry {
  history_id: number;
  round_id: number | null;
  stage_name: string;
  status: StageStatus;
  note: string | null;
  changed_at: string;
}

export interface Job {
  job_id: number;
  title: string;
  description: string;
  salary: number | null;
  location: string | null;
  job_type: "Full-time" | "Part-time" | "Contract" | "Internship";
  openings: number;
  role: string;
  work_location: "On-site" | "Remote" | "Hybrid";
  company_id: number;
  company_name: string;
  company_logo: string;
  posted_by_recuriter_id: number;
  created_at: string;
  is_active: boolean;

  // Job Detail redesign — all nullable, absent for jobs posted before this
  // feature shipped (job_details is a LEFT JOIN on the backend).
  apply_by: string | null;
  role_type: string | null;
  min_hires: number | null;
  expected_offers: number | null;
  duration: string | null;
  stipend: number | null;
  ctc_min: number | null;
  ctc_max: number | null;
  qualification: string | null;
  working_days: string | null;
  category: string | null;
  conversion_note: string | null;
  eligible_gender: string | null;
  eligible_grad_years: string | null;
  criteria: string | null;
  job_start_date: string | null;
  date_of_visit: string | null;
  internship_mode: string | null;
  internship_start_date: string | null;
  internship_duration: string | null;
  internship_season: string | null;
  last_modified_by: number | null;
  updated_at: string | null;

  rounds: JobRound[];
  tags: string[];
  skills: string[];
  questions: JobQuestion[];
  attachments: JobAttachment[];
  applicant_count: number;
}

export interface Company {
  company_id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  logo_public_id: string;
  recruiter_id: number;
  created_at: string;
  jobs?: Job[];
}

type ApplicationStatus = "Submitted" | "Rejected" | "Hired";

export interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email: string;
  status: ApplicationStatus;
  resume: string;
  applied_at: string;
  subscribed: boolean;
  current_round_id: number | null;
  job_title: string;
  job_salary: number;
  job_location: string;
  job_type: Job["job_type"];
  job_is_active: boolean;
  company_name: string;
  company_logo: string;
}
