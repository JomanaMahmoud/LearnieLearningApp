export type Lang = 'en' | 'de'
export type Loc = { en: string; de: string }
export type Subject = 'math' | 'english' | 'science' | 'german'
export type TopicId = 'fractions' | 'times' | 'pastTense' | 'plants'

export const SUBJECTS: Record<Subject, { name: Loc; tone: Tone }> = {
  math: { name: { en: 'Math', de: 'Mathe' }, tone: 'sky' },
  english: { name: { en: 'English', de: 'Englisch' }, tone: 'coral' },
  science: { name: { en: 'Science', de: 'Sachkunde' }, tone: 'mint' },
  german: { name: { en: 'German', de: 'Deutsch' }, tone: 'sun' },
}

export type Tone = 'sky' | 'mint' | 'sun' | 'coral' | 'grape'

export const TOPICS: Record<TopicId, { name: Loc; subject: Subject; mastery: number }> = {
  fractions: { name: { en: 'Fractions', de: 'Brüche' }, subject: 'math', mastery: 67 },
  times: { name: { en: 'Times tables', de: 'Einmaleins' }, subject: 'math', mastery: 84 },
  pastTense: { name: { en: 'Past tense verbs', de: 'Verben in der Vergangenheit' }, subject: 'english', mastery: 78 },
  plants: { name: { en: 'How plants grow', de: 'Wie Pflanzen wachsen' }, subject: 'science', mastery: 90 },
}

/* ---------------- Exam sessions (uploads) ---------------- */

export type SessionStatus = 'open' | 'uploaded' | 'checking' | 'results' | 'reupload'
export type Page = { id: string; url: string; name: string }
export type ExamSession = {
  id: string
  subject: Subject
  title: Loc
  examLang: Lang
  due: string
  status: SessionStatus
  pages: Page[]
  submittedAt?: string
  reuploadReason?: Loc
  examId?: string
}

/* ---------------- Confirmed exam results ---------------- */

export type ExamQuestion = {
  n: number
  prompt: Loc
  studentAnswer: string
  correctAnswer: string
  mark: number
  max: number
  topic: TopicId
  feedback: Loc
  misconceptionId?: string
}

export type Misconception = {
  id: string
  topic: TopicId
  title: Loc
  explanation: Loc
  example: { a: [number, number]; b: [number, number]; caption: Loc }
  teacherNote: Loc
  questions: number[]
}

export type Exam = {
  id: string
  subject: Subject
  title: Loc
  date: string
  status: 'confirmed' | 'checking'
  teacher: string
  questions: ExamQuestion[]
  overall: Loc
  teacherComment: Loc
  weaknesses: { topic: TopicId; level: 1 | 2 | 3; questions: number[] }[]
  misconceptions: Misconception[]
  support?: { topic: TopicId; comment: Loc; resolved: boolean }
  corrected?: Loc
}

export function examScore(e: Exam) {
  const got = e.questions.reduce((s, q) => s + q.mark, 0)
  const max = e.questions.reduce((s, q) => s + q.max, 0)
  return { got, max, pct: max ? Math.round((got / max) * 100) : 0 }
}

export function starsFor(pct: number) {
  return pct >= 90 ? 3 : pct >= 60 ? 2 : pct > 0 ? 1 : 0
}

const fracMisconception: Misconception = {
  id: 'm-frac-denom',
  topic: 'fractions',
  title: {
    en: 'A bigger bottom number does not always mean a bigger fraction',
    de: 'Eine größere Zahl unten heißt nicht immer: größerer Bruch',
  },
  explanation: {
    en: 'The bottom number (denominator) tells how many parts the whole is cut into. The top number (numerator) tells how many parts you have. When the bottom numbers are the same, look at the top: more parts means more.',
    de: 'Die Zahl unten (Nenner) sagt, in wie viele Teile das Ganze geteilt ist. Die Zahl oben (Zähler) sagt, wie viele Teile du hast. Wenn unten die gleiche Zahl steht, schau nach oben: Mehr Teile heißt mehr.',
  },
  example: {
    a: [2, 5],
    b: [3, 5],
    caption: {
      en: 'Both are cut into 5 parts. 3 parts is more than 2 parts, so 3/5 is larger.',
      de: 'Beide sind in 5 Teile geteilt. 3 Teile sind mehr als 2 Teile, also ist 3/5 größer.',
    },
  },
  teacherNote: {
    en: 'Omar, try drawing the fraction bars when you compare. You already know the parts!',
    de: 'Omar, zeichne die Bruchstreifen, wenn du vergleichst. Die Teile kennst du schon!',
  },
  questions: [1, 4],
}

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'e-math-1',
    subject: 'math',
    title: { en: 'Math Exam 1: Fractions', de: 'Mathe-Arbeit 1: Brüche' },
    date: '2026-10-09',
    status: 'confirmed',
    teacher: 'Ms. Weber',
    questions: [
      {
        n: 1,
        prompt: { en: 'Which is larger: 2/5 or 3/5?', de: 'Was ist größer: 2/5 oder 3/5?' },
        studentAnswer: '2/5 is larger',
        correctAnswer: '3/5',
        mark: 0,
        max: 2,
        topic: 'fractions',
        feedback: {
          en: 'Both fractions have 5 parts. 3 parts is more than 2 parts, so 3/5 is larger.',
          de: 'Beide Brüche haben 5 Teile. 3 Teile sind mehr als 2, also ist 3/5 größer.',
        },
        misconceptionId: 'm-frac-denom',
      },
      {
        n: 2,
        prompt: { en: 'Write one half as a fraction.', de: 'Schreibe ein Halb als Bruch.' },
        studentAnswer: '1/2',
        correctAnswer: '1/2',
        mark: 2,
        max: 2,
        topic: 'fractions',
        feedback: { en: 'Perfect! One part out of two.', de: 'Super! Ein Teil von zwei.' },
      },
      {
        n: 3,
        prompt: { en: '4 × 7 = ?', de: '4 × 7 = ?' },
        studentAnswer: '28',
        correctAnswer: '28',
        mark: 2,
        max: 2,
        topic: 'times',
        feedback: { en: 'Correct. Great times tables!', de: 'Richtig. Tolles Einmaleins!' },
      },
      {
        n: 4,
        prompt: { en: 'Which is larger: 1/4 or 3/4?', de: 'Was ist größer: 1/4 oder 3/4?' },
        studentAnswer: '1/4',
        correctAnswer: '3/4',
        mark: 0,
        max: 2,
        topic: 'fractions',
        feedback: {
          en: 'Same bottom number (4). Look at the top: 3 is more than 1, so 3/4 is larger.',
          de: 'Gleiche Zahl unten (4). Schau oben: 3 ist mehr als 1, also ist 3/4 größer.',
        },
        misconceptionId: 'm-frac-denom',
      },
      {
        n: 5,
        prompt: { en: 'Colour 2/3 of the shape.', de: 'Male 2/3 der Form an.' },
        studentAnswer: '2 of 3 parts coloured',
        correctAnswer: '2 of 3 parts',
        mark: 2,
        max: 2,
        topic: 'fractions',
        feedback: { en: 'Well done. You coloured 2 of the 3 parts.', de: 'Gut gemacht. Du hast 2 von 3 Teilen angemalt.' },
      },
      {
        n: 6,
        prompt: { en: '6 × 8 = ?', de: '6 × 8 = ?' },
        studentAnswer: '46',
        correctAnswer: '48',
        mark: 1,
        max: 2,
        topic: 'times',
        feedback: {
          en: 'So close! Your steps were right. 6 × 8 = 48. Tip: 5 × 8 = 40, then add one more 8.',
          de: 'Ganz knapp! Dein Weg war richtig. 6 × 8 = 48. Tipp: 5 × 8 = 40, dann noch eine 8 dazu.',
        },
      },
      {
        n: 7,
        prompt: { en: '1/2 + 1/2 = ?', de: '1/2 + 1/2 = ?' },
        studentAnswer: '1',
        correctAnswer: '1',
        mark: 2,
        max: 2,
        topic: 'fractions',
        feedback: { en: 'Yes! Two halves make one whole.', de: 'Ja! Zwei Hälften ergeben ein Ganzes.' },
      },
      {
        n: 8,
        prompt: { en: '9 × 3 = ?', de: '9 × 3 = ?' },
        studentAnswer: '27',
        correctAnswer: '27',
        mark: 2,
        max: 2,
        topic: 'times',
        feedback: { en: 'Correct!', de: 'Richtig!' },
      },
    ],
    overall: {
      en: 'You did really well with halves and times tables. Comparing fractions is the next thing to practise.',
      de: 'Mit Hälften und dem Einmaleins warst du richtig gut. Als Nächstes üben wir, Brüche zu vergleichen.',
    },
    teacherComment: {
      en: 'Great effort, Omar! I can see you are working hard. Let’s practise comparing fractions together.',
      de: 'Toll gemacht, Omar! Ich sehe, wie fleißig du bist. Lass uns zusammen Brüche vergleichen üben.',
    },
    weaknesses: [
      { topic: 'fractions', level: 1, questions: [1, 4] },
      { topic: 'times', level: 2, questions: [6] },
    ],
    misconceptions: [fracMisconception],
    support: {
      topic: 'fractions',
      comment: {
        en: 'You can do this! A few short quizzes will help a lot. I am here if you need me.',
        de: 'Du schaffst das! Ein paar kurze Quizze helfen sehr. Ich bin da, wenn du mich brauchst.',
      },
      resolved: false,
    },
  },
  {
    id: 'e-eng-1',
    subject: 'english',
    title: { en: 'English Test: Past tense', de: 'Englisch-Test: Vergangenheit' },
    date: '2026-09-25',
    status: 'confirmed',
    teacher: 'Mr. Klein',
    corrected: {
      en: 'Your teacher corrected question 3. It is now 2 of 2 points.',
      de: 'Deine Lehrkraft hat Frage 3 korrigiert. Jetzt sind es 2 von 2 Punkten.',
    },
    questions: [
      {
        n: 1,
        prompt: { en: 'Yesterday I ___ (play) football.', de: 'Yesterday I ___ (play) football.' },
        studentAnswer: 'played',
        correctAnswer: 'played',
        mark: 2,
        max: 2,
        topic: 'pastTense',
        feedback: { en: 'Correct! Add -ed to “play”.', de: 'Richtig! An „play“ hängt man -ed.' },
      },
      {
        n: 2,
        prompt: { en: 'We ___ (go) to the zoo.', de: 'We ___ (go) to the zoo.' },
        studentAnswer: 'goed',
        correctAnswer: 'went',
        mark: 1,
        max: 2,
        topic: 'pastTense',
        feedback: {
          en: '“Go” is a special verb. It changes to “went”. Good try using -ed!',
          de: '„Go“ ist ein besonderes Verb. Es wird zu „went“. Gut versucht mit -ed!',
        },
      },
      {
        n: 3,
        prompt: { en: 'She ___ (jump) high.', de: 'She ___ (jump) high.' },
        studentAnswer: 'jumped',
        correctAnswer: 'jumped',
        mark: 2,
        max: 2,
        topic: 'pastTense',
        feedback: { en: 'Correct!', de: 'Richtig!' },
      },
      {
        n: 4,
        prompt: { en: 'They ___ (eat) pizza.', de: 'They ___ (eat) pizza.' },
        studentAnswer: 'ate',
        correctAnswer: 'ate',
        mark: 2,
        max: 2,
        topic: 'pastTense',
        feedback: { en: 'Great! “Eat” becomes “ate”.', de: 'Super! Aus „eat“ wird „ate“.' },
      },
      {
        n: 5,
        prompt: { en: 'I ___ (see) a bird.', de: 'I ___ (see) a bird.' },
        studentAnswer: 'saw',
        correctAnswer: 'saw',
        mark: 2,
        max: 2,
        topic: 'pastTense',
        feedback: { en: 'Correct!', de: 'Richtig!' },
      },
    ],
    overall: {
      en: 'Lovely work with -ed verbs. Watch out for special verbs like “go → went”.',
      de: 'Prima Arbeit mit -ed-Verben. Achte auf besondere Verben wie „go → went“.',
    },
    teacherComment: { en: 'Your handwriting is getting so neat!', de: 'Deine Schrift wird immer ordentlicher!' },
    weaknesses: [{ topic: 'pastTense', level: 3, questions: [2] }],
    misconceptions: [],
    support: {
      topic: 'pastTense',
      comment: { en: 'You practised and it worked. Super job with -ed verbs!', de: 'Du hast geübt und es hat geklappt. Super mit den -ed-Verben!' },
      resolved: true,
    },
  },
  {
    id: 'e-math-0',
    subject: 'math',
    title: { en: 'Math Check: Numbers', de: 'Mathe-Test: Zahlen' },
    date: '2026-09-12',
    status: 'confirmed',
    teacher: 'Ms. Weber',
    questions: [
      { n: 1, prompt: { en: '3/8 or 5/8: which is larger?', de: '3/8 oder 5/8: Was ist größer?' }, studentAnswer: '3/8', correctAnswer: '5/8', mark: 0, max: 2, topic: 'fractions', feedback: { en: 'Same bottom number, so look at the top. 5 is more than 3.', de: 'Gleiche Zahl unten, also schau oben. 5 ist mehr als 3.' }, misconceptionId: 'm-frac-denom' },
      { n: 2, prompt: { en: '1/6 or 4/6: which is larger?', de: '1/6 oder 4/6: Was ist größer?' }, studentAnswer: '1/6', correctAnswer: '4/6', mark: 0, max: 2, topic: 'fractions', feedback: { en: '4 parts is more than 1 part.', de: '4 Teile sind mehr als 1 Teil.' }, misconceptionId: 'm-frac-denom' },
      { n: 3, prompt: { en: '2/7 or 6/7: which is larger?', de: '2/7 oder 6/7: Was ist größer?' }, studentAnswer: '2/7', correctAnswer: '6/7', mark: 0, max: 2, topic: 'fractions', feedback: { en: '6 parts is more than 2 parts.', de: '6 Teile sind mehr als 2 Teile.' }, misconceptionId: 'm-frac-denom' },
      { n: 4, prompt: { en: '5 × 5 = ?', de: '5 × 5 = ?' }, studentAnswer: '25', correctAnswer: '25', mark: 2, max: 2, topic: 'times', feedback: { en: 'Correct!', de: 'Richtig!' } },
      { n: 5, prompt: { en: '7 × 3 = ?', de: '7 × 3 = ?' }, studentAnswer: '21', correctAnswer: '21', mark: 2, max: 2, topic: 'times', feedback: { en: 'Correct!', de: 'Richtig!' } },
    ],
    overall: { en: 'Good start! Let’s keep practising fractions.', de: 'Guter Anfang! Wir üben weiter Brüche.' },
    teacherComment: { en: 'Nice and tidy work.', de: 'Schön ordentlich gearbeitet.' },
    weaknesses: [{ topic: 'fractions', level: 1, questions: [1, 2, 3] }],
    misconceptions: [{ ...fracMisconception, questions: [1, 2, 3] }],
  },
  {
    id: 'e-eng-0',
    subject: 'english',
    title: { en: 'English: Reading words', de: 'Englisch: Wörter lesen' },
    date: '2026-09-05',
    status: 'confirmed',
    teacher: 'Mr. Klein',
    questions: [
      { n: 1, prompt: { en: 'Read and match: “cat”', de: 'Lies und verbinde: „cat“' }, studentAnswer: 'cat', correctAnswer: 'cat', mark: 2, max: 2, topic: 'pastTense', feedback: { en: 'Correct!', de: 'Richtig!' } },
      { n: 2, prompt: { en: 'Yesterday I ___ (walk).', de: 'Yesterday I ___ (walk).' }, studentAnswer: 'walk', correctAnswer: 'walked', mark: 1, max: 2, topic: 'pastTense', feedback: { en: 'Add -ed for yesterday: walked.', de: 'Für gestern -ed anhängen: walked.' } },
      { n: 3, prompt: { en: 'Spell “house”', de: 'Buchstabiere „house“' }, studentAnswer: 'house', correctAnswer: 'house', mark: 2, max: 2, topic: 'pastTense', feedback: { en: 'Correct!', de: 'Richtig!' } },
    ],
    overall: { en: 'Well done!', de: 'Gut gemacht!' },
    teacherComment: { en: 'Keep reading every day!', de: 'Lies weiter jeden Tag!' },
    weaknesses: [],
    misconceptions: [],
  },
  {
    id: 'e-sci-1',
    subject: 'science',
    title: { en: 'Science Quiz: Plants', de: 'Sachkunde: Pflanzen' },
    date: '2026-10-11',
    status: 'checking',
    teacher: 'Ms. Weber',
    questions: [],
    overall: { en: '', de: '' },
    teacherComment: { en: '', de: '' },
    weaknesses: [],
    misconceptions: [],
  },
]

export const INITIAL_SESSIONS: ExamSession[] = [
  {
    id: 's-math-2',
    subject: 'math',
    title: { en: 'Math Exam 2: Fractions & times tables', de: 'Mathe-Arbeit 2: Brüche & Einmaleins' },
    examLang: 'en',
    due: '2026-10-16',
    status: 'open',
    pages: [],
  },
  {
    id: 's-de-1',
    subject: 'german',
    title: { en: 'German dictation', de: 'Diktat' },
    examLang: 'de',
    due: '2026-10-20',
    status: 'open',
    pages: [],
  },
  {
    id: 's-eng-2',
    subject: 'english',
    title: { en: 'English Reading Test', de: 'Englisch-Lesetest' },
    examLang: 'en',
    due: '2026-10-14',
    status: 'reupload',
    pages: [],
    reuploadReason: {
      en: 'Page 2 is too blurry for me to read. Please take the photo again in good light.',
      de: 'Seite 2 ist zu unscharf zum Lesen. Bitte mach das Foto noch einmal bei gutem Licht.',
    },
  },
  {
    id: 's-sci-1',
    subject: 'science',
    title: { en: 'Science Quiz: Plants', de: 'Sachkunde: Pflanzen' },
    examLang: 'en',
    due: '2026-10-11',
    status: 'checking',
    pages: [],
    submittedAt: '2026-10-11',
    examId: 'e-sci-1',
  },
  {
    id: 's-math-1',
    subject: 'math',
    title: { en: 'Math Exam 1: Fractions', de: 'Mathe-Arbeit 1: Brüche' },
    examLang: 'en',
    due: '2026-10-08',
    status: 'results',
    pages: [],
    submittedAt: '2026-10-08',
    examId: 'e-math-1',
  },
]

/* ---------------- Recurring mistakes ---------------- */

export const RECURRING = [
  {
    id: 'r-frac',
    topic: 'fractions' as TopicId,
    title: fracMisconception.title,
    points: [
      { label: { en: 'Math Check (Sep 12)', de: 'Mathe-Test (12. Sep.)' }, count: 3 },
      { label: { en: 'Math Exam 1 (Oct 9)', de: 'Mathe-Arbeit 1 (9. Okt.)' }, count: 2 },
      { label: { en: 'Practice quiz (Oct 10)', de: 'Übungsquiz (10. Okt.)' }, count: 1 },
    ],
  },
  {
    id: 'r-past',
    topic: 'pastTense' as TopicId,
    title: { en: 'Adding -ed to special verbs (go → goed)', de: '-ed an besondere Verben hängen (go → goed)' },
    points: [
      { label: { en: 'English (Sep 5)', de: 'Englisch (5. Sep.)' }, count: 1 },
      { label: { en: 'English Test (Sep 25)', de: 'Englisch-Test (25. Sep.)' }, count: 1 },
    ],
  },
]

/* ---------------- Quizzes ---------------- */

export type QuizQ = {
  id: string
  prompt: Loc
  kind: 'choice' | 'number' | 'fraction'
  options?: string[]
  answer: string
  explain: Loc
  bars?: { a: [number, number]; b: [number, number] }
}

export type Reason = 'understand' | 'rule' | 'calc' | 'unsure'

export type Attempt = {
  id: string
  date: string
  questions: QuizQ[]
  answers: (string | null)[]
  unsure: boolean[]
  score: number
  reflections?: (Reason | null)[]
  notes?: string[]
}

export type Quiz = {
  id: string
  topic: TopicId
  title: Loc
  reason: Loc
  count: number
  minutes: number
  status: 'ready' | 'later' | 'done'
  level: 1 | 2
  followUp?: boolean
  fromExam?: string
  attempts: Attempt[]
  isNew?: boolean
}

const rnd = (n: number) => Math.floor(Math.random() * n)
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
let uid = 0
export const newId = (p = 'id') => `${p}-${Date.now().toString(36)}-${(uid++).toString(36)}`

function fractionQ(level: 1 | 2): QuizQ {
  const type = rnd(level === 1 ? 3 : 4)
  const d = 3 + rnd(6)
  if (type === 0 || type === 3) {
    // same denominator compare
    let a = 1 + rnd(d - 1)
    let b = 1 + rnd(d - 1)
    while (b === a) b = 1 + rnd(d - 1)
    const big = Math.max(a, b)
    const small = Math.min(a, b)
    return {
      id: newId('q'),
      prompt: { en: 'Which fraction is larger?', de: 'Welcher Bruch ist größer?' },
      kind: 'choice',
      options: [`${a}/${d}`, `${b}/${d}`],
      answer: `${big}/${d}`,
      bars: { a: [a, d], b: [b, d] },
      explain: {
        en: `Both are cut into ${d} parts. ${big} parts is more than ${small} ${small === 1 ? 'part' : 'parts'}, so ${big}/${d} is larger.`,
        de: `Beide sind in ${d} Teile geteilt. ${big} Teile sind mehr als ${small} ${small === 1 ? 'Teil' : 'Teile'}, also ist ${big}/${d} größer.`,
      },
    }
  }
  if (type === 1) {
    const n = 1 + rnd(d - 1)
    return {
      id: newId('q'),
      prompt: { en: `In ${n}/${d}, which number is the numerator (top)?`, de: `Welche Zahl ist bei ${n}/${d} der Zähler (oben)?` },
      kind: 'choice',
      options: shuffle([`${n}`, `${d}`]),
      answer: `${n}`,
      explain: {
        en: `The numerator is the top number: ${n}. It tells how many parts you have.`,
        de: `Der Zähler ist die obere Zahl: ${n}. Er sagt, wie viele Teile du hast.`,
      },
    }
  }
  const a = 1 + rnd(Math.max(1, d - 2))
  const b = 1 + rnd(Math.max(1, d - a - 1))
  return {
    id: newId('q'),
    prompt: { en: `${a}/${d} + ${b}/${d} = ?`, de: `${a}/${d} + ${b}/${d} = ?` },
    kind: 'fraction',
    answer: `${a + b}/${d}`,
    explain: {
      en: `The bottom stays ${d}. Add the tops: ${a} + ${b} = ${a + b}. So the answer is ${a + b}/${d}.`,
      de: `Unten bleibt ${d}. Oben addieren: ${a} + ${b} = ${a + b}. Also ist die Antwort ${a + b}/${d}.`,
    },
  }
}

function timesQ(): QuizQ {
  const a = 3 + rnd(7)
  const b = 2 + rnd(8)
  const c = a * b
  return {
    id: newId('q'),
    prompt: { en: `${a} × ${b} = ?`, de: `${a} × ${b} = ?` },
    kind: 'number',
    answer: `${c}`,
    explain: {
      en: `${a} × ${b} means ${a} groups of ${b}. ${a - 1} × ${b} = ${c - b}, plus one more ${b} is ${c}.`,
      de: `${a} × ${b} heißt ${a} Gruppen mit ${b}. ${a - 1} × ${b} = ${c - b}, plus noch ${b} ergibt ${c}.`,
    },
  }
}

const VERBS: [string, string, string[], boolean][] = [
  ['go', 'went', ['goed', 'wented'], true],
  ['eat', 'ate', ['eated', 'eaten'], true],
  ['see', 'saw', ['seed', 'sawed'], true],
  ['play', 'played', ['plaied', 'plays'], false],
  ['run', 'ran', ['runned', 'runed'], true],
  ['have', 'had', ['haved', 'has'], true],
  ['swim', 'swam', ['swimmed', 'swims'], true],
  ['jump', 'jumped', ['jumpt', 'jumps'], false],
  ['write', 'wrote', ['writed', 'writes'], true],
  ['walk', 'walked', ['walkt', 'walks'], false],
  ['take', 'took', ['taked', 'tooked'], true],
]

function pastTenseQs(count: number): QuizQ[] {
  return shuffle(VERBS)
    .slice(0, count)
    .map(([base, past, wrong, special]) => ({
      id: newId('q'),
      prompt: { en: `Yesterday I ___ (${base}).`, de: `Yesterday I ___ (${base}).` },
      kind: 'choice' as const,
      options: shuffle([past, ...wrong]),
      answer: past,
      explain: special
        ? {
            en: `“${base}” is a special verb. It changes to “${past}”.`,
            de: `„${base}“ ist ein besonderes Verb. Es wird zu „${past}“.`,
          }
        : { en: `Add -ed: ${base} → ${past}.`, de: `Hänge -ed an: ${base} → ${past}.` },
    }))
}

export function generateQuestions(topic: TopicId, count: number, level: 1 | 2 = 1): QuizQ[] {
  if (topic === 'pastTense') return pastTenseQs(count)
  if (topic === 'times') return Array.from({ length: count }, timesQ)
  return Array.from({ length: count }, () => fractionQ(level))
}

export function isCorrect(q: QuizQ, a: string | null) {
  if (a == null) return false
  return a.replace(/\s+/g, '').toLowerCase() === q.answer.replace(/\s+/g, '').toLowerCase()
}

/** Topic mastery: teacher-confirmed baseline, nudged by today's practice. */
export function topicMastery(topic: TopicId, quizzes: Quiz[]) {
  const base = TOPICS[topic].mastery
  const today = quizzes.filter((q) => q.topic === topic).flatMap((q) => q.attempts.filter((a) => a.date === TODAY))
  if (!today.length) return base
  const avg = today.reduce((s, a) => s + a.score / a.questions.length, 0) / today.length
  return Math.round(base * 0.7 + avg * 100 * 0.3)
}

function pastAttempt(topic: TopicId, date: string, correct: number, count = 5): Attempt {
  const questions = generateQuestions(topic, count)
  const answers = questions.map((q, i) => (i < correct ? q.answer : (q.options?.find((o) => o !== q.answer) ?? '0')))
  return { id: newId('a'), date, questions, answers, unsure: questions.map(() => false), score: correct }
}

export function initialQuizzes(): Quiz[] {
  return [
    {
      id: 'qz-frac-1',
      topic: 'fractions',
      title: { en: 'Comparing fractions', de: 'Brüche vergleichen' },
      reason: { en: 'Made for you from Math Exam 1', de: 'Für dich gemacht aus Mathe-Arbeit 1' },
      count: 5,
      minutes: 5,
      status: 'ready',
      level: 1,
      fromExam: 'e-math-1',
      attempts: [],
      isNew: true,
    },
    {
      id: 'qz-times-1',
      topic: 'times',
      title: { en: 'Times tables 3 to 9', de: 'Einmaleins 3 bis 9' },
      reason: { en: 'Your teacher suggested this', de: 'Deine Lehrkraft schlägt das vor' },
      count: 5,
      minutes: 4,
      status: 'later',
      level: 1,
      fromExam: 'e-math-1',
      attempts: [],
    },
    {
      id: 'qz-past-1',
      topic: 'pastTense',
      title: { en: 'Special past tense verbs', de: 'Besondere Verben in der Vergangenheit' },
      reason: { en: 'Made for you from English Test', de: 'Für dich gemacht aus dem Englisch-Test' },
      count: 5,
      minutes: 4,
      status: 'done',
      level: 1,
      fromExam: 'e-eng-1',
      attempts: [pastAttempt('pastTense', '2026-09-28', 3), pastAttempt('pastTense', '2026-10-03', 4)],
    },
    {
      id: 'qz-frac-0',
      topic: 'fractions',
      title: { en: 'Fractions warm-up', de: 'Brüche zum Aufwärmen' },
      reason: { en: 'Made for you from Math Check', de: 'Für dich gemacht aus dem Mathe-Test' },
      count: 5,
      minutes: 5,
      status: 'done',
      level: 1,
      fromExam: 'e-math-0',
      attempts: [pastAttempt('fractions', '2026-10-10', 3)],
    },
  ]
}

/* ---------------- Notifications ---------------- */

export type NoteType =
  | 'submission'
  | 'results'
  | 'feedback'
  | 'weakness'
  | 'support'
  | 'recommendation'
  | 'quiz'
  | 'reupload'
  | 'corrected'
  | 'message'

export type Route =
  | { name: 'home' }
  | { name: 'upload'; sessionId?: string }
  | { name: 'results'; examId?: string; tab?: 'questions' | 'topics' | 'why'; q?: number }
  | { name: 'progress' }
  | { name: 'practice' }
  | { name: 'quiz'; quizId: string; attemptId?: string }
  | { name: 'achievements' }
  | { name: 'notifications' }
  | { name: 'settings' }

export type Note = {
  id: string
  type: NoteType
  title: Loc
  body: Loc
  date: string
  read: boolean
  target?: Route
  from?: string
  reply?: string
}

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    type: 'results',
    title: { en: 'Your Math Exam 1 results are ready', de: 'Deine Ergebnisse für Mathe-Arbeit 1 sind da' },
    body: { en: 'Ms. Weber checked your exam. Come and see!', de: 'Frau Weber hat deine Arbeit angeschaut. Schau mal!' },
    date: '2026-10-12T08:10',
    read: false,
    target: { name: 'results', examId: 'e-math-1' },
  },
  {
    id: 'n2',
    type: 'reupload',
    title: { en: 'Please take a new photo of page 2', de: 'Bitte mach ein neues Foto von Seite 2' },
    body: { en: 'English Reading Test: the photo is blurry.', de: 'Englisch-Lesetest: Das Foto ist unscharf.' },
    date: '2026-10-12T07:40',
    read: false,
    target: { name: 'upload', sessionId: 's-eng-2' },
  },
  {
    id: 'n3',
    type: 'quiz',
    title: { en: 'A new quiz is ready: Comparing fractions', de: 'Ein neues Quiz ist da: Brüche vergleichen' },
    body: { en: '5 questions · about 5 minutes', de: '5 Fragen · etwa 5 Minuten' },
    date: '2026-10-12T08:12',
    read: false,
    target: { name: 'quiz', quizId: 'qz-frac-1' },
  },
  {
    id: 'n4',
    type: 'message',
    from: 'Ms. Weber',
    title: { en: 'Message from Ms. Weber', de: 'Nachricht von Frau Weber' },
    body: {
      en: 'Great effort on fractions, Omar! Try the new quiz and tell me how it went.',
      de: 'Toll gemacht bei den Brüchen, Omar! Probier das neue Quiz und erzähl mir, wie es lief.',
    },
    date: '2026-10-12T08:15',
    read: false,
  },
  {
    id: 'n5',
    type: 'support',
    title: { en: 'Let’s work on fractions together', de: 'Lass uns zusammen Brüche üben' },
    body: { en: 'Your teacher left you an encouraging note.', de: 'Deine Lehrkraft hat dir eine Mut-Nachricht geschrieben.' },
    date: '2026-10-12T08:11',
    read: true,
    target: { name: 'results', examId: 'e-math-1' },
  },
  {
    id: 'n6',
    type: 'weakness',
    title: { en: 'New topic to practise: Fractions', de: 'Neues Übungsthema: Brüche' },
    body: { en: 'See what to work on next.', de: 'Schau, was du als Nächstes üben kannst.' },
    date: '2026-10-12T08:11',
    read: true,
    target: { name: 'results', examId: 'e-math-1', tab: 'topics' },
  },
  {
    id: 'n7',
    type: 'submission',
    title: { en: 'Your Science Quiz arrived', de: 'Dein Sachkunde-Quiz ist angekommen' },
    body: { en: 'Your teacher will check it soon.', de: 'Deine Lehrkraft schaut es bald an.' },
    date: '2026-10-11T16:02',
    read: true,
    target: { name: 'upload', sessionId: 's-sci-1' },
  },
  {
    id: 'n8',
    type: 'corrected',
    title: { en: 'Grade updated: English Test', de: 'Note geändert: Englisch-Test' },
    body: { en: 'Question 3 is now 2 of 2 points.', de: 'Frage 3 hat jetzt 2 von 2 Punkten.' },
    date: '2026-10-01T12:30',
    read: true,
    target: { name: 'results', examId: 'e-eng-1' },
  },
  {
    id: 'n9',
    type: 'recommendation',
    title: { en: 'Try this: Times tables 3 to 9', de: 'Probier das: Einmaleins 3 bis 9' },
    body: { en: 'Ms. Weber thinks this will help you.', de: 'Frau Weber denkt, das hilft dir.' },
    date: '2026-10-09T14:00',
    read: true,
    target: { name: 'quiz', quizId: 'qz-times-1' },
  },
  {
    id: 'n10',
    type: 'feedback',
    title: { en: 'New feedback on English Test', de: 'Neue Rückmeldung zum Englisch-Test' },
    body: { en: 'Mr. Klein wrote you a comment.', de: 'Herr Klein hat dir etwas geschrieben.' },
    date: '2026-09-26T09:00',
    read: true,
    target: { name: 'results', examId: 'e-eng-1' },
  },
]

export const TODAY = '2026-10-12'

/* Sample exam page rendered as an SVG data URL, used for demo uploads and answer scans. */
export function samplePage(n: number, title = 'Math Exam 2') {
  const lines = [
    `1)  3/8 + 2/8 = 5/8`,
    `2)  7 x 6 = 42`,
    `3)  4/9 or 7/9 ->  7/9`,
    `4)  1/2 of 10 = 5`,
    `5)  8 x 4 = 32`,
  ]
  const rows = lines
    .map((l, i) => `<text x="40" y="${150 + i * 62}" font-family="Patrick Hand, cursive" font-size="30" fill="#2c3e8f">${l}</text>`)
    .join('')
  const rules = Array.from({ length: 12 }, (_, i) => `<line x1="20" x2="580" y1="${100 + i * 62 + 12}" y2="${100 + i * 62 + 12}" stroke="#c9dcff" stroke-width="2"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="820" viewBox="0 0 600 820"><rect width="600" height="820" fill="#fffdf7"/><line x1="70" x2="70" y1="0" y2="820" stroke="#ffb3a6" stroke-width="2"/>${rules}<text x="40" y="60" font-family="Patrick Hand, cursive" font-size="34" fill="#24304d">${title} · Omar K. · p.${n}</text>${rows}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
