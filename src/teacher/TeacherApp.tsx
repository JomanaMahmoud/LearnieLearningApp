import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Flag,
  GraduationCap,
  Image,
  Languages,
  LayoutDashboard,
  ListFilter,
  Lock,
  LogOut,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useStore } from "../store";
import { Logo } from "../components/Shell";
import { LangToggle, ProgressBar, cx } from "../components/ui";
import {
  ACTIVITY,
  CONCEPTS,
  TEACHER_STUDENTS,
  TEACHER_SUBMISSIONS,
  reviewQuestionsFor,
  type ConceptInsight,
  type ReviewQuestion,
  type SubmissionStatus,
  type TeacherRoute,
  type TeacherStudent,
  type TeacherSubmission,
} from "./data";

const copy = {
  dashboard: ["Dashboard", "Übersicht"],
  submissions: ["Submissions", "Einreichungen"],
  students: ["Students", "Lernende"],
  insights: ["Class insights", "Klassenanalyse"],
  messages: ["Feedback", "Rückmeldungen"],
  settings: ["Settings", "Einstellungen"],
} as const;

type Toast = { text: string; tone?: "success" | "info" };

export function TeacherApp() {
  const { lang, user, logout } = useStore();
  const tx = (en: string, de: string) => (lang === "de" ? de : en);
  const [route, setRoute] = useState<TeacherRoute>("dashboard");
  const [selectedSubmission, setSelectedSubmission] = useState<TeacherSubmission | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptInsight | null>(null);
  const [classFilter, setClassFilter] = useState("Grade 4A");
  const [subjectFilter, setSubjectFilter] = useState("Math");
  const [examFilter, setExamFilter] = useState("Math Exam 1");
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [queue, setQueue] = useState(TEACHER_SUBMISSIONS);

  const notify = (text: string, tone: Toast["tone"] = "success") => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 3500);
  };

  const navigate = (next: TeacherRoute) => {
    setRoute(next);
    setSelectedSubmission(null);
    setSelectedStudent(null);
    setSelectedConcept(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-ink lg:pl-[268px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-[#dfe5ef] bg-[#14284a] px-4 py-5 text-white lg:flex">
        <button onClick={() => navigate("dashboard")} className="mb-7 self-start rounded-2xl bg-white px-3 py-2">
          <Logo small />
        </button>
        <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/45">
          {tx("Teacher workspace", "Lehrkräfte-Bereich")}
        </p>
        <nav className="space-y-1" aria-label={tx("Teacher navigation", "Lehrkräfte-Navigation")}>
          <TeacherNavItem icon={LayoutDashboard} label={tx(...copy.dashboard)} active={route === "dashboard"} onClick={() => navigate("dashboard")} />
          <TeacherNavItem
            icon={FileCheck2}
            label={tx(...copy.submissions)}
            active={route === "submissions"}
            badge={queue.filter((s) => !["finalized", "reupload"].includes(s.status)).length}
            onClick={() => navigate("submissions")}
          />
          <TeacherNavItem icon={Users} label={tx(...copy.students)} active={route === "students"} onClick={() => navigate("students")} />
          <TeacherNavItem
            icon={BarChart3}
            label={tx(...copy.insights)}
            active={route === "insights"}
            badge={3}
            onClick={() => navigate("insights")}
          />
          <TeacherNavItem icon={MessageSquareText} label={tx(...copy.messages)} active={route === "messages"} onClick={() => navigate("messages")} />
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <button onClick={() => setSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white">
            <Settings className="size-4.5" /> {tx(...copy.settings)}
          </button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white">
            <LogOut className="size-4.5" /> {tx("Log out", "Abmelden")}
          </button>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/8 p-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-400 font-display font-semibold">MW</span>
            <span className="min-w-0">
              <span className="block truncate font-display font-semibold">{user?.name}</span>
              <span className="block text-xs text-white/50">{tx("Grade 4 teacher", "Lehrkraft, Klasse 4")}</span>
            </span>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#dfe5ef] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <button onClick={() => navigate("dashboard")} className="lg:hidden">
            <Logo small />
          </button>
          <div className="hidden items-center gap-2 xl:flex">
            <HeaderSelect label={tx("Class", "Klasse")} value={classFilter} options={["Grade 4A", "Grade 4B", "Grade 5A"]} onChange={setClassFilter} />
            <HeaderSelect label={tx("Subject", "Fach")} value={subjectFilter} options={["Math", "English", "Science"]} onChange={setSubjectFilter} />
            <HeaderSelect label={tx("Exam", "Arbeit")} value={examFilter} options={["Math Exam 1", "Math Exam 2", "All exams"]} onChange={setExamFilter} />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="ml-auto hidden min-h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white transition hover:bg-sky-700 sm:flex"
          >
            <Plus className="size-4" /> {tx("New exam session", "Neue Arbeit")}
          </button>
          <LangToggle compact />
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative grid size-11 place-items-center rounded-xl border border-[#dfe5ef] bg-white text-ink-soft hover:bg-cloud"
            aria-label={tx("Notifications", "Benachrichtigungen")}
          >
            <Bell className="size-5" />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-coral-400 text-[10px] font-extrabold text-white">5</span>
          </button>
          <span className="grid size-11 place-items-center rounded-xl bg-[#dce8fb] font-display font-semibold text-sky-700">MW</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {selectedSubmission ? (
          <ReviewWorkspace
            submission={selectedSubmission}
            tx={tx}
            onBack={() => setSelectedSubmission(null)}
            onReleased={() => {
              setQueue((all) => all.map((s) => (s.id === selectedSubmission.id ? { ...s, status: "finalized", progress: 100, score: 75 } : s)));
              setSelectedSubmission(null);
              notify(tx("Results released to the student.", "Ergebnisse wurden freigegeben."));
            }}
            onReupload={() => {
              setQueue((all) => all.map((s) => (s.id === selectedSubmission.id ? { ...s, status: "reupload", progress: 8 } : s)));
              setSelectedSubmission(null);
              notify(tx("Re-upload request sent.", "Bitte um erneuten Upload gesendet."), "info");
            }}
          />
        ) : selectedStudent ? (
          <StudentProfile student={selectedStudent} tx={tx} onBack={() => setSelectedStudent(null)} notify={notify} />
        ) : selectedConcept ? (
          <ConceptDetail concept={selectedConcept} tx={tx} onBack={() => setSelectedConcept(null)} onStudent={(student) => { setSelectedConcept(null); setSelectedStudent(student); }} notify={notify} />
        ) : (
          <>
            {route === "dashboard" && (
              <TeacherDashboard
                tx={tx}
                className={classFilter}
                queue={queue}
                onRoute={navigate}
                onSubmission={setSelectedSubmission}
                onStudent={(id) => setSelectedStudent(TEACHER_STUDENTS.find((s) => s.id === id) ?? null)}
                onConcept={setSelectedConcept}
              />
            )}
            {route === "submissions" && <SubmissionQueue tx={tx} queue={queue} onOpen={setSelectedSubmission} />}
            {route === "students" && <StudentsView tx={tx} onOpen={setSelectedStudent} />}
            {route === "insights" && <InsightsView tx={tx} onConcept={setSelectedConcept} onStudent={setSelectedStudent} notify={notify} />}
            {route === "messages" && <MessagesView tx={tx} notify={notify} />}
          </>
        )}
      </main>

      <TeacherMobileNav route={route} onRoute={navigate} tx={tx} />
      {createOpen && <CreateSessionModal tx={tx} onClose={() => setCreateOpen(false)} onCreated={(title) => { setCreateOpen(false); notify(tx(`“${title}” is open for Grade 4A.`, `„${title}“ ist für Klasse 4A geöffnet.`)); }} />}
      {notificationsOpen && <TeacherNotifications tx={tx} onClose={() => setNotificationsOpen(false)} onOpen={(r) => { setNotificationsOpen(false); navigate(r); }} onPreferences={() => { setNotificationsOpen(false); setSettingsOpen(true); }} />}
      {settingsOpen && <TeacherSettingsModal tx={tx} onClose={() => setSettingsOpen(false)} onSaved={() => { setSettingsOpen(false); notify(tx("Teacher settings saved.", "Einstellungen gespeichert.")); }} />}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-2xl bg-[#14284a] px-5 py-3 text-sm font-bold text-white shadow-2xl" role="status">
          <span className="flex items-center gap-2">
            {toast.tone === "info" ? <CircleHelp className="size-5 text-sky-300" /> : <CheckCircle2 className="size-5 text-mint-300" />}
            {toast.text}
          </span>
        </div>
      )}
    </div>
  );
}

function TeacherNavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition",
        active ? "bg-white text-[#14284a]" : "text-white/65 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="size-5" />
      <span className="flex-1">{label}</span>
      {!!badge && <span className={cx("grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11px]", active ? "bg-coral-100 text-coral-700" : "bg-white/12 text-white")}>{badge}</span>}
    </button>
  );
}

function HeaderSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative flex min-h-10 items-center rounded-xl border border-[#dfe5ef] bg-[#f8f9fc] pl-3 pr-8 text-sm">
      <span className="mr-1.5 text-ink-soft">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent font-bold outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-ink-soft" />
    </label>
  );
}

function TeacherMobileNav({ route, onRoute, tx }: { route: TeacherRoute; onRoute: (r: TeacherRoute) => void; tx: Tx }) {
  const nav = [
    ["dashboard", LayoutDashboard, "Home", "Start"],
    ["submissions", FileCheck2, "Queue", "Liste"],
    ["students", Users, "Students", "Lernende"],
    ["insights", BarChart3, "Insights", "Analyse"],
    ["messages", MessageSquareText, "Feedback", "Feedback"],
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#dfe5ef] bg-white px-1 py-1.5 lg:hidden">
      {nav.map(([id, Icon, en, de]) => (
        <button key={id} onClick={() => onRoute(id)} className={cx("flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-bold", route === id ? "text-sky-700" : "text-ink-soft")}>
          <Icon className="size-5" /> {tx(en, de)}
        </button>
      ))}
    </nav>
  );
}

type Tx = (en: string, de: string) => string;

function TeacherCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-[#e1e6ef] bg-white shadow-[0_7px_24px_-20px_rgba(20,40,74,0.5)]", className)}>{children}</div>;
}

function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#162b4d]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  hint,
  tone,
  onClick,
}: {
  icon: typeof Users;
  value: string | number;
  label: string;
  hint: string;
  tone: "blue" | "mint" | "coral" | "grape";
  onClick?: () => void;
}) {
  const colors = {
    blue: "bg-[#e8f0fd] text-sky-700",
    mint: "bg-mint-50 text-mint-700",
    coral: "bg-coral-50 text-coral-700",
    grape: "bg-grape-100 text-grape-600",
  };
  return (
    <button onClick={onClick} className="group text-left">
      <TeacherCard className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-sky-200">
        <div className="flex items-start gap-4">
          <span className={cx("grid size-11 shrink-0 place-items-center rounded-xl", colors[tone])}><Icon className="size-5" /></span>
          <span>
            <span className="block font-display text-3xl font-semibold text-[#162b4d]">{value}</span>
            <span className="block font-bold">{label}</span>
            <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
          </span>
        </div>
      </TeacherCard>
    </button>
  );
}

function TeacherDashboard({
  tx,
  className,
  queue,
  onRoute,
  onSubmission,
  onStudent,
  onConcept,
}: {
  tx: Tx;
  className: string;
  queue: TeacherSubmission[];
  onRoute: (r: TeacherRoute) => void;
  onSubmission: (s: TeacherSubmission) => void;
  onStudent: (id: string) => void;
  onConcept: (c: ConceptInsight) => void;
}) {
  const awaiting = queue.filter((s) => s.status === "ocr").length;
  const aiReady = queue.filter((s) => s.status === "grading" || s.status === "confirm").length;
  return (
    <>
      <PageTitle
        title={tx("Good morning, Ms. Weber", "Guten Morgen, Frau Weber")}
        subtitle={tx(`Here is what needs your attention in ${className} today.`, `Das braucht heute Ihre Aufmerksamkeit in ${className}.`)}
        action={<span className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-ink-soft ring-1 ring-[#dfe5ef]"><Calendar className="size-4" /> 12 Oct 2026</span>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} value={awaiting} label={tx("Awaiting text check", "Textprüfung offen")} hint={tx("2 marked urgent", "2 als dringend markiert")} tone="coral" onClick={() => onRoute("submissions")} />
        <MetricCard icon={Sparkles} value={aiReady} label={tx("AI grades to confirm", "KI-Noten bestätigen")} hint={tx("About 18 minutes", "Etwa 18 Minuten")} tone="grape" onClick={() => onRoute("submissions")} />
        <MetricCard icon={Flag} value={3} label={tx("Students need support", "Lernende brauchen Hilfe")} hint={tx("1 new since yesterday", "1 neu seit gestern")} tone="blue" onClick={() => onRoute("insights")} />
        <MetricCard icon={TrendingUp} value="73%" label={tx("Class average", "Klassendurchschnitt")} hint={tx("+4% from last exam", "+4 % seit letzter Arbeit")} tone="mint" onClick={() => onRoute("insights")} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <TeacherCard>
          <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4">
            <div>
              <h2 className="text-xl font-semibold">{tx("Needs your attention", "Braucht Ihre Aufmerksamkeit")}</h2>
              <p className="text-sm text-ink-soft">{tx("Prioritized by urgency and student impact", "Nach Dringlichkeit und Lernwirkung sortiert")}</p>
            </div>
            <button onClick={() => onRoute("submissions")} className="text-sm font-extrabold text-sky-700 hover:underline">{tx("View queue", "Liste öffnen")}</button>
          </div>
          <div className="divide-y divide-[#edf0f5]">
            {queue.filter((s) => s.urgent || s.status === "confirm").slice(0, 4).map((s) => (
              <button key={s.id} onClick={() => onSubmission(s)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#f8faff]">
                <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold", s.status === "reupload" ? "bg-coral-50 text-coral-700" : "bg-[#e8f0fd] text-sky-700")}>{s.student.split(" ").map((p) => p[0]).join("")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-bold">{s.student}{s.urgent && <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] uppercase text-coral-700">{tx("Urgent", "Dringend")}</span>}</span>
                  <span className="block truncate text-sm text-ink-soft">{s.exam} · {statusText(s.status, tx)}</span>
                </span>
                <StatusBadge status={s.status} tx={tx} />
                <ChevronRight className="size-5 text-ink-soft" />
              </button>
            ))}
          </div>
        </TeacherCard>

        <TeacherCard className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{tx("Class pulse", "Klassen-Puls")}</h2>
            <span className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-extrabold text-mint-700">{tx("Improving", "Verbessert")}</span>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold text-[#162b4d]">73%</span>
            <span className="mb-1 flex items-center gap-1 text-sm font-bold text-mint-700"><TrendingUp className="size-4" /> 4%</span>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Fractions", 68, "coral"],
              ["Multiplication", 84, "mint"],
              ["Word problems", 71, "sky"],
            ].map(([label, value, tone]) => (
              <div key={label as string}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-bold">{label}</span><span className="font-bold">{value}%</span></div>
                <ProgressBar value={value as number} tone={tone as "coral" | "mint" | "sky"} />
              </div>
            ))}
          </div>
          <button onClick={() => onRoute("insights")} className="mt-5 flex items-center gap-1 text-sm font-extrabold text-sky-700 hover:underline">{tx("Open full insights", "Alle Analysen öffnen")} <ArrowRight className="size-4" /></button>
        </TeacherCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <TeacherCard>
          <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4">
            <h2 className="text-xl font-semibold">{tx("Common misconceptions", "Häufige Fehlvorstellungen")}</h2>
            <button onClick={() => onRoute("insights")} className="text-sm font-extrabold text-sky-700">{tx("Explore", "Öffnen")}</button>
          </div>
          <div className="p-5">
            {CONCEPTS.slice(0, 3).map((c, i) => (
              <button key={c.id} onClick={() => onConcept(c)} className="mb-4 grid w-full grid-cols-[minmax(140px,1fr)_2fr_auto] items-center gap-4 text-left last:mb-0">
                <span className="truncate text-sm font-bold">{c.name.en}</span>
                <span className="h-3 overflow-hidden rounded-full bg-[#edf0f5]"><span className={cx("block h-full rounded-full", i === 0 ? "bg-coral-400" : i === 1 ? "bg-sun-400" : "bg-sky-400")} style={{ width: `${c.share * 2.5}%` }} /></span>
                <span className="w-20 text-right text-sm font-bold">{c.affected} {tx("students", "Lernende")}</span>
              </button>
            ))}
          </div>
        </TeacherCard>
        <TeacherCard>
          <div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="text-xl font-semibold">{tx("Recent activity", "Letzte Aktivitäten")}</h2></div>
          <ol className="p-5">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                {i < ACTIVITY.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-[#dfe5ef]" />}
                <span className={cx("relative mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-white", a.tone === "mint" ? "bg-mint-400" : a.tone === "sun" ? "bg-sun-400" : a.tone === "grape" ? "bg-grape-400" : "bg-sky-400")} />
                <span><span className="block text-sm font-bold">{a.text}</span><span className="text-xs text-ink-soft">{a.time}</span></span>
              </li>
            ))}
          </ol>
        </TeacherCard>
      </div>
    </>
  );
}

function SubmissionQueue({ tx, queue, onOpen }: { tx: Tx; queue: TeacherSubmission[]; onOpen: (s: TeacherSubmission) => void }) {
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [search, setSearch] = useState("");
  const shown = queue.filter((s) => (filter === "all" || s.status === filter) && s.student.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <PageTitle title={tx("Exam queue", "Prüfungsliste")} subtitle={tx("Track every submission from upload to released results.", "Verfolgen Sie jede Einreichung vom Upload bis zur Freigabe.")} />
      <TeacherCard className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[#dfe5ef] bg-[#f8f9fc] px-3">
            <Search className="size-4 text-ink-soft" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tx("Search students…", "Lernende suchen…")} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>{tx("All", "Alle")} <b>{queue.length}</b></FilterPill>
          <FilterPill active={filter === "ocr"} onClick={() => setFilter("ocr")}>{tx("Text check", "Textprüfung")}</FilterPill>
          <FilterPill active={filter === "grading"} onClick={() => setFilter("grading")}>{tx("AI grade", "KI-Note")}</FilterPill>
          <FilterPill active={filter === "confirm"} onClick={() => setFilter("confirm")}>{tx("Confirm", "Bestätigen")}</FilterPill>
          <FilterPill active={filter === "finalized"} onClick={() => setFilter("finalized")}>{tx("Finalized", "Freigegeben")}</FilterPill>
        </div>
      </TeacherCard>
      <TeacherCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#f7f9fc] text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-extrabold">{tx("Student", "Lernende/r")}</th>
                <th className="px-4 py-3 font-extrabold">{tx("Exam", "Arbeit")}</th>
                <th className="px-4 py-3 font-extrabold">{tx("Submitted", "Eingereicht")}</th>
                <th className="px-4 py-3 font-extrabold">{tx("Status", "Status")}</th>
                <th className="px-4 py-3 font-extrabold">{tx("Progress", "Fortschritt")}</th>
                <th className="px-4 py-3 font-extrabold">{tx("Confidence", "Sicherheit")}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f5]">
              {shown.map((s) => (
                <tr key={s.id} className="transition hover:bg-[#fbfcff]">
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-[#e8f0fd] font-display font-semibold text-sky-700">{s.student.split(" ").map((x) => x[0]).join("")}</span>
                      <span><span className="flex items-center gap-1.5 font-bold">{s.student}{s.urgent && <Flag className="size-3.5 fill-coral-400 text-coral-400" />}</span><span className="text-xs text-ink-soft">{s.language}</span></span>
                    </span>
                  </td>
                  <td className="px-4 py-4"><span className="font-bold">{s.exam}</span><span className="block text-xs text-ink-soft">{s.subject}</span></td>
                  <td className="px-4 py-4 text-ink-soft">{s.submitted}</td>
                  <td className="px-4 py-4"><StatusBadge status={s.status} tx={tx} /></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-2"><ProgressBar value={s.progress} className="w-24" /><span className="text-xs font-bold">{s.progress}%</span></div></td>
                  <td className="px-4 py-4"><Confidence value={s.confidence} /></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => onOpen(s)} className="min-h-9 rounded-lg bg-[#e8f0fd] px-3 font-extrabold text-sky-700 hover:bg-sky-100">
                      {s.status === "finalized" ? tx("View", "Ansehen") : s.status === "reupload" ? tx("Details", "Details") : tx("Review", "Prüfen")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!shown.length && <p className="p-8 text-center text-ink-soft">{tx("No submissions match these filters.", "Keine passenden Einreichungen.")}</p>}
      </TeacherCard>
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={cx("min-h-10 rounded-xl px-3 text-sm font-bold transition", active ? "bg-[#14284a] text-white" : "border border-[#dfe5ef] bg-white text-ink-soft hover:text-ink")}>{children}</button>;
}

function StatusBadge({ status, tx }: { status: SubmissionStatus; tx: Tx }) {
  const styles: Record<SubmissionStatus, string> = {
    ocr: "bg-coral-50 text-coral-700",
    grading: "bg-grape-100 text-grape-600",
    confirm: "bg-sun-50 text-sun-700",
    finalized: "bg-mint-50 text-mint-700",
    reupload: "bg-[#f1f3f7] text-ink-soft",
  };
  return <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold", styles[status])}><span className="size-1.5 rounded-full bg-current" />{statusText(status, tx)}</span>;
}

function statusText(status: SubmissionStatus, tx: Tx) {
  return {
    ocr: tx("Verify OCR", "OCR prüfen"),
    grading: tx("AI grade ready", "KI-Note bereit"),
    confirm: tx("Needs confirmation", "Bestätigung offen"),
    finalized: tx("Finalized", "Freigegeben"),
    reupload: tx("Re-upload requested", "Neu-Upload angefragt"),
  }[status];
}

function Confidence({ value }: { value: number }) {
  return <span className={cx("rounded-full px-2.5 py-1 text-xs font-extrabold", value >= 90 ? "bg-mint-50 text-mint-700" : value >= 70 ? "bg-sun-50 text-sun-700" : "bg-coral-50 text-coral-700")}>{value}%</span>;
}

function ReviewWorkspace({
  submission,
  tx,
  onBack,
  onReleased,
  onReupload,
}: {
  submission: TeacherSubmission;
  tx: Tx;
  onBack: () => void;
  onReleased: () => void;
  onReupload: () => void;
}) {
  const start = submission.status === "grading" ? 2 : submission.status === "confirm" ? 3 : submission.status === "finalized" ? 4 : 1;
  const [step, setStep] = useState(start);
  const [question, setQuestion] = useState(0);
  const reviewQuestions = useMemo(() => reviewQuestionsFor(submission.studentId), [submission.studentId]);
  const [verified, setVerified] = useState<boolean[]>(reviewQuestions.map((q) => q.confidence >= 90));
  const [extracted, setExtracted] = useState(reviewQuestions.map((q) => q.extracted));
  const [markedBlank, setMarkedBlank] = useState(reviewQuestions.map((q) => q.scan.trim() === ""));
  const [marks, setMarks] = useState(reviewQuestions.map((q) => q.proposed));
  const [accepted, setAccepted] = useState(reviewQuestions.map(() => false));
  const [feedback, setFeedback] = useState(reviewQuestions.map((q) => q.feedback));
  const [overall, setOverall] = useState(
    tx(
      "Good work on multiplication. Comparing fractions with the same denominator is your next step.",
      "Gute Arbeit beim Einmaleins. Als Nächstes üben wir den Vergleich von Brüchen mit gleichem Nenner.",
    ),
  );
  const [releaseChecks, setReleaseChecks] = useState([false, false, false]);
  const [reuploadOpen, setReuploadOpen] = useState(false);
  const [symbolPaletteOpen, setSymbolPaletteOpen] = useState(false);
  const [reuploadReason, setReuploadReason] = useState(tx("Page 2 is too blurry to read.", "Seite 2 ist zu unscharf zum Lesen."));
  const [scanZoom, setScanZoom] = useState(100);
  const q = reviewQuestions[question];
  const score = marks.reduce((a, b) => a + b, 0);
  const max = reviewQuestions.reduce((a, b) => a + b.max, 0);
  const studentFirstName = submission.student.split(" ")[0];

  const steps = [
    [1, tx("Verify text", "Text prüfen"), ClipboardCheck],
    [2, tx("Review grades", "Noten prüfen"), Sparkles],
    [3, tx("Learning findings", "Lernbefunde"), Target],
    [4, tx("Preview & release", "Vorschau & Freigabe"), Send],
  ] as const;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="grid size-10 place-items-center rounded-xl border border-[#dfe5ef] bg-white hover:bg-cloud"><ArrowLeft className="size-5" /></button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#162b4d]">{submission.student} · {submission.exam}</h1>
            {submission.urgent && <span className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-extrabold text-coral-700">{tx("Urgent", "Dringend")}</span>}
          </div>
          <p className="text-sm text-ink-soft">{submission.subject} · {submission.language} · {tx("Submitted", "Eingereicht")} {submission.submitted}</p>
        </div>
        <button onClick={() => setReuploadOpen(true)} className="min-h-10 rounded-xl border border-coral-200 bg-white px-4 text-sm font-extrabold text-coral-700 hover:bg-coral-50">
          {tx("Request re-upload", "Neu-Upload anfordern")}
        </button>
      </div>

      <TeacherCard className="mb-5 overflow-hidden">
        <ol className="grid grid-cols-2 md:grid-cols-4">
          {steps.map(([n, label, Icon], i) => (
            <li key={n} className={cx("relative flex items-center gap-3 border-b border-[#edf0f5] px-4 py-3 md:border-b-0 md:border-r", step === n ? "bg-[#eef4ff]" : n < step ? "bg-mint-50/50" : "bg-white")}>
              <span className={cx("grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold", n < step ? "bg-mint-400 text-white" : step === n ? "bg-sky-600 text-white" : "bg-[#edf0f5] text-ink-soft")}>
                {n < step ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span><span className="block text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{tx("Step", "Schritt")} {n}</span><span className="block text-sm font-bold">{label}</span></span>
              {i < steps.length - 1 && <ChevronRight className="absolute right-1 hidden size-4 text-ink/20 md:block" />}
            </li>
          ))}
        </ol>
      </TeacherCard>

      {step === 1 && (
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <TeacherCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#edf0f5] px-4 py-3">
              <div><h2 className="font-semibold">{tx("Scanned exam", "Gescannte Arbeit")}</h2><p className="text-xs text-ink-soft">{tx("Page 1 of 2", "Seite 1 von 2")}</p></div>
              <div className="flex gap-1">
                <span className="self-center text-xs font-bold text-ink-soft">{scanZoom}%</span>
                <IconAction label={tx("Zoom out", "Verkleinern")} onClick={() => setScanZoom((v) => Math.max(75, v - 25))}>−</IconAction>
                <IconAction label={tx("Zoom in", "Vergrößern")} onClick={() => setScanZoom((v) => Math.min(150, v + 25))}>+</IconAction>
                <IconAction label={tx("Fit page", "Seite einpassen")} onClick={() => setScanZoom(100)}><Image className="size-4" /></IconAction>
              </div>
            </div>
            <div className="bg-[#e7ebf1] p-6">
              <div className="mx-auto min-h-[610px] max-w-[520px] rounded-sm bg-[#fffef9] p-8 shadow-xl transition-transform" style={{ transform: `rotate(-0.5deg) scale(${scanZoom / 100})`, transformOrigin: "top center" }}>
                <div className="mb-8 flex justify-between border-b-2 border-[#263a61] pb-3 font-hand text-xl text-[#263a61]"><span>{submission.exam}</span><span>{submission.student} · 4A</span></div>
                {reviewQuestions.map((item, i) => (
                  <button key={item.n} onClick={() => setQuestion(i)} className={cx("mb-5 block w-full rounded-lg border-l-4 px-4 py-3 text-left transition", i === question ? "border-sky-500 bg-sky-50/80" : "border-transparent hover:bg-[#faf8f0]")}>
                    <p className="text-xs font-bold text-ink-soft">{item.n}. {item.prompt}</p>
                    <p className="mt-3 rotate-[-1deg] font-hand text-2xl text-[#2e468d]">{item.scan}</p>
                    {item.confidence < 70 && <span className="mt-2 inline-flex rounded bg-sun-100 px-2 py-0.5 text-[10px] font-bold text-sun-700">{tx("Uncertain handwriting", "Unsichere Handschrift")}</span>}
                  </button>
                ))}
              </div>
            </div>
          </TeacherCard>

          <TeacherCard className="h-fit overflow-hidden xl:sticky xl:top-24">
            <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4">
              <div><h2 className="font-semibold">{tx("Extracted answer", "Erkannte Antwort")}</h2><p className="text-xs text-ink-soft">{tx("Question", "Frage")} {q.n} {tx("of", "von")} {reviewQuestions.length}</p></div>
              <Confidence value={q.confidence} />
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-xl bg-[#f7f9fc] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{tx("Question", "Frage")}</p>
                <p className="mt-1 font-bold">{q.prompt}</p>
              </div>
              {q.confidence < 70 && (
                <div className="mb-4 flex items-start gap-3 rounded-xl bg-sun-50 p-3 text-sm text-sun-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span><b>{tx("Check this answer carefully.", "Bitte sorgfältig prüfen.")}</b><br />{tx("The highlighted character has low recognition confidence.", "Das markierte Zeichen hat eine geringe Erkennungssicherheit.")}</span>
                </div>
              )}
              <label>
                <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-bold">
                  <span>{tx("Editable text", "Bearbeitbarer Text")}</span>
                  <span className="flex items-center gap-2">
                    {markedBlank[question] && <span className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-extrabold text-coral-700"><FileText className="mr-1 inline size-3.5" />{tx("Marked blank", "Als leer markiert")}</span>}
                    {!markedBlank[question] && extracted[question] !== q.original && <span className="text-xs text-grape-600">{tx("Edited by you", "Von Ihnen bearbeitet")}</span>}
                  </span>
                </span>
                <textarea
                  value={extracted[question]}
                  disabled={markedBlank[question]}
                  placeholder={markedBlank[question] ? tx("This answer is marked as blank.", "Diese Antwort ist als leer markiert.") : undefined}
                  onChange={(e) => {
                    setExtracted((all) => all.map((x, i) => i === question ? e.target.value : x));
                    setMarkedBlank((all) => all.map((x, i) => i === question ? false : x));
                  }}
                  rows={4}
                  className={cx("w-full rounded-xl border p-3 font-medium outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100", markedBlank[question] ? "border-coral-200 bg-coral-50/50 text-coral-700 placeholder:text-coral-500" : "border-[#cfd7e4] bg-white")}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => {
                  setExtracted((all) => all.map((x, i) => i === question ? q.original : x));
                  setMarkedBlank((all) => all.map((x, i) => i === question ? q.original.trim() === "" : x));
                  setMarks((all) => all.map((x, i) => i === question ? q.proposed : x));
                }} className="min-h-9 rounded-lg border border-[#dfe5ef] px-3 text-xs font-extrabold text-ink-soft"><RotateCcw className="mr-1 inline size-3.5" />{tx("Restore OCR", "OCR wiederherstellen")}</button>
                <button
                  onClick={() => {
                    const nextBlank = !markedBlank[question];
                    setMarkedBlank((all) => all.map((x, i) => i === question ? nextBlank : x));
                    setExtracted((all) => all.map((x, i) => i === question ? (nextBlank ? "" : q.original) : x));
                    setMarks((all) => all.map((x, i) => i === question ? (nextBlank ? 0 : q.proposed) : x));
                  }}
                  className={cx("min-h-9 rounded-lg border px-3 text-xs font-extrabold", markedBlank[question] ? "border-coral-300 bg-coral-50 text-coral-700" : "border-[#dfe5ef] text-ink-soft")}
                >
                  {markedBlank[question] ? <><Check className="mr-1 inline size-3.5" />{tx("Marked blank", "Als leer markiert")}</> : tx("Mark blank", "Als leer markieren")}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setSymbolPaletteOpen((v) => !v)}
                    aria-expanded={symbolPaletteOpen}
                    title={tx("Open character options", "Zeichenoptionen öffnen")}
                    className={cx("min-h-9 rounded-lg border px-3 text-xs font-extrabold hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700", symbolPaletteOpen ? "border-sky-300 bg-sky-50 text-sky-700" : "border-[#dfe5ef] text-ink-soft")}
                  >
                    <Languages className="mr-1 inline size-3.5" /> ä ö ü ß · × ÷
                  </button>
                  {symbolPaletteOpen && (
                    <div role="dialog" aria-label={tx("Insert a character or symbol", "Zeichen oder Symbol einfügen")} className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-[#d8dfeb] bg-white p-2.5 shadow-xl">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-ink">{tx("Insert character", "Zeichen einfügen")}</p>
                          <p className="text-[10px] text-ink-soft">{tx("Choose one option", "Eine Option wählen")}</p>
                        </div>
                        <button onClick={() => setSymbolPaletteOpen(false)} aria-label={tx("Close", "Schließen")} className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-cloud"><X className="size-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {["ä", "ö", "ü", "Ä", "Ö", "Ü", "ß", "×", "÷", "+", "−", "=", "<", ">", "²", "³", "/", ",", ".", "%"].map((symbol) => (
                          <button
                            key={symbol}
                            onClick={() => {
                              setExtracted((all) => all.map((x, i) => i === question ? `${x}${x && !x.endsWith(" ") ? " " : ""}${symbol}` : x));
                              setMarkedBlank((all) => all.map((x, i) => i === question ? false : x));
                              setSymbolPaletteOpen(false);
                            }}
                            className="grid aspect-square place-items-center rounded-lg border border-[#e1e6ef] bg-[#f8f9fc] font-display text-base font-semibold transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7f9fc] p-3 text-sm font-bold">
                <input type="checkbox" className="size-4 accent-[var(--color-sky-600)]" />
                {tx("Keep the child’s original spelling or calculation", "Originale Schreibweise oder Rechnung beibehalten")}
              </label>
              <div className="mt-5 flex items-center justify-between border-t border-[#edf0f5] pt-4">
                <button disabled={question === 0} onClick={() => setQuestion((n) => n - 1)} className="min-h-10 rounded-lg px-3 text-sm font-bold text-ink-soft disabled:opacity-35"><ArrowLeft className="mr-1 inline size-4" />{tx("Previous", "Zurück")}</button>
                <label className={cx("flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold", verified[question] ? "bg-mint-50 text-mint-700" : "bg-[#eef4ff] text-sky-700")}>
                  <input type="checkbox" checked={verified[question]} onChange={(e) => setVerified((all) => all.map((x, i) => i === question ? e.target.checked : x))} className="size-4 accent-[var(--color-mint-500)]" />
                  {verified[question] ? tx("Verified", "Geprüft") : tx("Mark verified", "Als geprüft markieren")}
                </label>
                <button disabled={question === reviewQuestions.length - 1} onClick={() => setQuestion((n) => n + 1)} className="min-h-10 rounded-lg px-3 text-sm font-bold text-sky-700 disabled:opacity-35">{tx("Next", "Weiter")}<ArrowRight className="ml-1 inline size-4" /></button>
              </div>
            </div>
            <div className="border-t border-[#edf0f5] bg-[#f8faff] p-4">
              <div className="mb-3 flex items-center justify-between text-sm"><span className="font-bold">{tx("Verification progress", "Prüffortschritt")}</span><span>{verified.filter(Boolean).length}/{verified.length}</span></div>
              <ProgressBar value={verified.filter(Boolean).length} max={verified.length} className="mb-4" />
              <button disabled={!verified.every(Boolean)} onClick={() => { setStep(2); setQuestion(0); }} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white disabled:bg-ink/15">
                <Sparkles className="size-4" /> {tx("Approve text & start AI grading", "Text freigeben & KI-Bewertung starten")}
              </button>
              {!verified.every(Boolean) && <p className="mt-2 text-center text-xs text-ink-soft">{tx("Verify every answer before continuing.", "Prüfen Sie jede Antwort, bevor Sie fortfahren.")}</p>}
            </div>
          </TeacherCard>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 xl:grid-cols-[230px_1fr_330px]">
          <TeacherCard className="h-fit p-3">
            <p className="px-2 pb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">{tx("Questions", "Fragen")}</p>
            <div className="space-y-1">
              {reviewQuestions.map((item, i) => (
                <button key={item.n} onClick={() => setQuestion(i)} className={cx("flex w-full items-center gap-3 rounded-xl p-3 text-left", i === question ? "bg-[#e8f0fd] text-sky-700" : "hover:bg-cloud")}>
                  <span className={cx("grid size-8 place-items-center rounded-lg text-sm font-extrabold", accepted[i] ? "bg-mint-400 text-white" : item.proposed === item.max ? "bg-mint-50 text-mint-700" : "bg-coral-50 text-coral-700")}>{accepted[i] ? <Check className="size-4" /> : item.n}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-bold">{tx("Question", "Frage")} {item.n}</span><span className="block truncate text-xs text-ink-soft">{marks[i]}/{item.max} {tx("points", "Punkte")}</span></span>
                </button>
              ))}
            </div>
            <button onClick={() => setAccepted(reviewQuestions.map(() => true))} className="mt-3 min-h-10 w-full rounded-xl border border-mint-200 bg-mint-50 text-xs font-extrabold text-mint-700">{tx("Accept all marks", "Alle Noten annehmen")}</button>
          </TeacherCard>

          <div className="space-y-5">
            <TeacherCard className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#edf0f5] px-5 py-4">
                <h2 className="text-lg font-semibold">{tx("Question", "Frage")} {q.n}</h2>
                <span className="rounded-full bg-grape-100 px-2.5 py-1 text-xs font-extrabold text-grape-600"><Sparkles className="mr-1 inline size-3.5" />{tx("AI proposed", "KI-Vorschlag")}</span>
                <Confidence value={q.confidence} />
                <span className="ml-auto font-display text-2xl font-semibold">{marks[question]} / {q.max}</span>
              </div>
              <div className="p-5">
                <p className="font-bold">{q.prompt}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-[#f7f9fc] p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{tx("Student answer", "Antwort")}</p><p className="mt-2 font-hand text-2xl text-[#2e468d]">{extracted[question]}</p></div>
                  <div className="rounded-xl bg-grape-100/60 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-grape-600">{tx("AI reasoning", "KI-Begründung")}</p><p className="mt-2 text-sm leading-relaxed">{q.reason}</p></div>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <label><span className="mb-1 block text-xs font-extrabold text-ink-soft">{tx("Teacher mark", "Lehrkraft-Note")}</span><select value={marks[question]} onChange={(e) => setMarks((all) => all.map((x, i) => i === question ? Number(e.target.value) : x))} className="min-h-11 rounded-xl border border-[#cfd7e4] bg-white px-4 font-bold">{Array.from({ length: q.max + 1 }, (_, i) => <option key={i} value={i}>{i} / {q.max}</option>)}</select></label>
                  <label className="min-w-[220px] flex-1"><span className="mb-1 block text-xs font-extrabold text-ink-soft">{tx("Override reason (optional)", "Grund für Änderung (optional)")}</span><input placeholder={tx("Add a short reason…", "Kurzen Grund hinzufügen…")} className="min-h-11 w-full rounded-xl border border-[#cfd7e4] px-3 outline-none focus:border-sky-400" /></label>
                  <button onClick={() => setAccepted((all) => all.map((x, i) => i === question ? true : x))} className={cx("min-h-11 rounded-xl px-4 text-sm font-extrabold", accepted[question] ? "bg-mint-50 text-mint-700 ring-1 ring-mint-200" : "bg-sky-600 text-white")}>{accepted[question] ? tx("Accepted", "Angenommen") : tx("Accept mark", "Note annehmen")}</button>
                </div>
              </div>
            </TeacherCard>
            <TeacherCard className="p-5">
              <div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold">{tx("Student feedback", "Rückmeldung")}</h3><p className="text-xs text-ink-soft">{tx("AI draft — edit before release", "KI-Entwurf – vor Freigabe bearbeiten")}</p></div><span className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-700">{tx("Grade 4 reading level", "Lesestufe Klasse 4")}</span></div>
              <textarea value={feedback[question]} onChange={(e) => setFeedback((all) => all.map((x, i) => i === question ? e.target.value : x))} rows={4} className="w-full rounded-xl border border-[#cfd7e4] p-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
              <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft"><Languages className="size-4" /> English <span className="ml-auto">{feedback[question].length} {tx("characters", "Zeichen")}</span></div>
            </TeacherCard>
          </div>

          <TeacherCard className="h-fit overflow-hidden xl:sticky xl:top-24">
            <div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="font-semibold">{tx("Grade summary", "Notenübersicht")}</h2></div>
            <div className="p-5">
              <div className="flex items-baseline justify-between"><span className="text-sm font-bold text-ink-soft">{tx("Current total", "Aktuell")}</span><span className="font-display text-4xl font-semibold">{score}<small className="text-lg text-ink-soft">/{max}</small></span></div>
              <p className="mt-1 text-right text-sm font-bold text-sky-700">{Math.round((score / max) * 100)}%</p>
              <div className="mt-5 space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-ink-soft">{tx("AI total", "KI-Gesamt")}</span><b>{reviewQuestions.reduce((a, b) => a + b.proposed, 0)}/{max}</b></p>
                <p className="flex justify-between"><span className="text-ink-soft">{tx("Teacher changes", "Änderungen")}</span><b>{marks.filter((m, i) => m !== reviewQuestions[i].proposed).length}</b></p>
                <p className="flex justify-between"><span className="text-ink-soft">{tx("Accepted", "Angenommen")}</span><b>{accepted.filter(Boolean).length}/{accepted.length}</b></p>
              </div>
              <button disabled={!accepted.every(Boolean)} onClick={() => setStep(3)} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white disabled:bg-ink/15">{tx("Continue to findings", "Weiter zu Befunden")}<ArrowRight className="size-4" /></button>
            </div>
          </TeacherCard>
        </div>
      )}

      {step === 3 && <FindingsReview studentName={submission.student} questions={reviewQuestions} tx={tx} onBack={() => setStep(2)} onContinue={() => setStep(4)} />}

      {step === 4 && (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <TeacherCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4"><div><h2 className="text-lg font-semibold">{tx("Student view preview", "Vorschau der Schüleransicht")}</h2><p className="text-xs text-ink-soft">{tx(`This is exactly what ${studentFirstName} will see.`, `So sieht ${studentFirstName} das Ergebnis.`)}</p></div><span className="rounded-full bg-[#e8f0fd] px-2.5 py-1 text-xs font-extrabold text-sky-700"><Eye className="mr-1 inline size-3.5" />{tx("Preview", "Vorschau")}</span></div>
            <div className="bg-[#fff8ee] p-5 sm:p-8">
              <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-sm font-extrabold uppercase tracking-wide text-sky-600">Learnie · {tx("My Results", "Meine Ergebnisse")}</p><h3 className="mt-1 text-3xl">{submission.exam}</h3><p className="text-ink-soft">{submission.student} · {tx("Checked by Ms. Weber", "Geprüft von Frau Weber")}</p></div>
                  <div className="rounded-2xl bg-mint-50 p-4 text-center"><p className="text-xs font-extrabold uppercase text-mint-700">{tx("Your score", "Dein Ergebnis")}</p><p className="font-display text-4xl font-semibold text-mint-700">{Math.round((score / max) * 100)}%</p><p className="text-sm font-bold">{score}/{max}</p></div>
                </div>
                <div className="mt-5 rounded-2xl bg-sky-50 p-4"><p className="font-display text-lg">{tx("A note from Ms. Weber", "Eine Nachricht von Frau Weber")}</p><p className="mt-1">{overall}</p></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {reviewQuestions.slice(0, 4).map((item, i) => <div key={item.n} className="flex items-center gap-3 rounded-xl border border-[#e1e6ef] p-3"><span className={cx("grid size-8 place-items-center rounded-full text-white", marks[i] === item.max ? "bg-mint-400" : "bg-coral-400")}>{marks[i] === item.max ? <Check className="size-4" /> : <X className="size-4" />}</span><span className="flex-1 text-sm font-bold">{tx("Question", "Frage")} {item.n}</span><b>{marks[i]}/{item.max}</b></div>)}
                </div>
              </div>
            </div>
          </TeacherCard>
          <TeacherCard className="h-fit p-5 xl:sticky xl:top-24">
            <h2 className="text-lg font-semibold">{tx("Release checklist", "Freigabe-Checkliste")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{tx("Nothing reaches the student until you confirm.", "Nichts erreicht die Lernenden ohne Ihre Freigabe.")}</p>
            <div className="mt-5 space-y-2">
              {[
                tx("All marks are reviewed", "Alle Noten sind geprüft"),
                tx("Feedback uses student-friendly language", "Feedback ist kindgerecht formuliert"),
                tx("Findings and support message are correct", "Befunde und Hilfen sind korrekt"),
              ].map((label, i) => (
                <label key={label} className={cx("flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm font-bold ring-1", releaseChecks[i] ? "bg-mint-50 text-mint-700 ring-mint-200" : "bg-[#f8f9fc] ring-[#dfe5ef]")}>
                  <input type="checkbox" checked={releaseChecks[i]} onChange={(e) => setReleaseChecks((all) => all.map((x, j) => j === i ? e.target.checked : x))} className="mt-0.5 size-4 accent-[var(--color-mint-500)]" />{label}
                </label>
              ))}
            </div>
            <label className="mt-4 block"><span className="mb-1.5 block text-xs font-extrabold text-ink-soft">{tx("Overall feedback", "Gesamtrückmeldung")}</span><textarea value={overall} onChange={(e) => setOverall(e.target.value)} rows={4} className="w-full rounded-xl border border-[#cfd7e4] p-3 text-sm outline-none focus:border-sky-400" /></label>
            <button disabled={!releaseChecks.every(Boolean)} onClick={onReleased} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-mint-500 px-4 text-sm font-extrabold text-white disabled:bg-ink/15"><Send className="size-4" />{tx("Confirm & release results", "Bestätigen & freigeben")}</button>
            <p className="mt-3 flex items-start gap-2 text-xs text-ink-soft"><ShieldCheck className="size-4 shrink-0" />{tx(`${studentFirstName} will receive a notification. You can reopen the result later if a correction is needed.`, `${studentFirstName} erhält eine Benachrichtigung. Bei Bedarf können Sie das Ergebnis später erneut öffnen.`)}</p>
            <button onClick={() => setStep(3)} className="mt-4 w-full text-sm font-extrabold text-sky-700">{tx("Back to findings", "Zurück zu Befunden")}</button>
          </TeacherCard>
        </div>
      )}

      {reuploadOpen && (
        <Overlay title={tx("Request a new upload", "Neuen Upload anfordern")} onClose={() => setReuploadOpen(false)}>
          <p className="text-sm text-ink-soft">{tx("Tell the student exactly what needs to be fixed.", "Sagen Sie genau, was verbessert werden muss.")}</p>
          <textarea value={reuploadReason} onChange={(e) => setReuploadReason(e.target.value)} rows={4} className="mt-4 w-full rounded-xl border border-[#cfd7e4] p-3 outline-none focus:border-sky-400" />
          <div className="mt-5 flex justify-end gap-2"><button onClick={() => setReuploadOpen(false)} className="min-h-10 rounded-xl border border-[#dfe5ef] px-4 text-sm font-bold">{tx("Cancel", "Abbrechen")}</button><button onClick={onReupload} className="min-h-10 rounded-xl bg-coral-500 px-4 text-sm font-extrabold text-white">{tx("Send request", "Anfrage senden")}</button></div>
        </Overlay>
      )}
    </>
  );
}

function FindingsReview({ studentName, questions, tx, onBack, onContinue }: { studentName: string; questions: ReviewQuestion[]; tx: Tx; onBack: () => void; onContinue: () => void }) {
  const misconceptionEvidence = questions.filter((q) => q.misconception);
  const answersToReview = questions.filter((q) => q.proposed < q.max);
  const hasMisconception = misconceptionEvidence.length > 0;
  const needsSupport = answersToReview.length >= 3;
  const [misconception, setMisconception] = useState<"pending" | "confirmed" | "dismissed">(hasMisconception ? "pending" : "dismissed");
  const [flag, setFlag] = useState<"pending" | "confirmed" | "dismissed">(needsSupport ? "pending" : "dismissed");
  const [note, setNote] = useState(tx("Draw fraction bars before comparing.", "Vor dem Vergleichen Bruchstreifen zeichnen."));
  const [editingFinding, setEditingFinding] = useState(false);
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">(needsSupport ? "Medium" : "Low");
  const firstName = studentName.split(" ")[0];
  const evidence = (misconceptionEvidence.length ? misconceptionEvidence : answersToReview).slice(0, 2);
  const findingTitle = misconceptionEvidence[0]?.misconception ?? tx("No recurring misconception detected", "Keine wiederkehrende Fehlvorstellung erkannt");
  const [findingText, setFindingText] = useState(findingTitle);
  const supportCopy = needsSupport
    ? tx(
        `${firstName} has ${answersToReview.length} answers requiring support in this exam, with a related pattern in earlier work.`,
        `${firstName} hat in dieser Arbeit ${answersToReview.length} Antworten mit Unterstützungsbedarf und ein ähnliches Muster in früheren Arbeiten.`,
      )
    : answersToReview.length > 0
      ? tx(
          `${firstName} has ${answersToReview.length} answer${answersToReview.length === 1 ? "" : "s"} to review. Targeted practice is recommended, but no support flag is needed.`,
          `${firstName} hat ${answersToReview.length} Antwort${answersToReview.length === 1 ? "" : "en"} zu prüfen. Gezielte Übung wird empfohlen, ein Unterstützungshinweis ist aber nicht nötig.`,
        )
      : tx(
          `${firstName} answered every question correctly. No support flag is recommended.`,
          `${firstName} hat alle Fragen richtig beantwortet. Es wird kein Unterstützungshinweis empfohlen.`,
        );
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_350px]">
      <div className="space-y-5">
        <TeacherCard className="p-5">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-grape-100 text-grape-600"><Sparkles className="size-5" /></span>
            <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{tx("Proposed misconception", "Vorgeschlagene Fehlvorstellung")}</h2><span className="rounded-full bg-sun-50 px-2.5 py-1 text-xs font-extrabold text-sun-700">86% {tx("confidence", "Sicherheit")}</span></div><p className="mt-1 text-sm text-ink-soft">{tx("AI finding — not visible to the student until confirmed", "KI-Befund – bis zur Bestätigung nicht sichtbar")}</p></div>
          </div>
          <div className="mt-5 rounded-xl bg-[#f7f9fc] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{tx("Finding", "Befund")}</p>
              {misconception !== "pending" && <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase", misconception === "confirmed" ? "bg-mint-100 text-mint-700" : "bg-ink/10 text-ink-soft")}>{misconception === "confirmed" ? tx("Confirmed", "Bestätigt") : tx("Dismissed", "Verworfen")}</span>}
            </div>
            {editingFinding ? (
              <input value={findingText} onChange={(e) => setFindingText(e.target.value)} className="mt-2 min-h-10 w-full rounded-lg border border-sky-300 bg-white px-3 font-bold outline-none ring-2 ring-sky-100" autoFocus />
            ) : <p className="mt-1 font-bold">{findingText}</p>}
            <p className="mt-2 text-sm text-ink-soft">{hasMisconception ? tx(`Supported by ${misconceptionEvidence.length} answer${misconceptionEvidence.length === 1 ? "" : "s"} in this exam and earlier evidence.`, `Belegt durch ${misconceptionEvidence.length} Antwort${misconceptionEvidence.length === 1 ? "" : "en"} in dieser Arbeit und frühere Belege.`) : tx("The current answers do not show a repeated misconception.", "Die aktuellen Antworten zeigen keine wiederkehrende Fehlvorstellung.")}</p>
          </div>
          {!!evidence.length && <div className="mt-4 grid gap-3 sm:grid-cols-2">{evidence.map((item) => <Evidence key={item.n} label={tx(`Question ${item.n}`, `Frage ${item.n}`)} answer={item.scan || tx("Blank answer", "Leere Antwort")} />)}</div>}
          <label className="mt-4 block"><span className="mb-1.5 block text-sm font-bold">{tx("Student-friendly note", "Kindgerechte Notiz")}</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-xl border border-[#cfd7e4] p-3 outline-none focus:border-sky-400" /></label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setMisconception("confirmed")} className={cx("min-h-10 rounded-xl px-4 text-sm font-extrabold", misconception === "confirmed" ? "bg-mint-50 text-mint-700 ring-1 ring-mint-200" : "bg-mint-500 text-white")}><Check className="mr-1 inline size-4" />{misconception === "confirmed" ? tx("Confirmed", "Bestätigt") : tx("Confirm", "Bestätigen")}</button>
            <button onClick={() => setEditingFinding((v) => !v)} className={cx("min-h-10 rounded-xl border px-4 text-sm font-bold", editingFinding ? "border-sky-300 bg-sky-50 text-sky-700" : "border-[#dfe5ef]")}><Pencil className="mr-1 inline size-4" />{editingFinding ? tx("Done editing", "Bearbeitung fertig") : tx("Edit", "Bearbeiten")}</button>
            <button onClick={() => setMisconception("dismissed")} className={cx("min-h-10 rounded-xl border px-4 text-sm font-bold", misconception === "dismissed" ? "border-ink/20 bg-ink/5 text-ink" : "border-[#dfe5ef] text-ink-soft")}>{misconception === "dismissed" ? tx("Dismissed", "Verworfen") : tx("Dismiss", "Verwerfen")}</button>
          </div>
        </TeacherCard>

        <TeacherCard className="p-5">
          <div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-coral-50 text-coral-700"><Flag className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{tx("Proposed support flag", "Vorgeschlagener Unterstützungsbedarf")}</h2><span className={cx("rounded-full px-2.5 py-1 text-xs font-extrabold", severity === "High" ? "bg-coral-100 text-coral-700" : severity === "Medium" ? "bg-sun-50 text-sun-700" : "bg-sky-50 text-sky-700")}>{severity === "High" ? tx("High", "Hoch") : severity === "Medium" ? tx("Medium", "Mittel") : tx("Low", "Niedrig")}</span>{flag !== "pending" && <span className={cx("rounded-full px-2.5 py-1 text-xs font-extrabold", flag === "confirmed" ? "bg-mint-50 text-mint-700" : "bg-ink/5 text-ink-soft")}>{flag === "confirmed" ? tx("Confirmed", "Bestätigt") : tx("Dismissed", "Verworfen")}</span>}</div><p className="mt-1 text-sm text-ink-soft">{tx("Repeated difficulty across two assessments", "Wiederholte Schwierigkeit in zwei Arbeiten")}</p></div></div>
          <div className={cx("mt-4 rounded-xl border p-4", needsSupport ? "border-coral-100 bg-coral-50/50" : "border-mint-100 bg-mint-50/50")}><p className="text-sm leading-relaxed">{supportCopy}</p></div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setFlag("confirmed")} className={cx("min-h-10 rounded-xl px-4 text-sm font-extrabold", flag === "confirmed" ? "bg-mint-50 text-mint-700 ring-1 ring-mint-200" : "bg-coral-500 text-white")}>{flag === "confirmed" ? tx("Support confirmed", "Unterstützung bestätigt") : tx("Confirm support need", "Unterstützung bestätigen")}</button>
            <button onClick={() => setFlag("dismissed")} className={cx("min-h-10 rounded-xl border px-4 text-sm font-bold", flag === "dismissed" ? "border-ink/20 bg-ink/5" : "border-[#dfe5ef]")}>{flag === "dismissed" ? tx("Dismissed", "Verworfen") : tx("Dismiss", "Verwerfen")}</button>
            <button onClick={() => setSeverity((v) => v === "Low" ? "Medium" : v === "Medium" ? "High" : "Low")} className="min-h-10 rounded-xl border border-[#dfe5ef] px-4 text-sm font-bold"><RefreshCw className="mr-1 inline size-4" />{tx("Change severity", "Dringlichkeit ändern")}</button>
          </div>
        </TeacherCard>
      </div>
      <TeacherCard className="h-fit p-5 xl:sticky xl:top-24">
        <h2 className="text-lg font-semibold">{tx("Findings summary", "Befundübersicht")}</h2>
        <div className="mt-4 space-y-3">
          <SummaryRow label={tx("Weak concepts", "Schwache Konzepte")} value="2" />
          <SummaryRow label={tx("Recurring mistakes", "Wiederkehrende Fehler")} value="1" />
          <SummaryRow label={tx("Misconceptions", "Fehlvorstellungen")} value={misconception === "confirmed" ? "1 confirmed" : misconception} />
          <SummaryRow label={tx("Support flags", "Unterstützungshinweise")} value={flag === "confirmed" ? "1 confirmed" : flag} />
        </div>
        <div className="mt-5 rounded-xl bg-[#eef4ff] p-4 text-sm"><p className="font-bold text-sky-700">{tx("Teacher stays in control", "Die Lehrkraft entscheidet")}</p><p className="mt-1 text-ink-soft">{tx(`Only confirmed findings appear in ${firstName}’s results and practice plan.`, `Nur bestätigte Befunde erscheinen in den Ergebnissen und im Übungsplan von ${firstName}.`)}</p></div>
        <button disabled={misconception === "pending" || flag === "pending"} onClick={onContinue} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white disabled:bg-ink/15">{tx("Preview student results", "Ergebnisvorschau")}<ArrowRight className="size-4" /></button>
        <button onClick={onBack} className="mt-3 w-full text-sm font-extrabold text-sky-700">{tx("Back to grades", "Zurück zu Noten")}</button>
      </TeacherCard>
    </div>
  );
}

function Evidence({ label, answer }: { label: string; answer: string }) {
  return <div className="rounded-xl border border-[#e1e6ef] bg-white p-3"><p className="text-xs font-extrabold text-ink-soft">{label}</p><p className="mt-1 font-hand text-xl text-[#2e468d]">{answer}</p></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <p className="flex items-center justify-between rounded-xl bg-[#f7f9fc] px-3 py-2.5 text-sm"><span className="text-ink-soft">{label}</span><b className="capitalize">{value}</b></p>;
}

function IconAction({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-lg border border-[#dfe5ef] bg-white text-sm font-bold hover:bg-cloud">{children}</button>;
}

function StudentsView({ tx, onOpen }: { tx: Tx; onOpen: (s: TeacherStudent) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "support" | "improving">("all");
  const [sort, setSort] = useState<"name" | "average" | "support">("name");
  const students = TEACHER_STUDENTS
    .filter((s) => {
      const match = s.name.toLowerCase().includes(search.toLowerCase());
      if (filter === "support") return match && ["pending", "confirmed"].includes(s.support);
      if (filter === "improving") return match && s.trend > 0;
      return match;
    })
    .sort((a, b) => sort === "average" ? b.average - a.average : sort === "support" ? supportRank(a.support) - supportRank(b.support) : a.name.localeCompare(b.name));
  return (
    <>
      <PageTitle title={tx("Students", "Lernende")} subtitle={tx("Grade 4A · 24 students · current term", "Klasse 4A · 24 Lernende · aktuelles Halbjahr")} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Class average", "Klassendurchschnitt")}</p><p className="mt-1 font-display text-3xl font-semibold">73%</p><p className="mt-1 text-xs font-bold text-mint-700"><TrendingUp className="mr-1 inline size-3.5" />+4%</p></TeacherCard>
        <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Need support", "Brauchen Hilfe")}</p><p className="mt-1 font-display text-3xl font-semibold">3</p><p className="mt-1 text-xs text-ink-soft">{tx("2 confirmed · 1 pending", "2 bestätigt · 1 offen")}</p></TeacherCard>
        <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Practice completion", "Übungsabschluss")}</p><p className="mt-1 font-display text-3xl font-semibold">78%</p><p className="mt-1 text-xs text-ink-soft">{tx("18 of 23 assigned", "18 von 23 Aufgaben")}</p></TeacherCard>
      </div>
      <TeacherCard className="mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-h-11 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[#dfe5ef] bg-[#f8f9fc] px-3"><Search className="size-4 text-ink-soft" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tx("Search by name…", "Nach Namen suchen…")} className="flex-1 bg-transparent text-sm outline-none" /></label>
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>{tx("All students", "Alle")}</FilterPill>
          <FilterPill active={filter === "support"} onClick={() => setFilter("support")}>{tx("Needs support", "Braucht Hilfe")}</FilterPill>
          <FilterPill active={filter === "improving"} onClick={() => setFilter("improving")}>{tx("Improving", "Verbessert")}</FilterPill>
          <button onClick={() => setSort((v) => v === "name" ? "average" : v === "average" ? "support" : "name")} className="min-h-10 rounded-xl border border-[#dfe5ef] px-3 text-sm font-bold text-ink-soft"><ListFilter className="mr-1 inline size-4" />{sort === "name" ? tx("Sort: Name", "Sortieren: Name") : sort === "average" ? tx("Sort: Average", "Sortieren: Schnitt") : tx("Sort: Support", "Sortieren: Unterstützung")}</button>
        </div>
      </TeacherCard>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid content-start gap-4 sm:grid-cols-2">
          {students.map((s, index) => (
            <TeacherCard key={s.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg">
              <div className="grid min-h-[178px] grid-cols-[1fr_128px]">
                <div className="flex min-w-0 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-[#162b4d]">{s.name}</h2>
                      <p className="mt-0.5 text-xs text-ink-soft">{tx("Last active", "Zuletzt aktiv")}: {s.lastSeen}</p>
                    </div>
                    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-extrabold", s.trend >= 0 ? "bg-mint-50 text-mint-700" : "bg-coral-50 text-coral-700")}>
                      {s.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {s.trend > 0 ? "+" : ""}{s.trend}%
                    </span>
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold">{s.average}% <span className="font-sans text-xs font-bold text-ink-soft">{tx("average", "Schnitt")}</span></p>
                  <p className="mt-3 truncate text-sm font-bold">{s.focus.en}</p>
                  <div className="mt-2"><SupportBadge state={s.support} tx={tx} /></div>
                </div>
                <div className={cx("relative grid place-items-center overflow-hidden", index % 4 === 0 ? "bg-[#e5efff]" : index % 4 === 1 ? "bg-mint-50" : index % 4 === 2 ? "bg-sun-50" : "bg-grape-100/70")}>
                  <span className="absolute -right-7 -top-7 size-20 rounded-full bg-white/45" />
                  <StudentAvatar student={s} size={94} index={index} />
                </div>
              </div>
              <button onClick={() => onOpen(s)} className="flex min-h-12 w-full items-center justify-center gap-2 border-t border-[#edf0f5] bg-white text-sm font-extrabold text-sky-700 transition group-hover:bg-[#f8fbff]">
                {tx("Review student", "Lernende/n ansehen")} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </button>
            </TeacherCard>
          ))}
          {!students.length && <TeacherCard className="col-span-full p-8 text-center text-ink-soft">{tx("No students match these filters.", "Keine Lernenden entsprechen diesen Filtern.")}</TeacherCard>}
        </div>

        <Leaderboard tx={tx} onOpen={onOpen} />
      </div>
    </>
  );
}

function supportRank(state: TeacherStudent["support"]) {
  return state === "confirmed" ? 0 : state === "pending" ? 1 : state === "resolved" ? 2 : 3;
}

function StudentAvatar({ student, size = 72, index = 0 }: { student: TeacherStudent; size?: number; index?: number }) {
  const skins = ["#8b5a3c", "#d79b72", "#70432f", "#efc19c", "#b97750", "#f0c8a7", "#965f43", "#d99b75"];
  const hairs = ["#2f211f", "#5a392b", "#18191d", "#8b5a2b", "#2f211f", "#c18b45", "#16191f", "#5d3529"];
  const shirts = ["#4c86f0", "#4fcf9f", "#ff8470", "#9b85f5", "#ffc83d", "#4c86f0", "#4fcf9f", "#ff8470"];
  const skin = skins[index % skins.length];
  const hair = hairs[index % hairs.length];
  const shirt = shirts[index % shirts.length];
  const longHair = index % 3 === 1 || index % 4 === 2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${student.name} avatar`} className="drop-shadow-sm">
      <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,.72)" />
      <path d="M20 96c2-22 14-33 30-33s28 11 30 33" fill={shirt} />
      {longHair && <path d="M29 37c0-18 10-28 22-28 15 0 23 12 22 29l-2 28H28z" fill={hair} />}
      {!longHair && <path d="M29 34C30 16 41 9 53 10c14 1 22 11 20 29-10-6-25-8-44-5z" fill={hair} />}
      <ellipse cx="50" cy="40" rx="20" ry="24" fill={skin} />
      {index % 2 === 0 ? <path d="M30 33c3-17 13-24 25-22 9 1 17 8 18 19-13-8-27-6-43 3z" fill={hair} /> : <path d="M30 31c4-15 15-22 27-19 8 2 14 8 16 17-7-4-12-6-20-7-8 7-14 8-23 9z" fill={hair} />}
      <ellipse cx="43" cy="41" rx="2.2" ry="2.8" fill="#24304d" />
      <ellipse cx="57" cy="41" rx="2.2" ry="2.8" fill="#24304d" />
      <path d="M44 52q6 5 12 0" fill="none" stroke="#8a4d43" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="48" r="3" fill="#ef9c8c" opacity=".38" />
      <circle cx="64" cy="48" r="3" fill="#ef9c8c" opacity=".38" />
      <path d="M44 65l6 5 6-5" fill="#fff" opacity=".9" />
    </svg>
  );
}

function Leaderboard({ tx, onOpen }: { tx: Tx; onOpen: (s: TeacherStudent) => void }) {
  const leaders = [...TEACHER_STUDENTS].sort((a, b) => b.average - a.average).slice(0, 4);
  const first = leaders[0];
  return (
    <TeacherCard className="h-fit overflow-hidden xl:sticky xl:top-24">
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#e8f0fd] to-[#f1edff] px-5 py-4">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-sun-700 shadow-sm"><Trophy className="size-5" /></span>
        <div><h2 className="text-xl font-semibold">{tx("Top students", "Top-Lernende")}</h2><p className="text-xs text-ink-soft">{tx("Based on confirmed averages", "Nach bestätigtem Schnitt")}</p></div>
      </div>
      <button onClick={() => onOpen(first)} className="group flex w-full flex-col items-center bg-[#f8f9fc] px-5 py-6 text-center">
        <div className="relative">
          <span className="grid size-28 place-items-center rounded-full bg-white ring-4 ring-sun-300 shadow-lg"><StudentAvatar student={first} size={102} index={TEACHER_STUDENTS.indexOf(first)} /></span>
          <span className="absolute -bottom-2 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-sun-400 font-display text-lg font-semibold text-ink shadow ring-4 ring-[#f8f9fc]">1</span>
        </div>
        <h3 className="mt-5 text-xl font-semibold">{first.name}</h3>
        <p className="font-display text-2xl font-semibold text-sky-700">{first.average}%</p>
        <span className="mt-1 text-xs font-bold text-mint-700">{tx("Highest class average", "Bester Klassenschnitt")}</span>
      </button>
      <ol className="space-y-2 p-4">
        {leaders.slice(1).map((student, i) => (
          <li key={student.id}>
            <button onClick={() => onOpen(student)} className="flex w-full items-center gap-3 rounded-xl bg-[#f7f9fc] p-2.5 text-left transition hover:bg-[#eef4ff]">
              <StudentAvatar student={student} size={46} index={TEACHER_STUDENTS.indexOf(student)} />
              <span className="min-w-0 flex-1"><b className="block truncate text-sm">{student.name}</b><span className="text-xs text-ink-soft">{student.average}% {tx("average", "Schnitt")}</span></span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#cbd4e2] bg-white font-display font-semibold">{i + 2}</span>
            </button>
          </li>
        ))}
      </ol>
    </TeacherCard>
  );
}

function SupportBadge({ state, tx }: { state: TeacherStudent["support"]; tx: Tx }) {
  const labels = {
    none: tx("On track", "Auf Kurs"),
    pending: tx("Review needed", "Prüfung nötig"),
    confirmed: tx("Support active", "Hilfe aktiv"),
    resolved: tx("Resolved", "Gelöst"),
  };
  return <span className={cx("rounded-full px-2.5 py-1 text-xs font-extrabold", state === "none" || state === "resolved" ? "bg-mint-50 text-mint-700" : state === "pending" ? "bg-sun-50 text-sun-700" : "bg-coral-50 text-coral-700")}>{labels[state]}</span>;
}

function StudentProfile({ student, tx, onBack, notify }: { student: TeacherStudent; tx: Tx; onBack: () => void; notify: (t: string) => void }) {
  const [tab, setTab] = useState<"overview" | "exams" | "gaps" | "quizzes" | "notes">("overview");
  const [privateNote, setPrivateNote] = useState(tx("Check in during independent work on Thursday.", "Am Donnerstag bei der Einzelarbeit nachfragen."));
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <button onClick={onBack} className="grid size-10 place-items-center rounded-xl border border-[#dfe5ef] bg-white"><ArrowLeft className="size-5" /></button>
        <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-[#dce8fb]"><StudentAvatar student={student} size={62} index={TEACHER_STUDENTS.indexOf(student)} /></span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-semibold text-[#162b4d]">{student.name}</h1><SupportBadge state={student.support} tx={tx} /></div><p className="text-sm text-ink-soft">{tx("Grade 4A · Student profile", "Klasse 4A · Lernprofil")} · {tx("Last active", "Zuletzt aktiv")} {student.lastSeen}</p></div>
        <button onClick={() => notify(tx(`Message composer opened for ${student.name}.`, `Nachricht an ${student.name} geöffnet.`))} className="min-h-10 rounded-xl border border-[#dfe5ef] bg-white px-4 text-sm font-bold"><Mail className="mr-1 inline size-4" />{tx("Message", "Nachricht")}</button>
        <button onClick={() => notify(tx("Practice recommendation sent.", "Übungsempfehlung gesendet."))} className="min-h-10 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white"><Send className="mr-1 inline size-4" />{tx("Recommend practice", "Übung empfehlen")}</button>
      </div>
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-[#dfe5ef] bg-white p-1">
        {[
          ["overview", "Overview", "Übersicht"],
          ["exams", "Exam history", "Arbeiten"],
          ["gaps", "Learning gaps", "Lernlücken"],
          ["quizzes", "Quizzes & reflection", "Quiz & Reflexion"],
          ["notes", "Private notes", "Private Notizen"],
        ].map(([id, en, de]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={cx("min-h-10 shrink-0 rounded-lg px-4 text-sm font-bold", tab === id ? "bg-[#14284a] text-white" : "text-ink-soft hover:bg-cloud")}>{tx(en, de)}</button>)}
      </div>
      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Current average", "Aktueller Schnitt")}</p><p className="mt-1 font-display text-3xl font-semibold">{student.average}%</p><p className={cx("mt-1 text-xs font-bold", student.trend >= 0 ? "text-mint-700" : "text-coral-700")}>{student.trend > 0 ? "+" : ""}{student.trend}% {tx("change", "Änderung")}</p></TeacherCard>
              <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Concept mastery", "Konzeptstand")}</p><p className="mt-1 font-display text-3xl font-semibold">{student.mastery}%</p><ProgressBar value={student.mastery} tone={student.mastery > 75 ? "mint" : "sun"} className="mt-2" /></TeacherCard>
              <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Quiz activity", "Quiz-Aktivität")}</p><p className="mt-1 font-display text-3xl font-semibold">{student.quizzes}</p><p className="mt-1 text-xs text-ink-soft">{tx("completed this term", "dieses Halbjahr")}</p></TeacherCard>
            </div>
            <TeacherCard className="p-5">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{tx("Performance over time", "Leistung im Verlauf")}</h2><span className="text-xs font-bold text-ink-soft">{tx("Confirmed exams only", "Nur bestätigte Arbeiten")}</span></div>
              <MiniLineChart values={[62, 70, student.previous, student.average]} />
              <div className="mt-3 flex justify-between text-xs font-bold text-ink-soft"><span>Sep 05</span><span>Sep 12</span><span>Sep 25</span><span>Oct 09</span></div>
            </TeacherCard>
            <TeacherCard className="p-5">
              <h2 className="text-lg font-semibold">{tx("Current learning focus", "Aktueller Lernfokus")}</h2>
              <div className="mt-4 flex flex-col gap-4 rounded-xl bg-[#f7f9fc] p-4 sm:flex-row sm:items-center"><span className="grid size-11 place-items-center rounded-xl bg-sun-100 text-sun-700"><Target className="size-5" /></span><div className="flex-1"><p className="font-bold">{student.focus.en}</p><p className="text-sm text-ink-soft">{student.misconception?.en ?? tx("Building fluency through practice", "Sicherheit durch Übung aufbauen")}</p></div><button onClick={() => setTab("gaps")} className="text-sm font-extrabold text-sky-700">{tx("See evidence", "Belege ansehen")} <ArrowRight className="inline size-4" /></button></div>
            </TeacherCard>
          </div>
          <div className="space-y-5">
            <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Follow-up", "Nachverfolgung")}</h2><div className="mt-4 space-y-3"><FollowRow done={student.feedbackRead} label={tx("Read latest feedback", "Letztes Feedback gelesen")} /><FollowRow done={student.quizzes > 1} label={tx("Completed recommended quiz", "Empfohlenes Quiz abgeschlossen")} /><FollowRow done={student.trend > 0} label={tx("Improvement after practice", "Verbesserung nach Übung")} /></div></TeacherCard>
            <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Support status", "Unterstützungsstatus")}</h2><div className="mt-4"><SupportBadge state={student.support} tx={tx} /><p className="mt-3 text-sm leading-relaxed text-ink-soft">{student.support === "confirmed" ? tx("Monitor progress after the next two practice sessions.", "Fortschritt nach den nächsten zwei Übungseinheiten beobachten.") : tx("No active support plan. Continue normal monitoring.", "Kein aktiver Unterstützungsplan. Normal weiter beobachten.")}</p></div></TeacherCard>
          </div>
        </div>
      )}
      {tab === "exams" && <ExamHistory tx={tx} student={student} notify={notify} />}
      {tab === "gaps" && <StudentGaps tx={tx} student={student} />}
      {tab === "quizzes" && <QuizOversight tx={tx} student={student} />}
      {tab === "notes" && (
        <TeacherCard className="max-w-3xl p-5"><div className="flex items-start gap-3 rounded-xl bg-sun-50 p-3 text-sm text-sun-700"><Lock className="mt-0.5 size-4 shrink-0" />{tx("Private notes are visible only to teachers.", "Private Notizen sind nur für Lehrkräfte sichtbar.")}</div><label className="mt-5 block"><span className="mb-1.5 block font-bold">{tx("Note", "Notiz")}</span><textarea value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} rows={6} className="w-full rounded-xl border border-[#cfd7e4] p-3 outline-none focus:border-sky-400" /></label><button onClick={() => notify(tx("Private note saved.", "Private Notiz gespeichert."))} className="mt-3 min-h-10 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white">{tx("Save note", "Notiz speichern")}</button></TeacherCard>
      )}
    </>
  );
}

function MiniLineChart({ values }: { values: number[] }) {
  const pts = values.map((v, i) => `${i * 100 / (values.length - 1)},${100 - v}`).join(" ");
  return <div className="mt-5 h-44 rounded-xl bg-[#f8faff] p-4"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fa3ff" stopOpacity=".28" /><stop offset="1" stopColor="#6fa3ff" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${pts} 100,100`} fill="url(#area)" /><polyline points={pts} fill="none" stroke="#4c86f0" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{values.map((v, i) => <circle key={i} cx={i * 100 / (values.length - 1)} cy={100 - v} r="2.2" fill="#fff" stroke="#4c86f0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}</svg></div>;
}

function FollowRow({ done, label }: { done: boolean; label: string }) {
  return <p className="flex items-center gap-3 text-sm font-bold"><span className={cx("grid size-7 place-items-center rounded-full", done ? "bg-mint-50 text-mint-700" : "bg-sun-50 text-sun-700")}>{done ? <Check className="size-4" /> : <Clock3 className="size-4" />}</span>{label}</p>;
}

function ExamHistory({ tx, student, notify }: { tx: Tx; student: TeacherStudent; notify: (t: string) => void }) {
  const exams = [["Math Exam 1", "Oct 09", student.average], ["English Test", "Sep 25", Math.min(98, student.average + 5)], ["Math Check", "Sep 12", student.previous], ["Science: Plants", "Sep 05", Math.min(96, student.average + 2)]];
  return <TeacherCard className="overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-[#f7f9fc] text-xs uppercase text-ink-soft"><tr><th className="px-5 py-3">{tx("Exam", "Arbeit")}</th><th className="px-4 py-3">{tx("Date", "Datum")}</th><th className="px-4 py-3">{tx("Score", "Ergebnis")}</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-[#edf0f5]">{exams.map(([name, date, score]) => <tr key={name as string}><td className="px-5 py-4 font-bold">{name}</td><td className="px-4 py-4 text-ink-soft">{date}</td><td className="px-4 py-4"><b>{score}%</b></td><td className="px-5 py-4 text-right"><button onClick={() => notify(tx(`${name} evidence opened for ${student.name}.`, `Belege zu ${name} für ${student.name} geöffnet.`))} className="font-extrabold text-sky-700">{tx("Open evidence", "Belege öffnen")}</button></td></tr>)}</tbody></table></TeacherCard>;
}

function StudentGaps({ tx, student }: { tx: Tx; student: TeacherStudent }) {
  return <div className="grid gap-5 xl:grid-cols-2"><TeacherCard className="p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-coral-50 text-coral-700"><Target className="size-5" /></span><div><p className="text-xs font-extrabold uppercase text-coral-700">{tx("Confirmed learning gap", "Bestätigte Lernlücke")}</p><h2 className="text-lg font-semibold">{student.focus.en}</h2></div></div><p className="mt-4 text-sm leading-relaxed text-ink-soft">{student.misconception?.en ?? tx("The student needs more guided examples before independent practice.", "Vor selbstständiger Übung sind weitere angeleitete Beispiele nötig.")}</p><div className="mt-4 grid grid-cols-3 gap-2">{[["Exams", "2"], ["Questions", "5"], ["Since", "Sep 12"]].map(([a,b]) => <div key={a} className="rounded-xl bg-[#f7f9fc] p-3 text-center"><b className="block">{b}</b><span className="text-xs text-ink-soft">{a}</span></div>)}</div></TeacherCard><TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Mistake timeline", "Fehlerverlauf")}</h2><div className="mt-5 space-y-4">{[["Sep 12", 3], ["Oct 03", 1], ["Oct 09", 2]].map(([d,n]) => <div key={d as string} className="flex items-center gap-3"><span className="w-14 text-xs font-bold text-ink-soft">{d}</span><span className="flex flex-1 gap-1">{Array.from({length:3},(_,i)=><i key={i} className={cx("h-3 flex-1 rounded",i < (n as number) ? "bg-coral-300" : "bg-[#edf0f5]")} />)}</span><b className="w-6 text-sm">{n}×</b></div>)}</div><p className="mt-5 rounded-xl bg-sun-50 p-3 text-sm text-sun-700">{tx("Improved after practice, but the pattern returned in the latest exam.", "Nach der Übung verbessert, in der letzten Arbeit aber erneut aufgetreten.")}</p></TeacherCard></div>;
}

function QuizOversight({ tx, student }: { tx: Tx; student: TeacherStudent }) {
  return <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]"><TeacherCard className="overflow-hidden"><div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="text-lg font-semibold">{tx("Quiz activity", "Quiz-Aktivität")}</h2></div>{[["Comparing fractions", "4/5", "Oct 10"],["Fraction warm-up","3/5","Oct 03"],["Times tables","5/5","Sep 29"]].map((q)=><div key={q[0]} className="flex items-center gap-3 border-b border-[#edf0f5] px-5 py-4 last:border-0"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f0fd] text-sky-700"><BookOpenCheck className="size-5" /></span><span className="flex-1"><b className="block">{q[0]}</b><span className="text-xs text-ink-soft">{q[2]}</span></span><b>{q[1]}</b></div>)}</TeacherCard><TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Student said", "Aussage des Kindes")}</h2><p className="mt-1 text-sm text-ink-soft">{tx("Reflection reasons across wrong answers", "Reflexionsgründe bei falschen Antworten")}</p><div className="mt-5 space-y-4">{[["Forgot the rule",45,"coral"],["Wasn't sure",30,"sun"],["Calculation mistake",15,"sky"],["Didn't understand",10,"grape"]].map(([l,v,tone])=><div key={l as string}><div className="mb-1 flex justify-between text-sm"><b>{l}</b><span>{v}%</span></div><ProgressBar value={v as number} tone={tone as "coral"|"sun"|"sky"|"grape"} /></div>)}</div></TeacherCard></div>;
}

function InsightsView({ tx, onConcept, onStudent, notify }: { tx: Tx; onConcept: (c: ConceptInsight) => void; onStudent: (s: TeacherStudent) => void; notify: (t: string) => void }) {
  const [view, setView] = useState<"concepts" | "support">("concepts");
  const [severity, setSeverity] = useState("All levels");
  const [moreFilters, setMoreFilters] = useState(false);
  const [sort, setSort] = useState<"affected" | "trend" | "severity">("affected");
  const [dataSource, setDataSource] = useState("Exam + practice");
  const [dateRange, setDateRange] = useState("This term");
  const [studentGroup, setStudentGroup] = useState("All students");
  const shownConcepts = CONCEPTS
    .filter((c) => severity === "All levels" || c.severity === severity)
    .sort((a, b) => sort === "trend" ? b.trend - a.trend : sort === "severity" ? severityRank(a.severity) - severityRank(b.severity) : b.affected - a.affected);
  return (
    <>
      <PageTitle title={tx("Class learning insights", "Lernanalyse der Klasse")} subtitle={tx("Grade 4A · Math · confirmed exams and practice", "Klasse 4A · Mathe · bestätigte Arbeiten und Übungen")} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterPill active={view === "concepts"} onClick={() => setView("concepts")}>{tx("Concept overview", "Konzeptübersicht")}</FilterPill>
        <FilterPill active={view === "support"} onClick={() => setView("support")}>{tx("Students needing support", "Unterstützungsbedarf")} <b>3</b></FilterPill>
        <div className="ml-auto flex flex-wrap gap-2"><HeaderSelect label={tx("Level", "Stufe")} value={severity} options={["All levels","High","Medium","Low"]} onChange={setSeverity} /><button onClick={() => setMoreFilters((v) => !v)} className={cx("min-h-10 rounded-xl border px-3 text-sm font-bold", moreFilters ? "border-sky-300 bg-sky-50 text-sky-700" : "border-[#dfe5ef] bg-white text-ink-soft")}><Filter className="mr-1 inline size-4" />{moreFilters ? tx("Hide filters", "Filter ausblenden") : tx("More filters", "Mehr Filter")}</button></div>
      </div>
      {moreFilters && (
        <TeacherCard className="mb-5 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <HeaderSelect label={tx("Data source", "Datenquelle")} value={dataSource} options={["Exam + practice", "Exam only", "Practice only"]} onChange={setDataSource} />
            <HeaderSelect label={tx("Date range", "Zeitraum")} value={dateRange} options={["This term", "Last 30 days", "All time"]} onChange={setDateRange} />
            <HeaderSelect label={tx("Student group", "Gruppe")} value={studentGroup} options={["All students", "Needs support", "Improving"]} onChange={setStudentGroup} />
          </div>
        </TeacherCard>
      )}
      {view === "concepts" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Students assessed", "Lernende erfasst")}</p><p className="mt-1 font-display text-3xl font-semibold">24</p></TeacherCard>
            <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Common gaps", "Häufige Lücken")}</p><p className="mt-1 font-display text-3xl font-semibold">4</p></TeacherCard>
            <TeacherCard className="p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{tx("Average performance", "Durchschnitt")}</p><p className="mt-1 font-display text-3xl font-semibold">73%</p></TeacherCard>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <TeacherCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{tx("Performance by concept", "Leistung nach Konzept")}</h2>
                  <p className="text-xs text-ink-soft">{tx("Confirmed exam compared with latest practice", "Bestätigte Arbeit im Vergleich zur letzten Übung")}</p>
                </div>
                <div className="flex gap-3 text-xs font-bold text-ink-soft">
                  <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-sky-500" />{tx("Exam", "Arbeit")}</span>
                  <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-mint-400" />{tx("Practice", "Übung")}</span>
                </div>
              </div>
              <ConceptPerformanceChart />
            </TeacherCard>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <TeacherCard className="p-5">
                <h2 className="text-lg font-semibold">{tx("Class mastery", "Kompetenzstand")}</h2>
                <p className="text-xs text-ink-soft">{tx("Across selected concepts", "Über ausgewählte Konzepte")}</p>
                <MasteryDonut tx={tx} />
              </TeacherCard>
              <TeacherCard className="p-5">
                <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">{tx("Average trend", "Durchschnittstrend")}</h2><p className="text-xs text-ink-soft">{tx("Last four assessments", "Letzte vier Arbeiten")}</p></div><span className="rounded-full bg-mint-50 px-2 py-1 text-xs font-extrabold text-mint-700">+8%</span></div>
                <ClassTrendChart />
              </TeacherCard>
            </div>
          </div>
          <TeacherCard className="mt-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4"><div><h2 className="text-lg font-semibold">{tx("Concepts students struggle with", "Schwierige Konzepte")}</h2><p className="text-xs text-ink-soft">{tx("Select a concept to inspect evidence and act.", "Konzept auswählen, um Belege und Maßnahmen zu sehen.")}</p></div><button onClick={() => setSort((v) => v === "affected" ? "trend" : v === "trend" ? "severity" : "affected")} className="text-sm font-bold text-ink-soft">{sort === "affected" ? tx("Sort: Most affected", "Sortieren: Am meisten betroffen") : sort === "trend" ? tx("Sort: Rising trend", "Sortieren: Steigender Trend") : tx("Sort: Severity", "Sortieren: Dringlichkeit")} <ChevronDown className="inline size-4" /></button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f7f9fc] text-xs uppercase text-ink-soft"><tr><th className="px-5 py-3">{tx("Concept", "Konzept")}</th><th className="px-4 py-3">{tx("Affected", "Betroffen")}</th><th className="px-4 py-3">{tx("Class share", "Klassenanteil")}</th><th className="px-4 py-3">{tx("Trend", "Trend")}</th><th className="px-4 py-3">{tx("Evidence", "Belege")}</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-[#edf0f5]">{shownConcepts.map((c)=><tr key={c.id} className="hover:bg-[#fbfcff]"><td className="px-5 py-4"><b>{c.name.en}</b><span className="block text-xs text-ink-soft">{c.severity} {tx("struggle level", "Schwierigkeitsgrad")}</span></td><td className="px-4 py-4"><b>{c.affected}</b> / 24</td><td className="px-4 py-4"><div className="flex items-center gap-2"><ProgressBar value={c.share} className="w-28" tone={c.severity==="High"?"coral":c.severity==="Medium"?"sun":"sky"} /><b>{c.share}%</b></div></td><td className="px-4 py-4"><span className={cx("inline-flex items-center gap-1 text-xs font-extrabold",c.trend<=0?"text-mint-700":"text-coral-700")}>{c.trend<=0?<TrendingDown className="size-3.5"/>:<TrendingUp className="size-3.5"/>}{Math.abs(c.trend)}%</span></td><td className="px-4 py-4 text-ink-soft">{c.questions} {tx("questions", "Fragen")}<span className="block text-xs">{c.reflection}</span></td><td className="px-5 py-4 text-right"><button onClick={()=>onConcept(c)} className="font-extrabold text-sky-700">{tx("Open", "Öffnen")} <ChevronRight className="inline size-4" /></button></td></tr>)}</tbody></table>
            </div>
          </TeacherCard>
        </>
      ) : (
        <TeacherCard className="overflow-hidden">
          <div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="text-lg font-semibold">{tx("Confirmed and pending support", "Bestätigte und offene Unterstützung")}</h2></div>
          <div className="divide-y divide-[#edf0f5]">{TEACHER_STUDENTS.filter((s)=>["confirmed","pending"].includes(s.support)).map((s)=><div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4"><span className="grid size-12 place-items-center overflow-hidden rounded-xl bg-[#e8f0fd]"><StudentAvatar student={s} size={48} index={TEACHER_STUDENTS.indexOf(s)} /></span><div className="min-w-[180px] flex-1"><b>{s.name}</b><p className="text-sm text-ink-soft">{s.focus.en}</p></div><div className="w-40"><p className="mb-1 text-xs font-bold text-ink-soft">{tx("Topic mastery", "Themenstand")} · {s.mastery}%</p><ProgressBar value={s.mastery} tone={s.mastery<60?"coral":"sun"} /></div><SupportBadge state={s.support} tx={tx}/><button onClick={()=>onStudent(s)} className="min-h-9 rounded-lg bg-[#e8f0fd] px-3 text-sm font-extrabold text-sky-700">{tx("Review student", "Lernende/n prüfen")}</button></div>)}</div>
          <div className="border-t border-[#edf0f5] bg-[#f8faff] p-4"><button onClick={()=>notify(tx("Support follow-up list exported.","Unterstützungsliste exportiert."))} className="text-sm font-extrabold text-sky-700">{tx("Export support follow-up", "Unterstützungsliste exportieren")}</button></div>
        </TeacherCard>
      )}
    </>
  );
}

function severityRank(severity: ConceptInsight["severity"]) {
  return severity === "High" ? 0 : severity === "Medium" ? 1 : 2;
}

function ConceptPerformanceChart() {
  const rows = [
    { label: "Num. vs den.", exam: 58, practice: 71 },
    { label: "Different den.", exam: 69, practice: 76 },
    { label: "Equivalent", exam: 82, practice: 88 },
    { label: "Word problems", exam: 65, practice: 72 },
  ];
  return (
    <div className="mt-6">
      <div className="relative ml-10 h-56 border-b border-l border-[#dfe5ef]">
        {[25, 50, 75, 100].map((v) => (
          <span key={v} className="absolute inset-x-0 border-t border-dashed border-[#e6eaf1]" style={{ bottom: `${v}%` }}>
            <small className="absolute -left-10 -top-2 w-8 text-right text-[10px] font-bold text-ink-soft">{v}%</small>
          </span>
        ))}
        <div className="absolute inset-0 flex items-end justify-around gap-3 px-3">
          {rows.map((row) => (
            <div key={row.label} className="flex h-full flex-1 flex-col justify-end">
              <div className="flex flex-1 items-end justify-center gap-1.5">
                <span className="w-[28%] max-w-7 rounded-t-md bg-sky-500 transition-all hover:brightness-110" style={{ height: `${row.exam}%` }} title={`${row.exam}%`} />
                <span className="w-[28%] max-w-7 rounded-t-md bg-mint-400 transition-all hover:brightness-110" style={{ height: `${row.practice}%` }} title={`${row.practice}%`} />
              </div>
              <span className="mt-2 min-h-8 text-center text-[10px] font-bold leading-tight text-ink-soft">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MasteryDonut({ tx }: { tx: Tx }) {
  return (
    <div className="mt-5 flex items-center gap-5">
      <div className="relative size-32 shrink-0 rounded-full" style={{ background: "conic-gradient(#4fcf9f 0 46%, #ffc83d 46% 75%, #ff8470 75% 100%)" }}>
        <div className="absolute inset-[16px] grid place-items-center rounded-full bg-white text-center">
          <span><b className="block font-display text-2xl">73%</b><small className="font-bold text-ink-soft">{tx("average", "Schnitt")}</small></span>
        </div>
      </div>
      <div className="min-w-0 space-y-3 text-xs">
        <p className="flex items-center gap-2"><i className="size-3 rounded-sm bg-mint-400" /><span className="flex-1 text-ink-soft">{tx("Secure", "Sicher")}</span><b>46%</b></p>
        <p className="flex items-center gap-2"><i className="size-3 rounded-sm bg-sun-400" /><span className="flex-1 text-ink-soft">{tx("Developing", "Im Aufbau")}</span><b>29%</b></p>
        <p className="flex items-center gap-2"><i className="size-3 rounded-sm bg-coral-400" /><span className="flex-1 text-ink-soft">{tx("Needs support", "Braucht Hilfe")}</span><b>25%</b></p>
      </div>
    </div>
  );
}

function ClassTrendChart() {
  const values = [65, 69, 71, 73];
  const points = values.map((v, i) => `${8 + i * 28},${92 - v}`).join(" ");
  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 44" className="h-24 w-full overflow-visible">
        <defs>
          <linearGradient id="teacherTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fa3ff" stopOpacity=".28" />
            <stop offset="1" stopColor="#6fa3ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M8,44 L${points.split(" ").join(" L")} L92,44 Z`} fill="url(#teacherTrend)" />
        <polyline points={points} fill="none" stroke="#4c86f0" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => <circle key={i} cx={8 + i * 28} cy={92 - v} r="2.5" fill="#fff" stroke="#4c86f0" strokeWidth="1.7" />)}
      </svg>
      <div className="flex justify-between text-[10px] font-bold text-ink-soft"><span>Sep 05</span><span>Sep 12</span><span>Sep 25</span><span>Oct 09</span></div>
    </div>
  );
}

function ConceptDetail({ concept, tx, onBack, onStudent, notify }: { concept: ConceptInsight; tx: Tx; onBack: () => void; onStudent: (s: TeacherStudent) => void; notify: (t: string) => void }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3"><button onClick={onBack} className="grid size-10 place-items-center rounded-xl border border-[#dfe5ef] bg-white"><ArrowLeft className="size-5"/></button><div className="flex-1"><p className="text-xs font-extrabold uppercase tracking-wide text-coral-700">{tx("Concept drill-down","Konzept-Detail")}</p><h1 className="text-3xl font-semibold text-[#162b4d]">{concept.name.en}</h1><p className="text-sm text-ink-soft">{concept.affected} {tx("of 24 students affected","von 24 Lernenden betroffen")} · {concept.share}%</p></div><button onClick={()=>notify(tx("Concept marked for reteaching.","Konzept zur Wiederholung markiert."))} className="min-h-10 rounded-xl border border-[#dfe5ef] bg-white px-4 text-sm font-bold">{tx("Mark for reteaching","Zur Wiederholung markieren")}</button></div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("What the evidence shows","Was die Belege zeigen")}</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><InsightStat label={tx("Students","Lernende")} value={String(concept.affected)} /><InsightStat label={tx("Related questions","Zugehörige Fragen")} value={String(concept.questions)} /><InsightStat label={tx("Trend vs last exam","Trend zur letzten Arbeit")} value={`${concept.trend>0?"+":""}${concept.trend}%`} bad={concept.trend>0}/></div><p className="mt-5 rounded-xl bg-[#f7f9fc] p-4 text-sm leading-relaxed">{tx("Most students identify the two numbers in a fraction, but do not consistently connect the numerator to the number of selected parts and the denominator to the size of the whole.","Die meisten Lernenden erkennen beide Zahlen im Bruch, verbinden Zähler und Nenner aber noch nicht sicher mit ausgewählten Teilen und dem Ganzen.")}</p></TeacherCard>
          <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Common misconception breakdown","Häufige Fehlvorstellungen")}</h2><div className="mt-4 space-y-4">{[["Chooses the larger denominator",4,57],["Looks only at the numerator",2,29],["Reverses top and bottom",1,14]].map(([l,n,p],i)=><div key={l as string} className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-3"><span className="text-sm font-bold">{l}</span><span className="h-3 overflow-hidden rounded-full bg-[#edf0f5]"><i className={cx("block h-full rounded-full",i===0?"bg-coral-400":i===1?"bg-sun-400":"bg-sky-400")} style={{width:`${p}%`}}/></span><b className="text-sm">{n}</b></div>)}</div></TeacherCard>
          <TeacherCard className="overflow-hidden"><div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="text-lg font-semibold">{tx("Affected students","Betroffene Lernende")}</h2></div><div className="grid gap-px bg-[#edf0f5] sm:grid-cols-2">{concept.students.map((name,i)=><div key={name} className="flex items-center gap-3 bg-white p-4"><span className="grid size-9 place-items-center rounded-lg bg-[#e8f0fd] text-xs font-extrabold text-sky-700">{name.split(" ").map(x=>x[0]).join("")}</span><span className="flex-1"><b className="block text-sm">{name}</b><span className="text-xs text-ink-soft">{i<2?tx("Recurring","Wiederkehrend"):tx("New this exam","Neu in dieser Arbeit")}</span></span><button onClick={() => { const student = TEACHER_STUDENTS.find((s) => s.name === name); student ? onStudent(student) : notify(tx(`${name}'s profile is not part of this demo class.`, `${name} ist nicht Teil dieser Demo-Klasse.`)); }} className="text-xs font-extrabold text-sky-700">{tx("View","Ansehen")}</button></div>)}</div></TeacherCard>
        </div>
        <div className="space-y-5">
          <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Reflection pattern","Reflexionsmuster")}</h2><p className="mt-1 text-sm text-ink-soft">{concept.reflection}</p><div className="mt-4 space-y-3">{[["Forgot the rule",45],["Didn't understand",30],["Wasn't sure",25]].map(([l,v])=><div key={l as string}><div className="mb-1 flex justify-between text-xs font-bold"><span>{l}</span><span>{v}%</span></div><ProgressBar value={v as number} tone="grape"/></div>)}</div></TeacherCard>
          <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Act on this insight","Auf diesen Befund reagieren")}</h2><div className="mt-4 space-y-2"><button onClick={()=>notify(tx(`Message prepared for ${concept.affected} students.`,`Nachricht für ${concept.affected} Lernende vorbereitet.`))} className="flex min-h-11 w-full items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white"><Mail className="size-4"/>{tx(`Message ${concept.affected} students`,`${concept.affected} Lernende anschreiben`)}</button><button onClick={()=>notify(tx("Practice recommendation sent.","Übungsempfehlung gesendet."))} className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[#dfe5ef] bg-white px-4 text-sm font-bold"><Send className="size-4"/>{tx("Recommend practice","Übung empfehlen")}</button><button onClick={()=>notify(tx("Private class note added.","Private Klassennotiz hinzugefügt."))} className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[#dfe5ef] bg-white px-4 text-sm font-bold"><Lock className="size-4"/>{tx("Add private note","Private Notiz")}</button></div></TeacherCard>
        </div>
      </div>
    </>
  );
}

function InsightStat({label,value,bad}:{label:string;value:string;bad?:boolean}) {
  return <div className="rounded-xl bg-[#f7f9fc] p-4"><p className="text-xs font-extrabold uppercase text-ink-soft">{label}</p><p className={cx("mt-1 font-display text-3xl font-semibold",bad&&"text-coral-700")}>{value}</p></div>;
}

function MessagesView({ tx, notify }: { tx: Tx; notify: (t: string) => void }) {
  const [recipients,setRecipients]=useState("Sara M., Omar K.");
  const [message,setMessage]=useState(tx("Great effort on fractions. Please complete the short practice before Thursday.","Tolle Arbeit bei den Brüchen. Bitte bearbeite die kurze Übung bis Donnerstag."));
  const [template,setTemplate]=useState("Practice reminder");
  const [messageLanguage,setMessageLanguage]=useState<"English" | "Deutsch">("English");
  const [previewOpen,setPreviewOpen]=useState(false);
  const [scheduled,setScheduled]=useState(false);
  const [sent,setSent]=useState([
    {to:"Grade 4A",subject:"Math Exam 1 results are available",date:"Yesterday, 15:20",read:"21/24"},
    {to:"Omar K.",subject:"Great improvement on fractions",date:"Oct 10, 10:05",read:"Read"},
    {to:"Sara M.",subject:"Please complete your practice",date:"Oct 09, 14:30",read:"Not read"},
  ]);
  const submit=()=>{setSent((all)=>[{to:recipients,subject:message.slice(0,42),date:scheduled?tx("Scheduled · Thu 08:00","Geplant · Do 08:00"):tx("Just now","Gerade eben"),read:"0/2"},...all]);notify(scheduled?tx("Message scheduled.","Nachricht geplant."):tx("Message sent.","Nachricht gesendet."));};
  return (
    <>
      <PageTitle title={tx("Feedback & follow-up","Feedback & Nachverfolgung")} subtitle={tx("Send clear, supportive messages and track what happens next.","Unterstützende Nachrichten senden und Nachverfolgung im Blick behalten.")}/>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <TeacherCard className="p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{tx("Compose message","Nachricht schreiben")}</h2><span className="rounded-full bg-[#e8f0fd] px-2.5 py-1 text-xs font-extrabold text-sky-700">{tx("Student-friendly","Kindgerecht")}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-bold">{tx("Recipients","Empfänger")}</span><input value={recipients} onChange={e=>setRecipients(e.target.value)} className="min-h-11 w-full rounded-xl border border-[#cfd7e4] px-3 outline-none focus:border-sky-400"/></label><label><span className="mb-1.5 block text-sm font-bold">{tx("Template","Vorlage")}</span><select value={template} onChange={e=>{const next=e.target.value;setTemplate(next);setMessage(next==="Great improvement"?tx("Your hard work is showing. Great improvement this week!","Deine Anstrengung zeigt sich. Tolle Verbesserung diese Woche!"):next==="Results available"?tx("Your latest results are ready. Please read the feedback.","Deine neuesten Ergebnisse sind da. Bitte lies die Rückmeldung."):next==="Check-in"?tx("How are you feeling about this topic? Let me know if you need help.","Wie fühlst du dich bei diesem Thema? Sag mir, wenn du Hilfe brauchst."):tx("Great effort on fractions. Please complete the short practice before Thursday.","Tolle Arbeit bei den Brüchen. Bitte bearbeite die kurze Übung bis Donnerstag."));}} className="min-h-11 w-full rounded-xl border border-[#cfd7e4] bg-white px-3"><option>Practice reminder</option><option>Great improvement</option><option>Results available</option><option>Check-in</option></select></label></div><label className="mt-4 block"><span className="mb-1.5 block text-sm font-bold">{tx("Message","Nachricht")}</span><textarea value={message} onChange={e=>setMessage(e.target.value)} rows={7} className="w-full rounded-xl border border-[#cfd7e4] p-3 outline-none focus:border-sky-400"/><span className="mt-1 block text-right text-xs text-ink-soft">{message.length}/500</span></label><div className="mt-3 flex flex-wrap items-center gap-2"><button onClick={()=>setMessageLanguage((v)=>v==="English"?"Deutsch":"English")} className="min-h-9 rounded-lg border border-[#dfe5ef] px-3 text-xs font-bold"><Languages className="mr-1 inline size-3.5"/>{messageLanguage}</button><button onClick={()=>setPreviewOpen(true)} className="min-h-9 rounded-lg border border-[#dfe5ef] px-3 text-xs font-bold"><Eye className="mr-1 inline size-3.5"/>{tx("Preview","Vorschau")}</button><label className="ml-auto flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={scheduled} onChange={e=>setScheduled(e.target.checked)} className="size-4 accent-[var(--color-sky-600)]"/>{tx("Schedule for Thursday 08:00","Für Donnerstag 08:00 planen")}</label></div><button onClick={submit} disabled={!recipients||!message} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white disabled:bg-ink/15"><Send className="size-4"/>{scheduled?tx("Schedule message","Nachricht planen"):tx("Send message","Nachricht senden")}</button></TeacherCard>
        <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Message preview","Nachrichtenvorschau")}</h2><div className="mt-4 rounded-2xl bg-[#fff8ee] p-4"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-extrabold text-sky-700">Ms. Weber</p><p className="mt-2 text-sm leading-relaxed">{message}</p><div className="mt-4 flex gap-2"><span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">{tx("I understand","Ich verstehe")}</span><span className="rounded-full bg-coral-50 px-3 py-1 text-xs font-bold text-coral-700">{tx("I need help","Ich brauche Hilfe")}</span></div></div></div><p className="mt-4 flex items-start gap-2 text-xs text-ink-soft"><ShieldCheck className="size-4 shrink-0"/>{tx("Students can reply with a simple reaction or short message.","Lernende können mit einer Reaktion oder kurzen Nachricht antworten.")}</p></TeacherCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <TeacherCard className="overflow-hidden"><div className="border-b border-[#edf0f5] px-5 py-4"><h2 className="text-lg font-semibold">{tx("Sent messages","Gesendete Nachrichten")}</h2></div><div className="divide-y divide-[#edf0f5]">{sent.map((m,i)=><div key={i} className="flex items-center gap-4 px-5 py-4"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f0fd] text-sky-700"><Mail className="size-5"/></span><span className="min-w-0 flex-1"><b className="block truncate">{m.subject}</b><span className="text-xs text-ink-soft">{m.to} · {m.date}</span></span><span className={cx("text-xs font-bold",m.read==="Not read"?"text-coral-700":"text-mint-700")}>{m.read}</span><button onClick={()=>notify(tx(`Message actions opened for ${m.to}.`,`Nachrichtenaktionen für ${m.to} geöffnet.`))} aria-label={tx("Message actions","Nachrichtenaktionen")} className="grid size-8 place-items-center rounded-lg hover:bg-cloud"><MoreHorizontal className="size-4"/></button></div>)}</div></TeacherCard>
        <TeacherCard className="p-5"><h2 className="text-lg font-semibold">{tx("Follow-up status","Nachverfolgung")}</h2><div className="mt-4 space-y-3"><FollowRow done label={tx("21/24 read Math Exam feedback","21/24 haben Mathe-Feedback gelesen")}/><FollowRow done={false} label={tx("3 students still need to read","3 Lernende müssen noch lesen")}/><FollowRow done={false} label={tx("5 recommended quizzes pending","5 empfohlene Quizze offen")}/><FollowRow done label={tx("7 quizzes completed this week","7 Quizze diese Woche abgeschlossen")}/></div><button onClick={()=>notify(tx("Follow-up reminders sent.","Erinnerungen gesendet."))} className="mt-5 min-h-10 w-full rounded-xl border border-[#dfe5ef] bg-white text-sm font-extrabold text-sky-700">{tx("Remind pending students","Offene Lernende erinnern")}</button></TeacherCard>
      </div>
      {previewOpen && <Overlay title={tx("Message preview","Nachrichtenvorschau")} onClose={()=>setPreviewOpen(false)}><div className="rounded-2xl bg-[#fff8ee] p-4"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-extrabold text-sky-700">Ms. Weber · {messageLanguage}</p><p className="mt-2 text-sm leading-relaxed">{message}</p><p className="mt-4 text-xs font-bold text-ink-soft">{tx("To","An")}: {recipients}</p></div></div><div className="mt-4 flex justify-end"><button onClick={()=>setPreviewOpen(false)} className="min-h-10 rounded-xl bg-sky-600 px-4 text-sm font-extrabold text-white">{tx("Close preview","Vorschau schließen")}</button></div></Overlay>}
    </>
  );
}

function CreateSessionModal({ tx, onClose, onCreated }: { tx: Tx; onClose: () => void; onCreated: (title: string) => void }) {
  const [title, setTitle] = useState("Math Exam 2");
  const [subject, setSubject] = useState("Math");
  const [grade, setGrade] = useState("Grade 4A");
  const [language, setLanguage] = useState("English");
  const [gradeLevel, setGradeLevel] = useState("Grade 4");
  const [due, setDue] = useState("2026-10-20");
  return (
    <Overlay title={tx("Create exam session", "Prüfungssitzung erstellen")} onClose={onClose} wide>
      <p className="text-sm leading-relaxed text-ink-soft">{tx("Students will use this session to upload their paper exam. Questions and answer keys stay outside Learnie.", "Lernende laden über diese Sitzung ihre Papierarbeit hoch. Fragen und Lösungsschlüssel bleiben außerhalb von Learnie.")}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={tx("Exam title", "Titel")}><input value={title} onChange={(e) => setTitle(e.target.value)} className="teacher-input" /></Field>
        <Field label={tx("Class", "Klasse")}><select value={grade} onChange={(e) => setGrade(e.target.value)} className="teacher-input bg-white"><option>Grade 4A</option><option>Grade 4B</option><option>Grade 5A</option></select></Field>
        <Field label={tx("Subject", "Fach")}><select value={subject} onChange={(e) => setSubject(e.target.value)} className="teacher-input bg-white"><option>Math</option><option>English</option><option>Science</option></select></Field>
        <Field label={tx("Exam language", "Prüfungssprache")}><select value={language} onChange={(e) => setLanguage(e.target.value)} className="teacher-input bg-white"><option>English</option><option>Deutsch</option></select></Field>
        <Field label={tx("Due date (optional)", "Abgabedatum (optional)")}><input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="teacher-input" /></Field>
        <Field label={tx("Grade level", "Klassenstufe")}><select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="teacher-input bg-white"><option>Grade 4</option><option>Grade 5</option></select></Field>
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#eef4ff] p-3 text-sm"><CircleHelp className="mt-0.5 size-4 shrink-0 text-sky-700" /><span><b>{tx("Upload container only.", "Nur Upload-Sammlung.")}</b> {tx("This session does not include digital questions or an answer key.", "Diese Sitzung enthält keine digitalen Fragen oder Lösungen.")}</span></div>
      <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="min-h-10 rounded-xl border border-[#dfe5ef] px-4 text-sm font-bold">{tx("Cancel", "Abbrechen")}</button><button disabled={!title.trim()} onClick={() => onCreated(title)} className="min-h-10 rounded-xl bg-sky-600 px-5 text-sm font-extrabold text-white disabled:bg-ink/15">{tx("Open session", "Sitzung öffnen")}</button></div>
    </Overlay>
  );
}

function TeacherNotifications({ tx, onClose, onOpen, onPreferences }: { tx: Tx; onClose: () => void; onOpen: (r: TeacherRoute) => void; onPreferences: () => void }) {
  const [filter, setFilter] = useState<"all" | "reviews" | "insights">("all");
  const items: [typeof FileText, string, string, TeacherRoute, string][] = [
    [FileText, tx("New submission from Sara M.", "Neue Einreichung von Sara M."), tx("Math Exam 1 · needs text check", "Mathe-Arbeit 1 · Textprüfung nötig"), "submissions", "2 min"],
    [Sparkles, tx("AI grade ready for Omar K.", "KI-Note für Omar K. bereit"), tx("Review marks and feedback", "Noten und Feedback prüfen"), "submissions", "18 min"],
    [Flag, tx("New support flag proposed", "Neue Unterstützung vorgeschlagen"), tx("Jonas B. · multiplication facts", "Jonas B. · Einmaleins"), "insights", "1 h"],
    [Target, tx("Class gap detected", "Klassenweite Lücke erkannt"), tx("7 students · numerator vs denominator", "7 Lernende · Zähler und Nenner"), "insights", "2 h"],
    [CheckCircle2, tx("Lina A. completed practice", "Lina A. hat Übung beendet"), "5/5 · Science: Plants", "students", tx("Yesterday", "Gestern")],
  ];
  const shownItems = items.filter((item) => filter === "all" || filter === "reviews" ? filter === "all" || item[3] === "submissions" : item[3] === "insights");
  return (
    <>
      <button aria-label={tx("Close notifications", "Benachrichtigungen schließen")} onClick={onClose} className="fixed inset-0 z-40 bg-ink/20" />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dfe5ef] px-5 py-4"><div><h2 className="text-xl font-semibold">{tx("Notifications", "Benachrichtigungen")}</h2><p className="text-xs text-ink-soft">{tx("5 need attention", "5 brauchen Aufmerksamkeit")}</p></div><button onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-cloud"><X className="size-5" /></button></div>
        <div className="flex gap-2 border-b border-[#edf0f5] p-4"><FilterPill active={filter === "all"} onClick={() => setFilter("all")}>{tx("All", "Alle")}</FilterPill><FilterPill active={filter === "reviews"} onClick={() => setFilter("reviews")}>{tx("Reviews", "Prüfungen")}</FilterPill><FilterPill active={filter === "insights"} onClick={() => setFilter("insights")}>{tx("Insights", "Analysen")}</FilterPill></div>
        <div className="divide-y divide-[#edf0f5]">
          {shownItems.map(([Icon, title, body, route, time], i) => (
            <button key={i} onClick={() => onOpen(route)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-[#f8faff]">
              <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl", i < 2 ? "bg-[#e8f0fd] text-sky-700" : i < 4 ? "bg-coral-50 text-coral-700" : "bg-mint-50 text-mint-700")}><Icon className="size-5" /></span>
              <span className="min-w-0 flex-1"><b className="block text-sm">{title}</b><span className="block text-sm text-ink-soft">{body}</span><span className="mt-1 block text-xs font-bold text-sky-700">{time}</span></span>
              {i < 3 && <span className="mt-1 size-2 rounded-full bg-coral-400" />}
            </button>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-[#dfe5ef] bg-white p-4"><button onClick={onPreferences} className="w-full text-sm font-extrabold text-sky-700">{tx("Notification preferences", "Benachrichtigungseinstellungen")}</button></div>
      </aside>
    </>
  );
}

function TeacherSettingsModal({ tx, onClose, onSaved }: { tx: Tx; onClose: () => void; onSaved: () => void }) {
  const [newSubmissions, setNewSubmissions] = useState(true);
  const [aiReady, setAiReady] = useState(true);
  const [supportFlags, setSupportFlags] = useState(true);
  const [quizUpdates, setQuizUpdates] = useState(false);
  const [digest, setDigest] = useState("Daily at 07:30");
  return (
    <Overlay title={tx("Teacher settings", "Einstellungen für Lehrkräfte")} onClose={onClose} wide>
      <p className="text-sm text-ink-soft">{tx("Choose which updates appear in your notification center.", "Wählen Sie, welche Updates im Benachrichtigungsbereich erscheinen.")}</p>
      <div className="mt-5 space-y-2">
        <SettingsToggle label={tx("New student submissions", "Neue Einreichungen")} checked={newSubmissions} onChange={setNewSubmissions} />
        <SettingsToggle label={tx("AI grades ready to review", "KI-Noten zur Prüfung bereit")} checked={aiReady} onChange={setAiReady} />
        <SettingsToggle label={tx("Proposed support flags", "Vorgeschlagene Unterstützung")} checked={supportFlags} onChange={setSupportFlags} />
        <SettingsToggle label={tx("Completed quizzes and reflections", "Abgeschlossene Quizze und Reflexionen")} checked={quizUpdates} onChange={setQuizUpdates} />
      </div>
      <label className="mt-5 block"><span className="mb-1.5 block text-sm font-bold">{tx("Email digest", "E-Mail-Zusammenfassung")}</span><select value={digest} onChange={(e) => setDigest(e.target.value)} className="teacher-input bg-white"><option>Daily at 07:30</option><option>Daily at 16:00</option><option>Weekly on Monday</option><option>Off</option></select></label>
      <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="min-h-10 rounded-xl border border-[#dfe5ef] px-4 text-sm font-bold">{tx("Cancel", "Abbrechen")}</button><button onClick={onSaved} className="min-h-10 rounded-xl bg-sky-600 px-5 text-sm font-extrabold text-white">{tx("Save settings", "Einstellungen speichern")}</button></div>
    </Overlay>
  );
}

function SettingsToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm font-bold">
      {label}
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx("relative h-7 w-12 rounded-full transition", checked ? "bg-mint-400" : "bg-ink/15")}>
        <span className={cx("absolute top-1 size-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}

function Overlay({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={cx("relative w-full rounded-2xl bg-white p-6 shadow-2xl", wide ? "max-w-2xl" : "max-w-lg")}>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg hover:bg-cloud"><X className="size-5" /></button>
        <h2 className="pr-10 text-xl font-semibold">{title}</h2>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}</label>;
}
