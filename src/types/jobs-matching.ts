export type MatchItem = {
  matched: boolean;
  relevance: string;
  evidence: string[];
};

export type MatchResult = {
  final_score: number;
  required_skills_score: number;
  experience_score: number;
  projects_score: number;
  qualification_score: number;
  preferred_skills_score: number | null;
  preferred_skills_available: boolean;
  matched_required_skills: string[];
  missing_required_skills: string[];
  matched_preferred_skills: string[];
  experience_matches: MatchItem[];
  project_matches: MatchItem[];
  qualification_matches: MatchItem[];
};

export type MatchResponse = {
  success: boolean;
  message: string;
  data: MatchResult;
};
