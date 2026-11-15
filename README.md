# Learnie

**AI-assisted assessment and learning-gap detection for children in Grades 1–5, in English and German.**

Students upload a photo or scan of their paper exam. The system reads the answers with OCR, an AI proposes grades, and it detects learning gaps, recurring mistakes and students who need extra support. The **teacher stays in control at every step**: they verify the extracted text, confirm or override every grade, and confirm or dismiss every finding and red flag. Nothing reaches the student until the teacher releases it.

---

## 🚀 Live demo (recommended)

### 👉 https://agency-garb-99483121.figma.site/

The deployed version is the **recommended way to test the app**. There is nothing to install, and it works in any modern browser on desktop or mobile. You only need to run the app locally if the link is unavailable (see [Run locally](#run-locally)).

---

## Demo logins

| Role | How to sign in |
| --- | --- |
| **Student** | Choose the **Student** tab, tap any child (e.g. *Omar*), then enter the picture password **🐱 Cat → ☀️ Sun → 🚀 Rocket** |
| **Teacher** | Choose the **Teacher** tab. The email `m.weber@learnie.school` and password `learnie` are pre-filled, so just press **Sign in** |

Use the **EN / DE** toggle (top right) to switch the whole interface between English and German at any time.

> **Note:** This is a front-end prototype. As the course brief allows, OCR output, AI grades, feedback and learning-gap findings are **simulated with hard-coded mock data**. There is no back-end, and state resets when you reload the page.

---

## How to test the full workflow

The brief's workflow is: *Student uploads exam → OCR → Teacher verifies text → AI grading → Teacher confirmation → Learning-gap detection → Red-flag detection → Personalized feedback → Student views results.* The scripts below walk through each step.

### A. Student view

1. **Home**: a personal dashboard with exams to upload, new results, recommended practice and a weekly star goal. The penguin helper *Pip* reacts to what you do.
2. **Upload** (sidebar): open an exam session, then add pages with **Choose files** (images/PDF, multiple pages) or **Take a photo** (opens the camera on phones/tablets). Reorder, retake or remove pages, go through the photo-quality checklist, then submit.
   - Afterwards, the session shows a status tracker: *Uploaded → Teacher checking → Results ready*.
   - One session shows a **re-upload request** from the teacher, with the reason (e.g. a blurry page).
3. **My Results**: grades appear **only after the teacher has confirmed them**. Exams still being checked show as *checking*. Open a confirmed exam to see:
   - the score and the teacher's personal note
   - **Questions**: per-question marks and feedback
   - **Topics to practise**: the identified weaknesses
   - **Why it went wrong**: misconceptions, explained in child-friendly language
   - a **support card** (the confirmed red flag) with a "Start practice" button
4. **Notifications** (bell icon): messages from the teacher, new results, practice recommendations and re-upload requests. Students can reply with a short message.
5. **My Progress**: score trends across exams, mastery per topic, and *Mistakes that come back* (recurring errors).
6. **Practice**: take a recommended quiz. Afterwards, the **reflection** step asks *why* each mistake happened (didn't understand / forgot the rule / calculation slip / not sure), and Learnie builds an **adaptive follow-up quiz** from the most common reason.
7. **Badges** and **Settings**: achievements, read-aloud on/off, large text, helper visibility and language.

> 🔊 Speaker buttons read instructions and feedback aloud (EN or DE voice) for children who are still learning to read.

### B. Teacher view

1. **Dashboard**: the review queue, students needing support, class concept gaps and recent activity. Class, subject and exam can be filtered in the header.
2. **Submissions**: open a submission to enter the **4-step review workspace**:
   1. **Verify text (OCR)**: the scanned page sits beside the extracted answers. Each answer shows an OCR confidence score, and low-confidence handwriting is highlighted. The teacher can edit the text, **Restore OCR**, **Mark blank**, or insert German characters and math symbols (`ä ö ü ß × ÷ …`). Every answer must be marked *Verified* before **Approve text & start AI grading** unlocks.
   2. **Review grades**: each question shows the AI-proposed mark and its reasoning. The teacher can accept it or **override** it (with an optional reason) and edit the AI-drafted student feedback. A summary shows the AI total, the teacher total and the number of changes.
   3. **Learning findings**: **confirm, edit or dismiss** the proposed misconception (with evidence from the student's answers), and **confirm or dismiss the support red flag** and change its severity.
   4. **Preview & release**: shows exactly what the student will see. The teacher ticks the release checklist, writes overall feedback, then clicks **Confirm & release results**.
   - **Request re-upload** (top right) sends the student a reason to resubmit.
3. **Students**: student profiles with exam history, learning gaps, quiz oversight and notes, plus a support-priority ordering.
4. **Class insights**: class-wide concept performance, mastery overview, trends and the list of *students needing support*. Open a concept to see the affected students and act on it.
5. **Feedback**: compose messages to individual students or the whole class (EN/DE, templates, preview, scheduling) and track who has read them.
6. **New exam session** (header button): create an upload session for a class, subject, exam language and due date.

---

## What makes Learnie different

- **Teacher-in-the-loop by design.** The OCR check, grading and findings are separate gated steps. AI output is clearly labelled with confidence scores, and the student never sees anything that hasn't been released.
- **Learning from mistakes, not just grades.** The student reflects on *why* each mistake happened, and the next practice quiz adapts to that reason.
- **Built for young children (Grades 1–5).** Picture-password login (no typing), read-aloud everywhere, large tap targets, a large-text mode, an encouraging mascot, and supportive wording for red flags ("Let's work on fractions together").
- **Bilingual from end to end.** Full English/German UI, a language setting per exam session, a German/math character palette for correcting OCR, and read-aloud in both languages.
- **Release preview.** The teacher sees the exact student-facing result before releasing it.
- **Class-level insights.** Gaps are aggregated across the class, so the teacher can spot concepts the whole class struggles with, not just individual students.

---

## Run locally

Only needed if the [live demo](#-live-demo-recommended) is unavailable.

**Prerequisites:** [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/installation). npm also works.

```bash
git clone https://github.com/JomanaMahmoud/LearnieLearningApp.git
cd LearnieLearningApp
pnpm install        # or: npm install
pnpm dev            # or: npm run dev
```

Then open **http://localhost:8443**.

- The port comes from the `PORT` environment variable (default `8443`). If 8443 is busy, run e.g. `PORT=5173 pnpm dev` (macOS/Linux) or `$env:PORT=5173; pnpm dev` (PowerShell).
- Production build: `pnpm build` and then `pnpm preview`.
- Keep the `.figma/` folder: `vite.config.ts` reads `.figma/make/site.json`.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 8** (dev server and build)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **lucide-react** icons
- Web Speech API for read-aloud
- Built with Figma Make and deployed on Figma Sites

## Project structure

```
src/
├── App.tsx              # Picks the screen for the logged-in role (student / teacher)
├── store.tsx            # App state (React context): user, routing, sessions, exams, quizzes, notifications
├── data.ts              # Mock student data: exams, OCR'd answers, grades, weaknesses, misconceptions, quizzes
├── i18n.ts              # English / German strings
├── components/          # Shell (layout + nav), shared UI, Pip the penguin mascot
├── screens/             # Student screens: Login, Home, Upload, Results, Progress, Practice,
│                        #   Achievements, Notifications, Settings
└── teacher/
    ├── TeacherApp.tsx   # Teacher workspace: dashboard, review workflow, students, insights, feedback
    └── data.ts          # Mock teacher data: submissions, students, concept insights
```

---

## AI usage

AI tools were used during development. As the course requires, the full chat and prompt history is submitted separately with the project deliverables.
