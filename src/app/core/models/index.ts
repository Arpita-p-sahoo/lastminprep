export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bannerUrl?: string;
  designation: string;
  organisation: string;
  address?: string;
  highestEducation?: string;
  experience: string;
  age: number;
  gender: string;
  dob: string;
  linkedinUrl: string;
  techStack: string[];
  streak: number;
  questionsPosted: number;
  totalVotes: number;
  joinedAt: Date;
}

export interface Question {
  id: string;
  title: string;
  techTag: string;
  hashtags: string[];
  votes: number;
  commentCount: number;
  author: Partial<User>;
  createdAt: Date;
  isHot?: boolean;
  isNew?: boolean;
  isSaved?: boolean;
  isVoted?: boolean;
  thread?: Comment[];
}

export interface Comment {
  id: string;
  author: Partial<User>;
  text: string;
  createdAt: Date;
  replies?: Comment[];
}
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'Onsite';
  experience: string;
  salary: string;
  techStack: string[];
  description: string;
  postedAt: Date;
  postedBy: Partial<User>;
}

export interface Notification {
  id: string;
  icon: string;
  text: string;
  time: string;
  isRead: boolean;
  link?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: Partial<User>;
  points: number;
  questionsCount: number;
  isCurrentUser?: boolean;
}

export type Domain =
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'devops'
  | 'datascience'
  | 'system';

export interface Framework {
  name: string;
  icon: string;
  count: number;
  domain: Domain;
}

export interface DomainConfig {
  id: Domain;
  name: string;
  icon: string;
  count: number;
  frameworks: Framework[];
}
