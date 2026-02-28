export interface Feedback {
  id: number;
  user: string;
  rating: number;
  comment: string;
}

export interface Material {
  id: number;
  title: string;
  type: string;
  is_required: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  objectives: string;
  prerequisites: string;
  duration_hours: number;
  trainer: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  thumbnail_url: string;
  passing_score: number;
  max_attempts: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  created_at: string;
  materials: Material[];
  feedbacks: Feedback[];
}

export const mockCourses: Course[] = [
  {
    id: 1,
    code: "ITM-001",
    name: "Introduction to Information Security",
    description:
      "Learn the fundamentals of information security, including threats, vulnerabilities, and protection mechanisms.",
    objectives:
      "Understand cybersecurity basics, identify threats, apply best practices.",
    prerequisites: "Basic computer knowledge",
    duration_hours: 12,
    trainer: "John Smith",
    category: "IT",
    level: "BEGINNER",
    thumbnail_url: "https://via.placeholder.com/600x300",
    passing_score: 70,
    max_attempts: 3,
    status: "ACTIVE",
    created_at: "2026-01-10",

    // ✅ FIXED
    materials: [
      {
        id: 1,
        title: "Security Basics PDF",
        type: "PDF",
        is_required: true,
      },
      {
        id: 2,
        title: "Threat Overview Video",
        type: "VIDEO",
        is_required: true,
      },
      {
        id: 3,
        title: "Extra Reading Document",
        type: "DOCUMENT",
        is_required: false,
      },
    ],

    feedbacks: [
      {
        id: 1,
        user: "Alice",
        rating: 5,
        comment: "Very clear and beginner friendly!",
      },
      {
        id: 2,
        user: "Bob",
        rating: 4,
        comment: "Good course but needs more examples.",
      },
    ],
  },

  {
    id: 2,
    code: "HR-101",
    name: "Workplace Ethics & Compliance",
    description:
      "Understand company ethics, compliance rules, and professional workplace behavior.",
    objectives:
      "Learn corporate policies, prevent misconduct, promote integrity.",
    prerequisites: "None",
    duration_hours: 8,
    trainer: "Sarah Johnson",
    category: "HR",
    level: "INTERMEDIATE",
    thumbnail_url: "https://via.placeholder.com/600x300",
    passing_score: 75,
    max_attempts: 2,
    status: "ACTIVE",
    created_at: "2026-01-15",

    // ✅ FIXED
    materials: [
      {
        id: 4,
        title: "Company Ethics Handbook",
        type: "PDF",
        is_required: true,
      },
      {
        id: 5,
        title: "Compliance Training Video",
        type: "VIDEO",
        is_required: true,
      },
    ],

    feedbacks: [
      {
        id: 3,
        user: "David",
        rating: 4,
        comment: "Very informative.",
      },
    ],
  },

  {
    id: 3,
    code: "MGT-201",
    name: "Leadership Development",
    description:
      "Develop leadership skills, decision-making ability, and team management strategies.",
    objectives:
      "Improve communication, strategic thinking, and leadership mindset.",
    prerequisites: "Basic management experience",
    duration_hours: 15,
    trainer: "David Lee",
    category: "Management",
    level: "ADVANCED",
    thumbnail_url: "https://via.placeholder.com/600x300",
    passing_score: 80,
    max_attempts: 3,
    status: "DRAFT",
    created_at: "2026-01-20",

    // ✅ FIXED
    materials: [],

    feedbacks: [],
  },
];