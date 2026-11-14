import {
  ArrowRight,
  Camera,
  ChevronRight,
  Clock,
  Puzzle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { SUBJECTS, TOPICS, examScore, topicMastery, type Route } from "../data";
import { useStore } from "../store";
import { Mascot } from "../components/Mascot";
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Ring,
  SectionTitle,
  SpeakButton,
  Stars,
  cx,
  formatDate,
} from "../components/ui";
import { SessionStatusChip } from "./Upload";

export function Home() {
  const {
    t,
    L,
    user,
    sessions,
    exams,
    quizzes,
    viewedExams,
    go,
    weeklyStars,
    lang,
    setQuizStatus,
  } = useStore();

  const reupload = sessions.find((s) => s.status === "reupload");
  const newResult = exams.find((e) => e.status === "confirmed" && !viewedExams.includes(e.id));
  const readyQuiz = quizzes.find((q) => q.status === "ready");
  const openSession = sessions.find((s) => s.status === "open");

  let next: { title: string; body: string; cta: string; route: Route };
  if (reupload)
    next = {
      title: t("home.next.reupload"),
      body: L(reupload.title),
      cta: t("home.next.reuploadCta"),
      route: { name: "upload", sessionId: reupload.id },
    };
  else if (newResult)
    next = {
      title: t("home.next.results"),
      body: L(newResult.title),
      cta: t("home.next.resultsCta"),
      route: { name: "results", examId: newResult.id },
    };
  else if (readyQuiz)
    next = {
      title: t("home.next.quiz"),
      body: L(readyQuiz.title),
      cta: t("home.next.quizCta"),
      route: { name: "quiz", quizId: readyQuiz.id },
    };
  else if (openSession)
    next = {
      title: t("home.next.upload"),
      body: L(openSession.title),
      cta: t("home.next.uploadCta"),
      route: { name: "upload", sessionId: openSession.id },
    };
  else
    next = {
      title: t("home.next.free"),
      body: t("home.next.freeBody"),
      cta: t("nav.practice"),
      route: { name: "practice" },
    };

  const openCount = sessions.filter((s) => s.status === "open" || s.status === "reupload").length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? t("home.morning") : hour < 18 ? t("home.afternoon") : t("home.evening");
  const practiceQuiz =
    quizzes.find((q) => q.status === "ready" && q.id !== readyQuiz?.id) ??
    readyQuiz ??
    quizzes.find((q) => q.status === "later");
  const mainTopic = { ...TOPICS.fractions, mastery: topicMastery("fractions", quizzes) };

  const recent = [...sessions]
    .filter(
      (s) =>
        s.status === "results" ||
        s.status === "checking" ||
        s.status === "uploaded" ||
        s.status === "reupload",
    )
    .map((s) => ({ s, exam: exams.find((e) => e.id === s.examId) }));
  const extra = exams
    .filter((e) => e.status === "confirmed" && !sessions.some((s) => s.examId === e.id))
    .slice(0, 1);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-sky-500 to-sky-400 p-6 text-white sm:p-8">
        <div className="absolute -right-10 -top-16 size-64 rounded-full bg-white/10" />
        <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl">
                {greet}, {user?.name}!
              </h1>
              <SpeakButton
                text={`${greet}, ${user?.name}! ${t("home.ready")}`}
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
              />
            </div>
            <p className="mt-2 text-xl text-sky-50">{t("home.ready")}</p>

            <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-4 text-ink shadow-xl sm:flex-row sm:items-center sm:p-5 md:flex-col md:items-stretch xl:flex-row xl:items-center">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun-100 text-sun-700">
                <Sparkles className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold uppercase tracking-wide text-coral-500">
                  {t("home.nextStep")}
                </p>
                <p className="font-display text-xl leading-tight">{next.title}</p>
                <p className="truncate text-ink-soft">{next.body}</p>
              </div>
              <Button
                onClick={() => go(next.route)}
                variant="coral"
                iconRight={<ArrowRight className="size-5" />}
              >
                {next.cta}
              </Button>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <Mascot size={170} mood="cheer" />
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col">
          <div className="flex items-start gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-coral-100 text-coral-500">
              <Camera className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl">{t("home.uploadTitle")}</h2>
              <p className="text-ink-soft">{t("home.uploadBody", { n: openCount })}</p>
            </div>
          </div>
          <Button
            className="mt-5 self-start"
            variant="primary"
            onClick={() => go({ name: "upload" })}
          >
            {t("home.uploadCta")}
          </Button>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">{t("home.myProgress")}</h2>
            <span className="flex items-center gap-1 font-display text-2xl font-semibold">
              <Stars n={1} of={1} size="size-7" /> {Math.min(weeklyStars, 10)}/10
            </span>
          </div>
          <p className="mt-1 text-ink-soft">{t("home.weeklyGoal")}</p>
          <ProgressBar
            value={Math.min(weeklyStars, 10)}
            max={10}
            tone="sun"
            className="mt-4 h-5"
            label={t("home.weeklyGoal")}
          />
          <p className="mt-4 flex items-center gap-2 font-bold text-mint-700">
            <TrendingUp className="size-5" />{" "}
            {weeklyStars >= 10 ? t("home.goalReached") : t("home.improving")}
          </p>
        </Card>
      </div>

      <SectionTitle>{t("home.continue")}</SectionTitle>
      <div className="grid gap-5 md:grid-cols-2">
        {practiceQuiz && (
          <Card className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 size-28 rounded-full bg-sun-100" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Puzzle className="size-6 text-sun-700" />
                <p className="font-extrabold uppercase tracking-wide text-sun-700">
                  {t("home.practiceForYou")}
                </p>
                {practiceQuiz.isNew && <Chip tone="coral">{t("new")}</Chip>}
              </div>
              <h3 className="mt-2 text-2xl">{L(practiceQuiz.title)}</h3>
              <p className="mt-1 flex items-center gap-3 text-ink-soft">
                <span>{t("quiz.nQuestions", { n: practiceQuiz.count })}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" /> {t("quiz.minutes", { n: practiceQuiz.minutes })}
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="sun" onClick={() => go({ name: "quiz", quizId: practiceQuiz.id })}>
                  {t("quiz.start")}
                </Button>
                {practiceQuiz.status === "ready" && (
                  <Button variant="ghost" onClick={() => setQuizStatus(practiceQuiz.id, "later")}>
                    {t("quiz.later")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
        <button onClick={() => go({ name: "progress" })} className="group text-left">
          <Card className="flex h-full items-center gap-5 transition group-hover:ring-2 group-hover:ring-grape-400/40">
            <Ring value={mainTopic.mastery} size={96}>
              <span className="text-xl">{mainTopic.mastery}%</span>
            </Ring>
            <div className="flex-1">
              <p className="font-extrabold uppercase tracking-wide text-grape-600">
                {t("home.learning")}
              </p>
              <h3 className="text-2xl">{L(mainTopic.name)}</h3>
              <p className="text-ink-soft">{t("home.learningBody")}</p>
            </div>
            <span className="grid size-12 place-items-center rounded-full bg-grape-100 text-grape-600 transition group-hover:translate-x-1">
              <ArrowRight className="size-6" />
            </span>
          </Card>
        </button>
      </div>

      <SectionTitle
        right={
          <button
            onClick={() => go({ name: "results" })}
            className="flex items-center gap-1 font-bold text-sky-700 hover:underline"
          >
            {t("seeAll")} <ChevronRight className="size-4" />
          </button>
        }
      >
        {t("home.recentExams")}
      </SectionTitle>
      <Card className="!p-2 sm:!p-3">
        <ul className="divide-y divide-ink/5">
          {recent.map(({ s, exam }) => {
            const score = exam && exam.status === "confirmed" ? examScore(exam) : null;
            const target: Route =
              s.status === "results" && exam
                ? { name: "results", examId: exam.id }
                : { name: "upload", sessionId: s.id };
            return (
              <li key={s.id}>
                <ExamRow
                  title={L(s.title)}
                  subject={L(SUBJECTS[s.subject].name)}
                  tone={SUBJECTS[s.subject].tone}
                  pct={score?.pct}
                  onClick={() => go(target)}
                  status={<SessionStatusChip status={s.status} />}
                />
              </li>
            );
          })}
          {extra.map((e) => (
            <li key={e.id}>
              <ExamRow
                title={L(e.title)}
                subject={`${L(SUBJECTS[e.subject].name)} · ${formatDate(e.date, lang)}`}
                tone={SUBJECTS[e.subject].tone}
                pct={examScore(e).pct}
                onClick={() => go({ name: "results", examId: e.id })}
                status={<SessionStatusChip status="results" />}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ExamRow({
  title,
  subject,
  tone,
  pct,
  status,
  onClick,
}: {
  title: string;
  subject: string;
  tone: "sky" | "mint" | "sun" | "coral" | "grape";
  pct?: number;
  status: React.ReactNode;
  onClick: () => void;
}) {
  const dot = {
    sky: "bg-sky-400",
    mint: "bg-mint-400",
    sun: "bg-sun-400",
    coral: "bg-coral-400",
    grape: "bg-grape-400",
  }[tone];
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-3 text-left hover:bg-cloud sm:flex-nowrap"
    >
      <span className={cx("size-3 shrink-0 rounded-full", dot)} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-lg">{title}</span>
        <span className="text-sm text-ink-soft">{subject}</span>
      </span>
      <span className="w-14 text-right font-display text-xl font-semibold">
        {pct !== undefined ? `${pct}%` : "–"}
      </span>
      <span className="w-full sm:w-auto">{status}</span>
      <ChevronRight className="hidden size-5 text-ink-soft sm:block" />
    </button>
  );
}
