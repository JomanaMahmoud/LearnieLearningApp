import type { Loc } from "../data";

export type TeacherRoute = "dashboard" | "submissions" | "students" | "insights" | "messages";
export type SubmissionStatus = "ocr" | "grading" | "confirm" | "finalized" | "reupload";
export type SupportState = "pending" | "confirmed" | "resolved";

export type TeacherStudent = {
  id: string;
  name: string;
  initials: string;
  average: number;
  previous: number;
  trend: number;
  mastery: number;
  quizzes: number;
  feedbackRead: boolean;
  support: SupportState | "none";
  focus: Loc;
  misconception?: Loc;
  lastSeen: string;
};

export type TeacherSubmission = {
  id: string;
  studentId: string;
  student: string;
  exam: string;
  subject: "Math" | "English" | "Science";
  language: "English" | "Deutsch";
  submitted: string;
  status: SubmissionStatus;
  progress: number;
  urgent?: boolean;
  confidence: number;
  score?: number;
};

export type ReviewQuestion = {
  n: number;
  prompt: string;
  scan: string;
  extracted: string;
  original: string;
  confidence: number;
  proposed: number;
  max: number;
  feedback: string;
  reason: string;
  misconception?: string;
};

export type ConceptInsight = {
  id: string;
  name: Loc;
  affected: number;
  share: number;
  trend: number;
  severity: "High" | "Medium" | "Low";
  questions: number;
  reflection: string;
  students: string[];
};

export const TEACHER_STUDENTS: TeacherStudent[] = [
  {
    id: "sara",
    name: "Sara M.",
    initials: "SM",
    average: 68,
    previous: 76,
    trend: -8,
    mastery: 54,
    quizzes: 2,
    feedbackRead: false,
    support: "pending",
    focus: { en: "Comparing fractions", de: "Brüche vergleichen" },
    misconception: {
      en: "Uses the larger denominator as the larger fraction",
      de: "Hält den größeren Nenner für den größeren Bruch",
    },
    lastSeen: "Today, 08:12",
  },
  {
    id: "omar",
    name: "Omar K.",
    initials: "OK",
    average: 82,
    previous: 75,
    trend: 7,
    mastery: 67,
    quizzes: 4,
    feedbackRead: true,
    support: "confirmed",
    focus: { en: "Numerator vs denominator", de: "Zähler und Nenner" },
    misconception: {
      en: "Looks at only one part of the fraction",
      de: "Betrachtet nur einen Teil des Bruchs",
    },
    lastSeen: "Today, 07:45",
  },
  {
    id: "lina",
    name: "Lina A.",
    initials: "LA",
    average: 91,
    previous: 88,
    trend: 3,
    mastery: 92,
    quizzes: 5,
    feedbackRead: true,
    support: "none",
    focus: { en: "Equivalent fractions", de: "Gleichwertige Brüche" },
    lastSeen: "Yesterday",
  },
  {
    id: "adam",
    name: "Adam H.",
    initials: "AH",
    average: 73,
    previous: 71,
    trend: 2,
    mastery: 64,
    quizzes: 1,
    feedbackRead: false,
    support: "pending",
    focus: { en: "Different denominators", de: "Verschiedene Nenner" },
    misconception: {
      en: "Adds denominators when adding fractions",
      de: "Addiert Nenner beim Addieren von Brüchen",
    },
    lastSeen: "Yesterday",
  },
  {
    id: "mia",
    name: "Mia R.",
    initials: "MR",
    average: 87,
    previous: 84,
    trend: 3,
    mastery: 86,
    quizzes: 3,
    feedbackRead: true,
    support: "none",
    focus: { en: "Word problems", de: "Sachaufgaben" },
    lastSeen: "Mon, 15:22",
  },
  {
    id: "jonas",
    name: "Jonas B.",
    initials: "JB",
    average: 64,
    previous: 70,
    trend: -6,
    mastery: 49,
    quizzes: 0,
    feedbackRead: false,
    support: "confirmed",
    focus: { en: "Multiplication facts", de: "Einmaleins" },
    misconception: {
      en: "Counts groups inconsistently",
      de: "Zählt Gruppen nicht gleichmäßig",
    },
    lastSeen: "Mon, 14:50",
  },
  {
    id: "noah",
    name: "Noah S.",
    initials: "NS",
    average: 79,
    previous: 78,
    trend: 1,
    mastery: 77,
    quizzes: 3,
    feedbackRead: true,
    support: "none",
    focus: { en: "Fraction number lines", de: "Brüche am Zahlenstrahl" },
    lastSeen: "Fri, 13:10",
  },
  {
    id: "emilia",
    name: "Emilia T.",
    initials: "ET",
    average: 85,
    previous: 82,
    trend: 3,
    mastery: 81,
    quizzes: 4,
    feedbackRead: true,
    support: "resolved",
    focus: { en: "Past tense verbs", de: "Verben in der Vergangenheit" },
    lastSeen: "Fri, 12:55",
  },
];

export const TEACHER_SUBMISSIONS: TeacherSubmission[] = [
  {
    id: "sub-sara",
    studentId: "sara",
    student: "Sara M.",
    exam: "Math Exam 1",
    subject: "Math",
    language: "English",
    submitted: "Today, 08:12",
    status: "ocr",
    progress: 25,
    urgent: true,
    confidence: 82,
  },
  {
    id: "sub-omar",
    studentId: "omar",
    student: "Omar K.",
    exam: "Math Exam 1",
    subject: "Math",
    language: "English",
    submitted: "Today, 07:45",
    status: "grading",
    progress: 56,
    confidence: 94,
  },
  {
    id: "sub-adam",
    studentId: "adam",
    student: "Adam H.",
    exam: "Math Exam 1",
    subject: "Math",
    language: "English",
    submitted: "Yesterday, 16:03",
    status: "confirm",
    progress: 82,
    confidence: 91,
    score: 74,
  },
  {
    id: "sub-lina",
    studentId: "lina",
    student: "Lina A.",
    exam: "Science: Plants",
    subject: "Science",
    language: "English",
    submitted: "Yesterday, 14:38",
    status: "finalized",
    progress: 100,
    confidence: 97,
    score: 93,
  },
  {
    id: "sub-jonas",
    studentId: "jonas",
    student: "Jonas B.",
    exam: "Math Exam 1",
    subject: "Math",
    language: "English",
    submitted: "Yesterday, 13:08",
    status: "reupload",
    progress: 8,
    confidence: 41,
    urgent: true,
  },
  {
    id: "sub-mia",
    studentId: "mia",
    student: "Mia R.",
    exam: "English Test",
    subject: "English",
    language: "English",
    submitted: "Mon, 15:22",
    status: "finalized",
    progress: 100,
    confidence: 96,
    score: 88,
  },
];

export const REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    n: 1,
    prompt: "Which fraction is larger: 2/5 or 3/5?",
    scan: "2/5 is larger than 3/5",
    extracted: "2/5 is larger than 3/5",
    original: "2/5 is larger than 3/5",
    confidence: 97,
    proposed: 0,
    max: 2,
    feedback: "Both fractions have 5 parts. Compare the numerators: 3 is greater than 2.",
    reason: "The student selected the fraction with the smaller numerator.",
    misconception: "Confuses numerator and denominator when comparing fractions.",
  },
  {
    n: 2,
    prompt: "Write one half as a fraction.",
    scan: "1/2",
    extracted: "1/2",
    original: "1/2",
    confidence: 99,
    proposed: 2,
    max: 2,
    feedback: "Correct. One part out of two is 1/2.",
    reason: "The answer matches the expected fraction.",
  },
  {
    n: 3,
    prompt: "4 × 7 = ?",
    scan: "28",
    extracted: "28",
    original: "28",
    confidence: 99,
    proposed: 2,
    max: 2,
    feedback: "Correct.",
    reason: "The multiplication fact is correct.",
  },
  {
    n: 4,
    prompt: "Which fraction is larger: 1/4 or 3/4?",
    scan: "1/4",
    extracted: "1/4",
    original: "1/4",
    confidence: 94,
    proposed: 0,
    max: 2,
    feedback: "The denominators are the same. 3/4 is larger because 3 is greater than 1.",
    reason: "The student again selected the smaller numerator.",
    misconception: "Confuses numerator and denominator when comparing fractions.",
  },
  {
    n: 5,
    prompt: "6 × 8 = ?",
    scan: "46",
    extracted: "4G",
    original: "4G",
    confidence: 58,
    proposed: 1,
    max: 2,
    feedback: "The method is close. 6 × 8 = 48.",
    reason: "Low OCR confidence. The scan appears to show 46, not 4G.",
  },
];

const REVIEW_VARIANTS: Record<string, Partial<ReviewQuestion>[]> = {
  sara: [
    {},
    {},
    {},
    {},
    {},
  ],
  omar: [
    {
      scan: "3/5 is larger",
      extracted: "3/5 is larger",
      original: "3/5 is larger",
      confidence: 98,
      proposed: 2,
      feedback: "Correct. Both fractions have the same denominator, and 3 is greater than 2.",
      reason: "The student correctly compared the numerators.",
      misconception: undefined,
    },
    {},
    {
      scan: "28",
      extracted: "28",
      original: "28",
      proposed: 2,
      feedback: "Correct.",
      reason: "The multiplication fact is correct.",
    },
    {
      scan: "3/4",
      extracted: "3/4",
      original: "3/4",
      confidence: 98,
      proposed: 2,
      feedback: "Correct. Three fourths is larger than one fourth.",
      reason: "The student correctly compared the numerators.",
      misconception: undefined,
    },
    {
      scan: "48",
      extracted: "48",
      original: "48",
      confidence: 96,
      proposed: 2,
      feedback: "Correct.",
      reason: "The multiplication fact is correct.",
    },
  ],
  adam: [
    {
      scan: "3/5",
      extracted: "3/5",
      original: "3/5",
      confidence: 98,
      proposed: 2,
      feedback: "Correct. You compared the numerators carefully.",
      reason: "The student selected the larger numerator.",
      misconception: undefined,
    },
    {
      scan: "2/1",
      extracted: "2/1",
      original: "2/1",
      confidence: 93,
      proposed: 0,
      feedback: "One half is written 1/2. The number of selected parts goes on top.",
      reason: "The numerator and denominator are reversed.",
      misconception: "Reverses numerator and denominator when writing fractions.",
    },
    {
      scan: "24",
      extracted: "24",
      original: "24",
      confidence: 97,
      proposed: 0,
      feedback: "4 × 7 = 28. Try counting four groups of seven.",
      reason: "The student may have recalled 4 × 6 instead.",
    },
    {
      scan: "3/4",
      extracted: "3/4",
      original: "3/4",
      confidence: 96,
      proposed: 2,
      feedback: "Correct.",
      reason: "The fraction comparison is correct.",
      misconception: undefined,
    },
    {
      scan: "48",
      extracted: "4B",
      original: "4B",
      confidence: 55,
      proposed: 2,
      feedback: "Correct. The scan appears to show 48.",
      reason: "Low OCR confidence: the final digit was recognized as B.",
    },
  ],
  lina: [
    {
      scan: "3/5 because 3 > 2",
      extracted: "3/5 because 3 > 2",
      original: "3/5 because 3 > 2",
      confidence: 97,
      proposed: 2,
      feedback: "Correct, with a clear explanation.",
      reason: "The student correctly compared the numerators and explained the choice.",
      misconception: undefined,
    },
    {},
    {},
    {
      scan: "3/4 because they have the same denominator",
      extracted: "3/4 because they have the same denominator",
      original: "3/4 because they have the same denominator",
      confidence: 95,
      proposed: 2,
      feedback: "Correct. This explanation shows strong understanding.",
      reason: "The student used the shared denominator correctly.",
      misconception: undefined,
    },
    {
      scan: "48",
      extracted: "48",
      original: "48",
      confidence: 99,
      proposed: 2,
      feedback: "Correct.",
      reason: "The multiplication fact is correct.",
    },
  ],
  jonas: [
    {
      scan: "2/5",
      extracted: "2/5",
      original: "2/5",
      confidence: 94,
      proposed: 0,
      feedback: "Both denominators are 5. Compare 2 and 3 on top.",
      reason: "The student selected the smaller numerator.",
      misconception: "Chooses the first fraction instead of comparing both numerators.",
    },
    {
      scan: "",
      extracted: "",
      original: "",
      confidence: 100,
      proposed: 0,
      feedback: "No answer was given. One half is 1/2.",
      reason: "The answer is blank.",
    },
    {
      scan: "21",
      extracted: "21",
      original: "21",
      confidence: 92,
      proposed: 0,
      feedback: "4 × 7 = 28. You may have used 3 × 7.",
      reason: "The response matches 3 × 7 rather than 4 × 7.",
    },
    {
      scan: "1/4",
      extracted: "1/4",
      original: "1/4",
      confidence: 91,
      proposed: 0,
      feedback: "Three fourths is larger because 3 is greater than 1.",
      reason: "The student selected the smaller numerator again.",
      misconception: "Chooses the first fraction instead of comparing both numerators.",
    },
    {
      scan: "46",
      extracted: "46",
      original: "46",
      confidence: 89,
      proposed: 1,
      feedback: "Close. 6 × 8 = 48.",
      reason: "The student is two away from the correct product.",
    },
  ],
  mia: [
    {
      scan: "3/5",
      extracted: "3/5",
      original: "3/5",
      confidence: 97,
      proposed: 2,
      feedback: "Correct.",
      reason: "The comparison is correct.",
      misconception: undefined,
    },
    {},
    {
      scan: "28",
      extracted: "28",
      original: "28",
      confidence: 99,
      proposed: 2,
      feedback: "Correct.",
      reason: "The multiplication fact is correct.",
    },
    {
      scan: "3/4",
      extracted: "3/4",
      original: "3/4",
      confidence: 96,
      proposed: 2,
      feedback: "Correct.",
      reason: "The comparison is correct.",
      misconception: undefined,
    },
    {
      scan: "48",
      extracted: "48",
      original: "48",
      confidence: 99,
      proposed: 2,
      feedback: "Correct.",
      reason: "The multiplication fact is correct.",
    },
  ],
};

export function reviewQuestionsFor(studentId: string): ReviewQuestion[] {
  const overrides = REVIEW_VARIANTS[studentId] ?? REVIEW_VARIANTS.sara;
  return REVIEW_QUESTIONS.map((question, index) => ({
    ...question,
    ...overrides[index],
  }));
}

export const CONCEPTS: ConceptInsight[] = [
  {
    id: "num-den",
    name: { en: "Numerator vs denominator", de: "Zähler und Nenner" },
    affected: 7,
    share: 29,
    trend: 5,
    severity: "High",
    questions: 14,
    reflection: "4 students said they forgot the rule",
    students: ["Sara M.", "Omar K.", "Adam H.", "Jonas B.", "Mila P.", "Leo W.", "Amir D."],
  },
  {
    id: "different-den",
    name: { en: "Different denominators", de: "Verschiedene Nenner" },
    affected: 4,
    share: 17,
    trend: -3,
    severity: "Medium",
    questions: 8,
    reflection: "2 students said they were unsure",
    students: ["Adam H.", "Jonas B.", "Mila P.", "Amir D."],
  },
  {
    id: "equivalent",
    name: { en: "Equivalent fractions", de: "Gleichwertige Brüche" },
    affected: 3,
    share: 13,
    trend: -6,
    severity: "Low",
    questions: 6,
    reflection: "Practice scores improved by 11%",
    students: ["Sara M.", "Noah S.", "Leo W."],
  },
  {
    id: "word-problems",
    name: { en: "Fraction word problems", de: "Bruch-Sachaufgaben" },
    affected: 5,
    share: 21,
    trend: 2,
    severity: "Medium",
    questions: 9,
    reflection: "3 students did not understand the question",
    students: ["Sara M.", "Omar K.", "Adam H.", "Jonas B.", "Noah S."],
  },
];

export const ACTIVITY = [
  { time: "08:12", text: "Sara M. submitted Math Exam 1", tone: "sky" },
  { time: "08:04", text: "Omar K. completed Comparing fractions", tone: "mint" },
  { time: "07:52", text: "AI grading finished for Omar K.", tone: "grape" },
  { time: "Yesterday", text: "Lina A. read your feedback", tone: "sun" },
];
