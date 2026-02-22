// User Types
export interface User {
  message: string
  id: string
  email: string
  name: string
  role: 'candidate' | 'company' | 'admin'
  isVerified: boolean
  requiresProfile: boolean
}
export interface AppUser {
  id: string
  email: string
  name: string
  role: 'candidate' | 'company' | 'admin'
  status: string
}


export interface Candidate extends User {
  role: 'candidate'
  skills: Skill[]
  profileImage?: string
  bio?: string
  experience?: string
  education?: string
  feedbackHistory: Feedback[]
}

export interface Company extends User {
  role: 'company'
  companyName: string
  industry: string
  location: string
  description?: string
  logo?: string
  postedJobs: Job[]
}

// Skill Types
export interface Skill {
  id?: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  yearsOfExperience?: number
  endorsements?: number
}

// Interview Types
export interface Interview {
  id: string
  candidateId: string
  jobId?: string
  companyId?: string
  startTime: string
  endTime?: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  questions: Question[]
  responses: Response[]
  recordingUrl?: string
  feedback?: Feedback
}

export interface Question {
  id: string
  text: string
  type: 'text' | 'video'
  difficulty: 'easy' | 'medium' | 'hard'
  skillTags: string[]
}

export interface Response {
  questionId: string
  answer: string
  submittedAt: string
  score?: number
}

// Job Types
export interface Job {
  id: string
  companyId: string
  title: string
  description: string
  requiredSkills: string[]
  location: string
  salaryRange?: {
    min: number
    max: number
  }
  postedDate: string
  deadline: string
  status: 'open' | 'closed'
  applicants: JobApplication[]
}

export interface JobApplication {
  id: string
  jobId: string
  candidateId: string
  appliedDate: string
  status: 'applied' | 'shortlisted' | 'rejected' | 'accepted'
  interviewScheduled?: string
}

// Feedback Types
export interface Feedback {
  id: string
  interviewId: string
  candidateId: string
  companyId?: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  learningPath?: LearningPath
  createdAt: string
}

export interface LearningPath {
  id: string
  candidateId: string
  skills: SkillLearning[]
  estimatedDuration: number // in days
  resources: Resource[]
}

export interface SkillLearning {
  skillName: string
  currentLevel: string
  targetLevel: string
  progress: number // 0-100
}

export interface Resource {
  id: string
  title: string
  type: 'video' | 'article' | 'course' | 'practice'
  url: string
  duration?: number
}

// Dashboard Types
export interface DashboardStats {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  skillsCount: number
  lastInterviewDate?: string
}

export interface CompanyDashboardStats {
  totalJobsPosted: number
  totalApplicants: number
  interviewsScheduled: number
  averageTimeToHire: number
}
