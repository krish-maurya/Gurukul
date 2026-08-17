import { prisma } from "@/lib/prisma";
import { evaluateTimetable, type TimetableSlotInput } from "@/lib/timetable/optimizer";
import {
  denyGradeAccess,
  enrichQueryWithHistory,
  getDefaultTeacherGrade,
  getTeacherGrades,
  teacherCanAccessGrade,
  type CopilotHistoryItem,
} from "./access";
import {
  formatFilterDescription,
  isConflictQuery,
  isMyScheduleQuery,
  knownGrades,
  knownTeachers,
  nameTerms,
  requestedDay,
  requestedGrade,
  requestedPeriod,
  requestedRollNumber,
  requestedRoom,
  resolveStaffFromContext,
  resolveStaffFromQuery,
  subjectTerms,
} from "./entities";
import type { AssistantAction, AssistantIntent, AssistantResponse, CopilotContext } from "./types";

const ROUTES: Record<string, { route: string; label: string; roles: CopilotContext["role"][]; section: string; hint: string }> = {
  students: { route: "/students", label: "Open Student Registry", roles: ["ADMIN", "TEACHER"], section: "Students", hint: "Search students, open profiles, and manage records." },
  attendance: { route: "/attendance", label: "Open Attendance", roles: ["ADMIN", "TEACHER"], section: "Attendance", hint: "Take daily attendance and review saved rolls." },
  "attendance-take": { route: "/attendance/take", label: "Take Attendance (Focus)", roles: ["ADMIN", "TEACHER"], section: "Attendance → Focus mode", hint: "Distraction-free attendance for teachers." },
  documents: { route: "/documents", label: "Open Document Intelligence", roles: ["ADMIN", "TEACHER"], section: "Documents", hint: "Review OCR documents and school policies." },
  timetable: { route: "/timetable", label: "Open Timetable Optimizer", roles: ["ADMIN", "TEACHER"], section: "Timetable", hint: "View schedules, rooms, and conflict flags." },
  communications: { route: "/communications", label: "Open Parent Connect", roles: ["ADMIN", "TEACHER"], section: "Parent Connect", hint: "Absence alerts and messages to parents." },
  staff: { route: "/staff", label: "Open Faculty & Staff", roles: ["ADMIN"], section: "Staff", hint: "Faculty directory and workload." },
  roles: { route: "/admin/roles", label: "Open Audit & Access", roles: ["ADMIN"], section: "Master Control", hint: "Security audit and role management." },
};

const NAV_HELP: Record<string, { section: string; steps: string[]; routeKey: string }> = {
  clash: {
    section: "Timetable",
    routeKey: "timetable",
    steps: [
      "Open **Timetable** from the sidebar.",
      "Conflicts are flagged automatically in the master schedule view.",
      "Ask me “timetable conflicts” anytime for a verified conflict list.",
    ],
  },
  attendance: {
    section: "Attendance",
    routeKey: "attendance",
    steps: ["Open **Attendance** from the sidebar.", "Pick your class and date.", "Tap roll numbers to mark absent, then **Review & Submit**."],
  },
  fees: {
    section: "Students → Manage Fees",
    routeKey: "students",
    steps: ["Open **Students** from the sidebar.", "Select a student.", "Click **Manage Fees** to set amounts or record payments."],
  },
  parent: {
    section: "Parent Connect",
    routeKey: "communications",
    steps: ["Open **Parent Connect** from the sidebar.", "Use **Absence Alerts** for auto-sent attendance messages.", "Use **Messages** for custom parent notes."],
  },
};

function authorizedRoute(key: string, context: CopilotContext): AssistantAction[] {
  const item = ROUTES[key];
  return item && item.roles.includes(context.role) ? [{ id: `navigate-${key}`, label: item.label, type: "navigate", route: item.route }] : [];
}

function classify(query: string): AssistantIntent {
  const q = query.toLowerCase();
  if (/ignore (previous|instructions)|system prompt|api key|password|credential|environment variable|all database/.test(q)) return "OUT_OF_SCOPE";
  if (/how\s+(?:do\s+i|to|can\s+i)|where\s+(?:can\s+i|do\s+i|is)|show\s+me\s+how|navigate|go\s+to|open|take\s+me/.test(q)) return "NAVIGATION_REQUEST";
  if (/mark .* (absent|present)|record attendance/.test(q)) return "ACTION_REQUEST";
  if (/fee|fees|payment|outstanding|pending balance|receipt/.test(q)) return "FEE_QUERY";
  if (/parent|guardian|mother|father/.test(q) && /contact|email|phone|details|info|who/.test(q)) return "STUDENT_QUERY";
  if (/how many|count|total students|student count|enrollment/.test(q)) return "STATS_QUERY";
  if (/timetable|schedule|period|clash|conflict|double[- ]book/.test(q)) return "TIMETABLE_QUERY";
  if (/\broom\s*#?\s*\d+|\blab\s+[a-z]\b/i.test(q) && /occupied|free|available|booked|taken|who|used|using|empty/i.test(q)) return "TIMETABLE_QUERY";
  if (/\broom\s*#?\s*\d+/i.test(q) && /\b(monday|tuesday|wednesday|thursday|friday|mon|tue|wed|thu|fri)\b/i.test(q)) return "TIMETABLE_QUERY";
  if (/\bteach(es|ing)?\b/.test(q) && /who|which|what subject/.test(q)) return "TIMETABLE_QUERY";
  if (/\b(is|was|were)\b.*\b(present|absent)\b/i.test(q)) return "ATTENDANCE_QUERY";
  if (/attendance|absent|present|late/.test(q)) return "ATTENDANCE_QUERY";
  if (/staff|faculty|teacher|professor|department|instructor/.test(q)) return "STAFF_QUERY";
  if (/policy|policies|document|handbook|rule|leave/.test(q)) return "DOCUMENT_QUERY";
  if (/\broll\s*(?:no\.?|number|#)?\s*\d+/i.test(q)) return "STUDENT_QUERY";
  if (/student|class|roll|guardian|profile/.test(q)) return "STUDENT_QUERY";
  if (/\b(who\s+is|tell\s+me\s+about|details?\s+(?:of|for|about)|info\s+(?:of|on|about)|find|search|lookup|look\s+up|know\s+about)\b/i.test(q)) {
    if (/teacher|faculty|professor|staff|instructor/.test(q)) return "STAFF_QUERY";
    return "STUDENT_QUERY";
  }
  if (/what can you do|help|capabilit|supported task/.test(q)) return "AMBIGUOUS_QUERY";
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}[?.!]?$/.test(query.trim())) return "STUDENT_QUERY";
  return "OUT_OF_SCOPE";
}

const MONTH_MAP: Record<string, string> = {
  jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03",
  apr: "04", april: "04", may: "05", jun: "06", june: "06",
  jul: "07", july: "07", aug: "08", august: "08", sep: "09", sept: "09", september: "09",
  oct: "10", october: "10", nov: "11", november: "11", dec: "12", december: "12",
};

function requestedDate(query: string): string | undefined {
  // ISO: 2026-08-11
  const iso = query.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  // Indian: 11/08/2026
  const indian = query.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (indian) return `${indian[3]}-${indian[2].padStart(2, "0")}-${indian[1].padStart(2, "0")}`;

  // Natural: "11 Aug 2026", "11th August 2026", "11 aug, 2026"
  const dmy = query.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[,.]?\s+(\d{4})\b/i);
  if (dmy) {
    const mm = MONTH_MAP[dmy[2].toLowerCase()];
    if (mm) return `${dmy[3]}-${mm}-${dmy[1].padStart(2, "0")}`;
  }

  // Natural: "Aug 11, 2026", "August 11 2026"
  const mdy = query.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[,.]?\s+(\d{1,2})(?:st|nd|rd|th)?[,.]?\s+(\d{4})\b/i);
  if (mdy) {
    const mm = MONTH_MAP[mdy[1].toLowerCase()];
    if (mm) return `${mdy[3]}-${mm}-${mdy[2].padStart(2, "0")}`;
  }

  // Relative: today, yesterday
  const now = new Date();
  if (/\byesterday\b/i.test(query)) now.setDate(now.getDate() - 1);
  if (/\btoday\b|\byesterday\b/i.test(query)) return now.toISOString().slice(0, 10);
  return undefined;
}

function attendanceNameTerms(query: string): string[] {
  return nameTerms(query, [
    "is", "was", "are", "were", "whether", "if", "attendance", "present", "absent", "late",
    "status", "today", "yesterday", "date", "on", "in", "the", "for", "this", "that",
    "check", "verify", "confirm", "see", "view", "student", "roll", "number",
    "class", "grade", "section", "marked", "recorded", "submitted",
  ]);
}

async function teacherScope(context: CopilotContext) {
  const allowedGrades = context.role === "TEACHER" ? await getTeacherGrades(context.staffId) : [];
  const defaultGrade = context.role === "TEACHER" ? await getDefaultTeacherGrade(context.staffId) : undefined;
  return { allowedGrades, defaultGrade };
}

function enforceGradeAccess(context: CopilotContext, grade: string | undefined, allowedGrades: string[]): AssistantResponse | null {
  if (!grade || context.role === "ADMIN") return null;
  if (!teacherCanAccessGrade(context, grade, allowedGrades)) {
    return { message: denyGradeAccess(context, grade, allowedGrades), intent: "OUT_OF_SCOPE" };
  }
  return null;
}

function studentTerms(query: string) {
  return nameTerms(query, [
    "show", "find", "list", "search", "profile", "attendance", "fee", "fees", "pending",
    "payment", "history", "above", "below", "number", "count", "how", "many", "total",
    "student", "students", "roll", "guardian", "parent", "contact", "address", "medical",
    "dob", "birthday", "birth", "date", "status", "admitted", "class", "grade",
    "details", "detail", "info", "information", "about", "named", "called",
    "whois", "lookup", "record", "records", "data",
  ]);
}

function toTimetableInput(slots: Awaited<ReturnType<typeof fetchAllSlots>>): TimetableSlotInput[] {
  return slots.map((slot) => ({
    id: slot.id,
    day: slot.day,
    period: slot.period,
    grade: slot.grade,
    subjectId: slot.subjectId,
    subjectName: slot.subject.name,
    teacherId: slot.teacherId,
    teacherName: slot.teacher.name,
    roomId: slot.roomId,
    roomName: slot.room.roomNumber,
    roomCapacity: slot.room.capacity,
  }));
}

async function fetchAllSlots() {
  return prisma.timetableSlot.findMany({
    include: { subject: true, teacher: true, room: true },
    orderBy: [{ day: "asc" }, { period: "asc" }, { grade: "asc" }],
  });
}

/** Build a rich profile response for a single student with attendance stats and fee info */
async function buildStudentProfile(studentId: string, context: CopilotContext): Promise<AssistantResponse> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attendanceEntries: { select: { status: true } },
      feeAccount: {
        include: { payments: { orderBy: { paidAt: "desc" }, take: 5 } },
      },
    },
  });
  if (!student) return { message: "I couldn't find that student record.", intent: "STUDENT_QUERY" };

  const { allowedGrades } = await teacherScope(context);
  const denied = enforceGradeAccess(context, student.grade, allowedGrades);
  if (denied) return denied;

  const totalEntries = student.attendanceEntries.length;
  const presentCount = student.attendanceEntries.filter((e) => e.status === "PRESENT").length;
  const absentCount = totalEntries - presentCount;
  const attendancePct = totalEntries > 0 ? ((presentCount / totalEntries) * 100).toFixed(1) : "N/A";

  const feeOutstanding = student.feeAccount ? student.feeAccount.amountDue - student.feeAccount.amountPaid : 0;
  const feeStatus = student.feeAccount?.status || "No fee account";

  const profileRows = [
    { Field: "Name", Value: student.name },
    { Field: "Roll Number", Value: student.rollNumber },
    { Field: "Class", Value: student.grade },
    { Field: "Date of Birth", Value: student.dob },
    { Field: "Parent/Guardian", Value: student.parentName },
    { Field: "Parent Email", Value: student.parentEmail || "Not recorded" },
    { Field: "Contact", Value: student.contact },
    { Field: "Address", Value: student.address || "Not recorded" },
    { Field: "Medical Notes", Value: student.medicalNotes || "None" },
    { Field: "Status", Value: student.status },
    { Field: "Attendance", Value: totalEntries > 0 ? `${attendancePct}% (${presentCount}P / ${absentCount}A out of ${totalEntries} records)` : "No attendance records" },
    { Field: "Fee Status", Value: student.feeAccount ? `${feeStatus} — Total ₹${student.feeAccount.amountDue.toLocaleString("en-IN")}, Paid ₹${student.feeAccount.amountPaid.toLocaleString("en-IN")}, Due ₹${feeOutstanding.toLocaleString("en-IN")}` : "No fee account" },
    { Field: "Fee Due Date", Value: student.feeAccount?.dueDate || "—" },
    { Field: "Academic Year", Value: student.feeAccount?.academicYear || "—" },
  ];

  const stats = [
    { label: "Roll No", value: String(student.rollNumber) },
    { label: "Attendance", value: totalEntries > 0 ? `${attendancePct}%` : "N/A" },
    { label: "Class", value: student.grade },
    { label: "Fee Status", value: feeStatus },
  ];

  const paymentRows = student.feeAccount?.payments.map((p) => ({
    Date: p.paidAt,
    Amount: `₹${p.amount.toLocaleString("en-IN")}`,
    Method: p.method,
    Receipt: p.receiptNo,
  })) ?? [];

  return {
    message: `Here is the complete profile for ${student.name} (Roll ${student.rollNumber}, ${student.grade}). Parent: ${student.parentName}${student.parentEmail ? ` (${student.parentEmail})` : ""}.`,
    intent: "STUDENT_QUERY",
    sources: [{ type: "database", label: `Student profile: ${student.name}`, id: student.id }],
    actions: [
      ...authorizedRoute("students", context),
      { id: `student-profile-${student.id}`, label: "Open full profile", type: "navigate", route: `/students/${student.id}` },
    ],
    data: {
      kind: "student_profile",
      rows: profileRows,
      stats,
      ...(paymentRows.length ? { preview: { section: "Recent payments", hint: `${paymentRows.length} payment(s) on file` } } : {}),
    },
  };
}

async function studentSearch(query: string, context: CopilotContext): Promise<AssistantResponse> {
  const q = query.toLowerCase();
  const { allowedGrades, defaultGrade } = await teacherScope(context);
  const mentionedGrade = requestedGrade(query);
  const grade = mentionedGrade || defaultGrade;
  const denied = enforceGradeAccess(context, mentionedGrade, allowedGrades);
  if (denied) return denied;
  const rollNo = requestedRollNumber(query);

  // Parent lookup: "parent of Aarav" / "parent contact for roll 7"
  if (/parent|guardian/.test(q)) {
    const terms = studentTerms(query);
    const parentStudents = await prisma.student.findMany({
      where: {
        ...(grade ? { grade } : context.role === "TEACHER" && allowedGrades.length ? { grade: { in: allowedGrades } } : {}),
        ...(terms.length ? { OR: [{ parentName: { contains: terms.join(" "), mode: "insensitive" } }, { AND: terms.map((t) => ({ name: { contains: t, mode: "insensitive" as const } })) }] } : {}),
        ...(rollNo !== undefined ? { rollNumber: rollNo } : {}),
      },
      select: { id: true, name: true, grade: true, rollNumber: true, parentName: true, parentEmail: true, contact: true },
      take: 10,
    });
    if (!parentStudents.length) return { message: "I couldn't find a student or parent matching that request.", intent: "STUDENT_QUERY" };
    if (parentStudents.length === 1) {
      const s = parentStudents[0];
      return {
        message: `Parent details for ${s.name} (Roll ${s.rollNumber}, ${s.grade}): **${s.parentName}** — ${s.contact}${s.parentEmail ? `, email: ${s.parentEmail}` : ""}.`,
        intent: "STUDENT_QUERY",
        sources: [{ type: "database", label: `Parent: ${s.parentName}`, id: s.id }],
        actions: [{ id: `student-${s.id}`, label: "Open student profile", type: "navigate", route: `/students/${s.id}` }],
        data: {
          kind: "student_profile",
          rows: [
            { Field: "Student", Value: s.name },
            { Field: "Class", Value: s.grade },
            { Field: "Roll", Value: s.rollNumber },
            { Field: "Parent/Guardian", Value: s.parentName },
            { Field: "Contact", Value: s.contact },
            { Field: "Parent Email", Value: s.parentEmail || "Not recorded" },
          ],
        },
      };
    }
    return {
      message: `I found ${parentStudents.length} matches. Which student did you mean?`,
      intent: "STUDENT_QUERY",
      data: { kind: "students", rows: parentStudents.map((s) => ({ Student: s.name, Roll: s.rollNumber, Class: s.grade, Parent: s.parentName, Contact: s.contact })) },
    };
  }

  // Count query: "how many students in 10A?"
  if (/how many|count|total/.test(q) && grade) {
    const count = await prisma.student.count({ where: { grade, status: "ADMITTED" } });
    return {
      message: `There are ${count} admitted students in ${grade} according to the student registry.`,
      intent: "STATS_QUERY",
      sources: [{ type: "database", label: `Student registry: ${grade}` }],
      actions: authorizedRoute("students", context),
      data: { kind: "stats", rows: [{ Metric: "Admitted students", Class: grade, Value: count }], stats: [{ label: "Students", value: String(count) }, { label: "Class", value: grade }] },
    };
  }

  // Roll number lookup: "who is roll no 30 in 10A?"
  if (rollNo !== undefined) {
    const student = await prisma.student.findFirst({
      where: { rollNumber: rollNo, ...(grade ? { grade } : {}) },
      select: { id: true, rollNumber: true, name: true, grade: true, status: true },
    });
    if (!student) {
      // Try without grade filter if grade was specified but no match
      const anyGradeMatch = grade ? await prisma.student.findMany({
        where: { rollNumber: rollNo },
        select: { id: true, rollNumber: true, name: true, grade: true, status: true },
        take: 5,
      }) : [];
      if (anyGradeMatch.length === 1) return buildStudentProfile(anyGradeMatch[0].id, context);
      if (anyGradeMatch.length > 1) {
        return {
          message: `I found ${anyGradeMatch.length} students with Roll No ${rollNo} in different classes. Which one did you mean?`,
          intent: "STUDENT_QUERY",
          actions: authorizedRoute("students", context),
          data: { kind: "students", rows: anyGradeMatch.map((s) => ({ Student: s.name, Roll: s.rollNumber, Class: s.grade, Status: s.status })) },
        };
      }
      return { message: `I couldn't find a student with Roll No ${rollNo}${grade ? ` in ${grade}` : ""}. Please check the roll number and class.`, intent: "STUDENT_QUERY" };
    }
    return buildStudentProfile(student.id, context);
  }

  // Name-based search
  const terms = studentTerms(query);
  const students = await prisma.student.findMany({
    where: {
      ...(grade ? { grade } : context.role === "TEACHER" && allowedGrades.length ? { grade: { in: allowedGrades } } : {}),
      ...(terms.length ? { AND: terms.map((term) => ({ name: { contains: term, mode: "insensitive" as const } })) } : {}),
    },
    select: { id: true, rollNumber: true, name: true, grade: true, status: true },
    take: 12,
    orderBy: { rollNumber: "asc" },
  });

  if (!students.length) {
    const grades = await knownGrades();
    const hint = grades.length ? ` Known classes include ${grades.slice(0, 5).join(", ")}.` : "";
    return { message: `I couldn't verify a matching student from the records you are allowed to access.${hint} Try a full name, roll number, or class.`, intent: "STUDENT_QUERY" };
  }

  // Single match → return rich profile
  if (students.length === 1) {
    return buildStudentProfile(students[0].id, context);
  }

  // Multiple matches → disambiguation: ask which one they mean
  const nameQuery = terms.join(" ");
  return {
    message: `I found ${students.length} students matching "${nameQuery}". Which one did you mean? You can specify by full name, roll number, or class.`,
    intent: "STUDENT_QUERY",
    sources: students.map((student) => ({ type: "database", label: `Student record: ${student.name}`, id: student.id })),
    actions: authorizedRoute("students", context),
    data: { kind: "students", rows: students.map((s) => ({ Student: s.name, Roll: s.rollNumber, Class: s.grade, Status: s.status })) },
  };
}

async function stats(query: string, context: CopilotContext): Promise<AssistantResponse> {
  const { allowedGrades, defaultGrade } = await teacherScope(context);
  const mentionedGrade = requestedGrade(query);
  const grade = mentionedGrade || defaultGrade;
  const denied = enforceGradeAccess(context, mentionedGrade, allowedGrades);
  if (denied) return denied;
  if (grade) {
    const [studentCount, slotCount] = await Promise.all([
      prisma.student.count({ where: { grade } }),
      prisma.timetableSlot.count({ where: { grade } }),
    ]);
    return {
      message: `${grade} has ${studentCount} registered students and ${slotCount} scheduled timetable slots in the master schedule.`,
      intent: "STATS_QUERY",
      sources: [{ type: "database", label: `Registry and timetable: ${grade}` }],
      actions: authorizedRoute("students", context),
      data: {
        kind: "stats",
        rows: [{ Class: grade, Students: studentCount, "Timetable slots": slotCount }],
        stats: [{ label: "Students", value: String(studentCount) }, { label: "Slots", value: String(slotCount) }],
      },
    };
  }

  const [students, staff, slots, grades] = await Promise.all([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.timetableSlot.count(),
    knownGrades(),
  ]);
  return {
    message: `GURUKUL currently has ${students} students, ${staff} faculty members, and ${slots} timetable slots across ${grades.length} classes.`,
    intent: "STATS_QUERY",
    sources: [{ type: "database", label: "School registry summary" }],
    data: {
      kind: "stats",
      rows: grades.map((item) => ({ Class: item })),
      stats: [{ label: "Students", value: String(students) }, { label: "Faculty", value: String(staff) }, { label: "Classes", value: String(grades.length) }],
    },
  };
}

async function attendance(query: string, context: CopilotContext): Promise<AssistantResponse> {
  const q = query.toLowerCase();
  const { allowedGrades, defaultGrade } = await teacherScope(context);
  const mentionedGrade = requestedGrade(query);
  const effectiveGrade = mentionedGrade || defaultGrade;
  const denied = enforceGradeAccess(context, mentionedGrade, allowedGrades);
  if (denied) return denied;
  const rollNo = requestedRollNumber(query);

  // "How many absent in Grade 10A on date?"
  if (/how many/.test(q) && /absent/.test(q)) {
    const lookupDate = requestedDate(query) || new Date().toISOString().slice(0, 10);
    const records = await prisma.attendanceRecord.findMany({
      where: {
        date: lookupDate,
        ...(effectiveGrade ? { grade: effectiveGrade } : context.role === "TEACHER" && allowedGrades.length ? { grade: { in: allowedGrades } } : {}),
      },
      include: { entries: { where: { status: "ABSENT" }, include: { student: { select: { name: true, grade: true } } } } },
    });
    const absentCount = records.reduce((sum, r) => sum + r.entries.length, 0);
    const rows = records.flatMap((r) => r.entries.map((e) => ({ Student: e.student.name, Roll: e.rollNumber, Class: e.student.grade, Date: r.date })));
    return {
      message: absentCount
        ? `${absentCount} student${absentCount === 1 ? " was" : "s were"} absent on ${lookupDate}${effectiveGrade ? ` in ${effectiveGrade}` : ""}.`
        : `No absences recorded on ${lookupDate}${effectiveGrade ? ` in ${effectiveGrade}` : ""}.`,
      intent: "ATTENDANCE_QUERY",
      sources: records.map((r) => ({ type: "database", label: `Attendance: ${r.grade} · ${r.date}`, id: r.id })),
      actions: authorizedRoute("attendance", context),
      data: { kind: "attendance", rows, stats: [{ label: "Absent", value: String(absentCount) }, { label: "Date", value: lookupDate }, ...(effectiveGrade ? [{ label: "Class", value: effectiveGrade }] : [])] },
    };
  }

  // At-risk query: "students below 75%"
  if (/below\s*75|under\s*75|at risk|risk/.test(q)) {
    const entries = await prisma.attendanceEntry.findMany({
      where: { ...(effectiveGrade ? { student: { grade: effectiveGrade } } : {}) },
      include: { student: { select: { id: true, name: true, grade: true } } },
      take: 1000,
    });
    const totals = new Map<string, { name: string; grade: string; present: number; absent: number }>();
    for (const entry of entries) {
      const item = totals.get(entry.studentId) || { name: entry.student.name, grade: entry.student.grade, present: 0, absent: 0 };
      entry.status === "PRESENT" ? item.present++ : item.absent++;
      totals.set(entry.studentId, item);
    }
    const rows = [...totals.values()].map((item) => ({ Student: item.name, Class: item.grade, Attendance: `${((item.present / (item.present + item.absent)) * 100).toFixed(1)}%`, "Absent days": item.absent })).filter((item) => Number(item.Attendance.replace("%", "")) < 75);
    return { message: rows.length ? `I found ${rows.length} students below the 75% attendance threshold in your accessible records.` : "No students are below the 75% attendance threshold in your accessible records.", intent: "ATTENDANCE_QUERY", sources: [{ type: "database", label: "Verified attendance entries" }], actions: authorizedRoute("attendance", context), data: { kind: "attendance", rows, stats: [{ label: "At risk", value: String(rows.length) }, { label: "Threshold", value: "75%" }] } };
  }

  const date = requestedDate(query);
  const nameTermsList = attendanceNameTerms(query);

  // Roll number-based attendance lookup: "Is roll no 7 present on 12 Aug 2026?"
  if (rollNo !== undefined && date) {
    const entries = await prisma.attendanceEntry.findMany({
      where: {
        rollNumber: rollNo,
        attendanceRecord: { date, ...(effectiveGrade ? { grade: effectiveGrade } : {}) },
      },
      include: { student: { select: { name: true, grade: true } }, attendanceRecord: { select: { id: true, date: true, grade: true, status: true } } },
      take: 5,
    });
    if (!entries.length) return { message: `I couldn't verify a submitted attendance entry for Roll No ${rollNo} on ${date}${effectiveGrade ? ` in ${effectiveGrade}` : ""}.`, intent: "ATTENDANCE_QUERY", actions: authorizedRoute("attendance", context) };
    if (entries.length === 1) {
      const entry = entries[0];
      return {
        message: `${entry.student.name} (Roll ${rollNo}) is recorded **${entry.status}** in ${entry.student.grade} on ${entry.attendanceRecord.date}.`,
        intent: "ATTENDANCE_QUERY",
        sources: [{ type: "database", label: `Submitted attendance: ${entry.attendanceRecord.grade} · ${entry.attendanceRecord.date}`, id: entry.attendanceRecord.id }],
        actions: authorizedRoute("attendance", context),
        data: { kind: "attendance", rows: [{ Student: entry.student.name, Roll: rollNo, Class: entry.student.grade, Date: entry.attendanceRecord.date, Status: entry.status }] },
      };
    }
    // Multiple entries for same roll number across classes
    return {
      message: `I found ${entries.length} attendance entries for Roll No ${rollNo} on ${date}. Which class did you mean?`,
      intent: "ATTENDANCE_QUERY",
      data: { kind: "attendance", rows: entries.map((entry) => ({ Student: entry.student.name, Roll: rollNo, Class: entry.student.grade, Date: entry.attendanceRecord.date, Status: entry.status })) },
    };
  }

  // Name-based attendance lookup: "Is Amit Chavda present on 11 Aug 2026 in 10A?"
  if (nameTermsList.length && date) {
    const entries = await prisma.attendanceEntry.findMany({
      where: {
        attendanceRecord: { date, ...(effectiveGrade ? { grade: effectiveGrade } : {}) },
        student: { AND: nameTermsList.map((name) => ({ name: { contains: name, mode: "insensitive" as const } })) },
      },
      include: { student: { select: { name: true, grade: true, rollNumber: true } }, attendanceRecord: { select: { id: true, date: true, grade: true, status: true } } },
      take: 10,
    });
    if (!entries.length) return { message: `I couldn't verify a submitted attendance entry for "${nameTermsList.join(" ")}" on ${date}${effectiveGrade ? ` in ${effectiveGrade}` : ""}.`, intent: "ATTENDANCE_QUERY", actions: authorizedRoute("attendance", context) };
    if (entries.length === 1) {
      const entry = entries[0];
      return {
        message: `${entry.student.name} (Roll ${entry.student.rollNumber}) is recorded **${entry.status}** in ${entry.student.grade} on ${entry.attendanceRecord.date}.`,
        intent: "ATTENDANCE_QUERY",
        sources: [{ type: "database", label: `Submitted attendance: ${entry.attendanceRecord.grade} · ${entry.attendanceRecord.date}`, id: entry.attendanceRecord.id }],
        actions: authorizedRoute("attendance", context),
        data: { kind: "attendance", rows: [{ Student: entry.student.name, Roll: entry.student.rollNumber, Class: entry.student.grade, Date: entry.attendanceRecord.date, Status: entry.status }] },
      };
    }
    // Multiple students match the name — disambiguation
    return {
      message: `I found ${entries.length} students matching "${nameTermsList.join(" ")}" in the attendance records for ${date}. Which one did you mean? Please specify by full name, roll number, or class.`,
      intent: "ATTENDANCE_QUERY",
      actions: authorizedRoute("attendance", context),
      data: { kind: "attendance", rows: entries.map((entry) => ({ Student: entry.student.name, Roll: entry.student.rollNumber, Class: entry.student.grade, Date: entry.attendanceRecord.date, Status: entry.status })) },
    };
  }

  // Name-based attendance summary (no date): "show attendance of Mason"
  if (nameTermsList.length && !date) {
    const students = await prisma.student.findMany({
      where: {
        ...(effectiveGrade ? { grade: effectiveGrade } : {}),
        AND: nameTermsList.map((name) => ({ name: { contains: name, mode: "insensitive" as const } })),
      },
      select: { id: true, name: true, grade: true, rollNumber: true },
      take: 10,
    });
    if (!students.length) return { message: `I couldn't find a student matching "${nameTermsList.join(" ")}"${effectiveGrade ? ` in ${effectiveGrade}` : ""}.`, intent: "ATTENDANCE_QUERY" };
    if (students.length === 1) {
      const student = students[0];
      const entries = await prisma.attendanceEntry.findMany({
        where: { studentId: student.id },
        select: { status: true },
      });
      const present = entries.filter((e) => e.status === "PRESENT").length;
      const absent = entries.length - present;
      const pct = entries.length > 0 ? ((present / entries.length) * 100).toFixed(1) : "N/A";
      return {
        message: `${student.name} (Roll ${student.rollNumber}, ${student.grade}) has ${pct}% attendance — ${present} present and ${absent} absent out of ${entries.length} recorded sessions.`,
        intent: "ATTENDANCE_QUERY",
        sources: [{ type: "database", label: `Attendance summary: ${student.name}`, id: student.id }],
        actions: authorizedRoute("attendance", context),
        data: { kind: "attendance", rows: [{ Student: student.name, Roll: student.rollNumber, Class: student.grade, Present: present, Absent: absent, "Attendance %": `${pct}%` }], stats: [{ label: "Attendance", value: `${pct}%` }, { label: "Present", value: String(present) }, { label: "Absent", value: String(absent) }] },
      };
    }
    // Multiple students → disambiguate
    return {
      message: `I found ${students.length} students matching "${nameTermsList.join(" ")}". Which one did you mean? Please specify by full name, roll number, or class.`,
      intent: "ATTENDANCE_QUERY",
      actions: authorizedRoute("attendance", context),
      data: { kind: "students", rows: students.map((s) => ({ Student: s.name, Roll: s.rollNumber, Class: s.grade })) },
    };
  }

  // Default: absences for a date
  const lookupDate = date || new Date().toISOString().slice(0, 10);
  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: lookupDate,
      ...(effectiveGrade ? { grade: effectiveGrade } : context.role === "TEACHER" && allowedGrades.length ? { grade: { in: allowedGrades } } : {}),
    },
    include: { entries: { where: { status: "ABSENT" }, include: { student: { select: { name: true, grade: true } } } } },
    take: 10,
  });
  const rows = records.flatMap((record) => record.entries.map((entry) => ({ Student: entry.student.name, Roll: entry.rollNumber, Class: entry.student.grade, Date: record.date, Status: entry.status })));
  return {
    message: rows.length ? `${rows.length} student${rows.length === 1 ? " was" : "s were"} recorded absent on ${lookupDate}.` : `I found no verified absence records for ${lookupDate} in your accessible classes.`,
    intent: "ATTENDANCE_QUERY",
    sources: records.map((record) => ({ type: "database", label: `Attendance record: ${record.grade} · ${record.date}`, id: record.id })),
    actions: authorizedRoute("attendance", context),
    data: { kind: "attendance", rows, stats: [{ label: "Absent", value: String(rows.length) }, { label: "Date", value: lookupDate }] },
  };
}

async function buildStaffProfile(staffId: string, context: CopilotContext): Promise<AssistantResponse> {
  const member = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      timetableSlots: { include: { subject: true, room: true }, orderBy: [{ day: "asc" }, { period: "asc" }], take: 20 },
      _count: { select: { timetableSlots: true } },
    },
  });
  if (!member) return { message: "I couldn't find that faculty record.", intent: "STAFF_QUERY" };

  const profileRows = [
    { Field: "Name", Value: member.name },
    { Field: "Department", Value: member.department },
    { Field: "Email", Value: member.email },
    { Field: "Max periods/day", Value: member.maxPeriodsPerDay },
    { Field: "Max periods/week", Value: member.maxPeriodsPerWeek },
    { Field: "Status", Value: member.isActive ? "Active" : "Inactive" },
    { Field: "Scheduled periods", Value: member._count.timetableSlots },
  ];

  const scheduleRows = member.timetableSlots.map((s) => ({
    Day: s.day,
    Period: s.period,
    Class: s.grade,
    Subject: s.subject.name,
    Room: s.room.roomNumber,
  }));

  return {
    message: `Faculty profile for **${member.name}** (${member.department}) — ${member._count.timetableSlots} scheduled period${member._count.timetableSlots === 1 ? "" : "s"}.`,
    intent: "STAFF_QUERY",
    sources: [{ type: "database", label: `Faculty: ${member.name}`, id: member.id }],
    actions: authorizedRoute("staff", context),
    data: {
      kind: "staff_profile",
      rows: profileRows,
      stats: [
        { label: "Department", value: member.department },
        { label: "Periods", value: String(member._count.timetableSlots) },
        { label: "Email", value: member.email },
      ],
      preview: scheduleRows.length ? { section: "Upcoming schedule sample", hint: `${scheduleRows.length} slot(s) shown` } : undefined,
    },
  };
}

async function fees(query: string, context: CopilotContext): Promise<AssistantResponse> {
  const q = query.toLowerCase();
  const { allowedGrades, defaultGrade } = await teacherScope(context);
  const mentionedGrade = requestedGrade(query);
  const grade = mentionedGrade || defaultGrade;
  const rollNo = requestedRollNumber(query);
  const terms = studentTerms(query);

  // Per-student fee lookup
  if (rollNo !== undefined || terms.length || /fee/.test(q) && /student|roll|for/.test(q)) {
    const student = await prisma.student.findFirst({
      where: {
        ...(rollNo !== undefined ? { rollNumber: rollNo } : {}),
        ...(grade ? { grade } : context.role === "TEACHER" && allowedGrades.length ? { grade: { in: allowedGrades } } : {}),
        ...(terms.length ? { AND: terms.map((t) => ({ name: { contains: t, mode: "insensitive" as const } })) } : {}),
      },
      include: { feeAccount: { include: { payments: { orderBy: { paidAt: "desc" } } } } },
    });
    if (!student) return { message: "I couldn't find a student with a fee account matching that request.", intent: "FEE_QUERY" };
    if (context.role === "TEACHER" && !teacherCanAccessGrade(context, student.grade, allowedGrades)) {
      return { message: denyGradeAccess(context, student.grade, allowedGrades), intent: "FEE_QUERY" };
    }
    if (!student.feeAccount) return { message: `${student.name} does not have a fee account set up yet.`, intent: "FEE_QUERY" };

    const acc = student.feeAccount;
    const remaining = Math.max(0, acc.amountDue - acc.amountPaid);
    const summaryRows = [
      { Field: "Student", Value: `${student.name} (${student.grade})` },
      { Field: "Total fee", Value: `₹${acc.amountDue.toLocaleString("en-IN")}` },
      { Field: "Paid", Value: `₹${acc.amountPaid.toLocaleString("en-IN")}` },
      { Field: "Remaining", Value: `₹${remaining.toLocaleString("en-IN")}` },
      { Field: "Status", Value: acc.status },
      { Field: "Due date", Value: acc.dueDate },
      { Field: "Academic year", Value: acc.academicYear },
    ];
    const paymentRows = acc.payments.map((p) => ({ Date: p.paidAt, Amount: `₹${p.amount.toLocaleString("en-IN")}`, Method: p.method, Receipt: p.receiptNo }));

    return {
      message: `Fee details for ${student.name}: **${acc.status}** — ₹${acc.amountPaid.toLocaleString("en-IN")} paid of ₹${acc.amountDue.toLocaleString("en-IN")} (₹${remaining.toLocaleString("en-IN")} remaining, due ${acc.dueDate}).`,
      intent: "FEE_QUERY",
      sources: [{ type: "database", label: `Fee account: ${student.name}`, id: acc.id }],
      actions: [
        ...authorizedRoute("students", context),
        { id: `fee-student-${student.id}`, label: "Open student profile", type: "navigate", route: `/students/${student.id}` },
      ],
      data: {
        kind: "fee_detail",
        rows: summaryRows,
        paymentRows,
        stats: [
          { label: "Paid", value: `₹${acc.amountPaid.toLocaleString("en-IN")}` },
          { label: "Remaining", value: `₹${remaining.toLocaleString("en-IN")}` },
          { label: "Status", value: acc.status },
        ],
        preview: paymentRows.length ? { section: "Payment history", hint: `${paymentRows.length} payment(s)` } : undefined,
      },
    };
  }

  if (context.role !== "ADMIN") {
    return {
      message: `As a teacher, you can ask about fees for a specific student in your class — e.g. "fees for roll 7 in ${defaultGrade || "Grade 10A"}" or "fee details for Aarav Sharma". School-wide fee reports are admin-only.`,
      intent: "FEE_QUERY",
    };
  }

  const minimum = query.match(/(?:above|over|more than)\s*₹?\s*([\d,]+)/i)?.[1];
  const accounts = await prisma.feeAccount.findMany({
    where: { amountDue: { gt: 0 }, ...(minimum ? { NOT: { amountDue: { lte: Number(minimum.replace(/,/g, "")) } } } : {}) },
    include: { student: { select: { id: true, name: true, grade: true } } },
    take: 20,
  });
  const pending = accounts.map((account) => ({ ...account, outstanding: account.amountDue - account.amountPaid })).filter((account) => account.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding);
  const total = pending.reduce((sum, account) => sum + account.outstanding, 0);
  return {
    message: pending.length ? `I found ${pending.length} students with verified pending fees. Total outstanding: ₹${total.toLocaleString("en-IN")}.` : "I found no pending fee balances matching that request.",
    intent: "FEE_QUERY",
    sources: pending.map((account) => ({ type: "database", label: `Fee account: ${account.student.name}`, id: account.id })),
    actions: authorizedRoute("students", context),
    data: { kind: "fees", rows: pending.map((account) => ({ Student: account.student.name, Class: account.student.grade, Pending: `₹${account.outstanding.toLocaleString("en-IN")}`, Status: account.status })), stats: [{ label: "Students", value: String(pending.length) }, { label: "Outstanding", value: `₹${total.toLocaleString("en-IN")}` }] },
  };
}

async function documents(query: string, context: CopilotContext): Promise<AssistantResponse> {
  const terms = query.toLowerCase().split(/\W+/).filter((word) => word.length > 3 && !["what", "school", "policy", "about", "show"].includes(word)).slice(0, 4);
  const documents = await prisma.documentRecord.findMany({
    where: { status: "APPROVED", ...(terms.length ? { OR: terms.flatMap((term) => [{ fileName: { contains: term, mode: "insensitive" as const } }, { rawText: { contains: term, mode: "insensitive" as const } }]) } : { documentType: "School Policy" }) },
    select: { id: true, fileName: true, rawText: true }, take: 3,
  });
  if (!documents.length) return { message: "I couldn't verify that policy from approved GURUKUL documents.", intent: "DOCUMENT_QUERY" };
  const excerpts = documents.map((document) => (document.rawText || "").replace(/\s+/g, " ").slice(0, 280));
  return { message: excerpts.join("\n\n"), intent: "DOCUMENT_QUERY", sources: documents.map((document) => ({ type: "document", label: document.fileName, id: document.id })), actions: authorizedRoute("documents", context), data: { kind: "documents", rows: documents.map((document) => ({ Document: document.fileName, Status: "Approved" })) } };
}

async function timetableConflicts(context: CopilotContext): Promise<AssistantResponse> {
  const slots = await fetchAllSlots();
  const evaluation = evaluateTimetable(toTimetableInput(slots));
  const rows = evaluation.conflicts.map((conflict) => ({
    Type: conflict.type.replace(/_/g, " "),
    Severity: conflict.severity,
    Day: conflict.day,
    Period: conflict.period,
    Issue: conflict.description,
  }));

  return {
    message: evaluation.conflicts.length
      ? `I found ${evaluation.conflicts.length} verified timetable conflict${evaluation.conflicts.length === 1 ? "" : "s"} in the master schedule.`
      : "The master timetable has no detected teacher, room, or workload conflicts.",
    intent: "TIMETABLE_QUERY",
    sources: [{ type: "database", label: "Master timetable evaluation" }],
    actions: authorizedRoute("timetable", context),
    data: {
      kind: "conflicts",
      rows,
      stats: [{ label: "Conflicts", value: String(evaluation.conflicts.length) }, { label: "Total slots", value: String(evaluation.totalSlots) }],
    },
  };
}

async function timetable(query: string, context: CopilotContext): Promise<AssistantResponse> {
  if (isConflictQuery(query)) return timetableConflicts(context);

  const grade = requestedGrade(query);
  const day = requestedDay(query);
  const subjects = subjectTerms(query);
  const room = requestedRoom(query);
  const period = requestedPeriod(query);
  let teacher = await resolveStaffFromQuery(query, context);

  // RBAC: Teachers can only view their own schedule, not other teachers'
  if (context.role === "TEACHER" && teacher) {
    const selfStaff = await resolveStaffFromContext(context);
    if (selfStaff && teacher.id !== selfStaff.id) {
      return {
        message: `You don't have permission to view another teacher's schedule. You can view your own schedule, class timetables, or room availability.`,
        intent: "TIMETABLE_QUERY",
        actions: authorizedRoute("timetable", context),
      };
    }
  }

  if (!teacher && !grade && !room && context.role === "TEACHER" && (isMyScheduleQuery(query) || !/\b(all|whole|school|master|every)\b/i.test(query))) {
    teacher = await resolveStaffFromContext(context);
  }

  const where = {
    ...(grade ? { grade } : {}),
    ...(teacher ? { teacherId: teacher.id } : {}),
    ...(day ? { day } : {}),
    ...(period ? { period } : {}),
    ...(room ? { room: { roomNumber: { contains: room, mode: "insensitive" as const } } } : {}),
    ...(subjects.length ? { subject: { AND: subjects.map((term) => ({ name: { contains: term, mode: "insensitive" as const } })) } } : {}),
  };

  const slots = await prisma.timetableSlot.findMany({
    where,
    include: { subject: true, teacher: true, room: true },
    orderBy: [{ day: "asc" }, { period: "asc" }, { grade: "asc" }],
  });

  const filterDesc = formatFilterDescription({ grade, teacher: teacher?.name, day, room, period });

  if (!slots.length) {
    // Room-specific "not occupied" answer
    if (room) {
      return {
        message: `${room} is **not occupied**${day ? ` on ${day}` : ""}${period ? ` during Period ${period}` : ""} according to the master schedule. It is available for use.`,
        intent: "TIMETABLE_QUERY",
        sources: [{ type: "database", label: "Master timetable" }],
        actions: authorizedRoute("timetable", context),
        data: { kind: "timetable", rows: [], stats: [{ label: "Room", value: room }, { label: "Status", value: "Available" }] },
      };
    }
    const [grades, teachers] = await Promise.all([knownGrades(), knownTeachers()]);
    const hints: string[] = [];
    if (teacher) hints.push(`Faculty with scheduled periods: ${teachers.filter((item) => item.name !== teacher?.name).slice(0, 4).map((item) => item.name).join(", ") || "none listed"}`);
    if (grade) hints.push(`Classes with timetables: ${grades.filter((item) => item !== grade).join(", ") || "none listed"}`);
    if (!teacher && !grade) hints.push(`Try asking for ${grades.slice(0, 3).map((item) => `"${item} timetable"`).join(", ")} or a teacher such as "${teachers[0]?.name || "Prof. Alan Turing"}".`);
    return {
      message: `I couldn't find any timetable slots${filterDesc} in the master schedule.${hints.length ? ` ${hints.join(" ")}` : ""}`,
      intent: "TIMETABLE_QUERY",
      actions: authorizedRoute("timetable", context),
    };
  }

  // Room-specific occupancy answer: "is Room101 occupied at monday 10am? by whom?"
  if (room) {
    const occupants = slots.map((slot) => ({
      Day: slot.day,
      Period: slot.period,
      Class: slot.grade,
      Subject: slot.subject.name,
      Teacher: slot.teacher.name,
      Room: slot.room.roomNumber,
    }));
    const whoList = [...new Set(slots.map((s) => s.teacher.name))].join(", ");
    const slotSummary = slots.map((s) => `${s.day} Period ${s.period} — ${s.subject.name} (${s.grade}) by ${s.teacher.name}`).join("; ");
    return {
      message: `Yes, **${room} is occupied**${filterDesc}. ${slots.length === 1 ? `It is used by **${whoList}** for ${slots[0].subject.name} (${slots[0].grade}).` : `It is used in ${slots.length} slot${slots.length > 1 ? "s" : ""} by: **${whoList}**.`}`,
      intent: "TIMETABLE_QUERY",
      sources: slots.map((slot) => ({ type: "database", label: `${slot.grade}: ${slot.subject.name} · ${slot.day} P${slot.period}`, id: slot.id })),
      actions: authorizedRoute("timetable", context),
      data: {
        kind: "timetable",
        rows: occupants,
        stats: [{ label: "Room", value: room }, { label: "Status", value: "Occupied" }, { label: "Slots", value: String(slots.length) }],
      },
    };
  }

  const label = teacher?.name || grade || "master";
  return {
    message: `I found ${slots.length} scheduled period${slots.length === 1 ? "" : "s"}${filterDesc || ` in the ${label} timetable`}.`,
    intent: "TIMETABLE_QUERY",
    sources: slots.map((slot) => ({ type: "database", label: `${slot.grade}: ${slot.subject.name} · ${slot.day} P${slot.period}`, id: slot.id })),
    actions: authorizedRoute("timetable", context),
    data: {
      kind: "timetable",
      rows: slots.map((slot) => ({ Day: slot.day, Period: slot.period, Class: slot.grade, Subject: slot.subject.name, Teacher: slot.teacher.name, Room: slot.room.roomNumber })),
      stats: [{ label: "Periods", value: String(slots.length) }, { label: "Scope", value: teacher?.name || grade || "All classes" }],
    },
  };
}

async function staff(query: string, context: CopilotContext): Promise<AssistantResponse> {
  // ──── RBAC: Teachers can only view their own profile ────
  if (context.role === "TEACHER") {
    const selfStaff = await resolveStaffFromContext(context);
    const terms = nameTerms(query, ["staff", "faculty", "teacher", "teachers", "professor", "department", "list", "show", "all"]);

    // If they're asking about a specific teacher by name, check if it's themselves
    if (terms.length) {
      const isAboutSelf = selfStaff && terms.every((term) => selfStaff.name.toLowerCase().includes(term.toLowerCase()));
      if (!isAboutSelf) {
        return {
          message: `You don't have permission to access other faculty members' details. As a teacher, you can only view your own profile. Try asking "my profile" or "my details".`,
          intent: "STAFF_QUERY",
        };
      }
    }

    // "list all teachers", "show all staff" → blocked for teachers
    if (!terms.length && !(/\b(my|mine|me|own)\b/i.test(query))) {
      return {
        message: `Faculty directory access is restricted to administrators. You can ask about your own profile by saying "my profile" or "my details".`,
        intent: "STAFF_QUERY",
      };
    }

    // Show only their own profile
    if (selfStaff) {
      const fullStaff = await prisma.staff.findUnique({
        where: { id: selfStaff.id },
        include: { _count: { select: { timetableSlots: true } } },
      });
      if (fullStaff) {
        return {
          message: `Here is your faculty profile, ${fullStaff.name}.`,
          intent: "STAFF_QUERY",
          sources: [{ type: "database", label: `Faculty: ${fullStaff.name}`, id: fullStaff.id }],
          data: {
            kind: "staff",
            rows: [{ Name: fullStaff.name, Department: fullStaff.department, Email: fullStaff.email, Periods: fullStaff._count.timetableSlots }],
            stats: [{ label: "Name", value: fullStaff.name }, { label: "Department", value: fullStaff.department }],
          },
        };
      }
    }
    return { message: "I couldn't find your faculty profile. Please contact an administrator.", intent: "STAFF_QUERY" };
  }

  // ──── ADMIN: Full access to all staff ────
  const terms = nameTerms(query, ["staff", "faculty", "teacher", "teachers", "professor", "department", "list", "show", "all"]);
  const department = query.match(/\b(?:department|dept)\s+(?:of\s+)?([a-z][a-z\s&]{2,40})/i)?.[1]?.trim();

  const staffMembers = await prisma.staff.findMany({
    where: {
      ...(department ? { department: { contains: department, mode: "insensitive" as const } } : {}),
      ...(terms.length ? { AND: terms.map((term) => ({ OR: [{ name: { contains: term, mode: "insensitive" as const } }, { department: { contains: term, mode: "insensitive" as const } }] })) } : {}),
    },
    include: { _count: { select: { timetableSlots: true } } },
    take: 15,
    orderBy: { name: "asc" },
  });

  if (!staffMembers.length) {
    const allStaff = await knownTeachers();
    return {
      message: `I couldn't find a matching faculty record.${allStaff.length ? ` Available faculty: ${allStaff.map((item) => item.name).join(", ")}.` : ""}`,
      intent: "STAFF_QUERY",
      actions: authorizedRoute("staff", context),
    };
  }

  if (staffMembers.length === 1) {
    if (/\bteach(es|ing)?\b/i.test(query)) return timetable(`timetable ${staffMembers[0].name}`, context);
    return buildStaffProfile(staffMembers[0].id, context);
  }

  return {
    message: staffMembers.length === 1
      ? `${staffMembers[0].name} is in ${staffMembers[0].department} with ${staffMembers[0]._count.timetableSlots} scheduled period${staffMembers[0]._count.timetableSlots === 1 ? "" : "s"}.`
      : `I found ${staffMembers.length} faculty records matching that request.`,
    intent: "STAFF_QUERY",
    sources: staffMembers.map((member) => ({ type: "database", label: `Faculty: ${member.name}`, id: member.id })),
    actions: authorizedRoute("staff", context),
    data: {
      kind: "staff",
      rows: staffMembers.map((member) => ({ Name: member.name, Department: member.department, Email: member.email, Periods: member._count.timetableSlots })),
      stats: [{ label: "Faculty", value: String(staffMembers.length) }],
    },
  };
}

function navigation(query: string, context: CopilotContext): AssistantResponse {
  const q = query.toLowerCase();

  if (/clash|conflict|double/.test(q)) {
    const guide = NAV_HELP.clash;
    return {
      message: `To see timetable clashes:\n• ${guide.steps.join("\n• ")}`,
      intent: "NAVIGATION_REQUEST",
      actions: authorizedRoute(guide.routeKey, context),
      data: { kind: "navigation", rows: guide.steps.map((step, i) => ({ Step: i + 1, Instruction: step })), preview: { section: guide.section, hint: "Sidebar → Timetable" } },
    };
  }
  if (/attendance|absent|present/.test(q) && /how|where|see|take/.test(q)) {
    const guide = NAV_HELP.attendance;
    return {
      message: `To take or view attendance:\n• ${guide.steps.join("\n• ")}`,
      intent: "NAVIGATION_REQUEST",
      actions: [...authorizedRoute(guide.routeKey, context), ...authorizedRoute("attendance-take", context)],
      data: { kind: "navigation", rows: guide.steps.map((step, i) => ({ Step: i + 1, Instruction: step })), preview: { section: guide.section, hint: "Sidebar → Attendance" } },
    };
  }
  if (/fee|payment/.test(q) && /how|where|see|manage/.test(q)) {
    const guide = NAV_HELP.fees;
    return {
      message: `To manage student fees:\n• ${guide.steps.join("\n• ")}`,
      intent: "NAVIGATION_REQUEST",
      actions: authorizedRoute(guide.routeKey, context),
      data: { kind: "navigation", rows: guide.steps.map((step, i) => ({ Step: i + 1, Instruction: step })), preview: { section: guide.section, hint: "Students → Manage Fees" } },
    };
  }
  if (/parent|message|communicat/.test(q) && /how|where|see|send/.test(q)) {
    const guide = NAV_HELP.parent;
    return {
      message: `To contact parents:\n• ${guide.steps.join("\n• ")}`,
      intent: "NAVIGATION_REQUEST",
      actions: authorizedRoute(guide.routeKey, context),
      data: { kind: "navigation", rows: guide.steps.map((step, i) => ({ Step: i + 1, Instruction: step })), preview: { section: guide.section, hint: "Sidebar → Parent Connect" } },
    };
  }

  const key = q.includes("attendance") ? "attendance" : q.includes("student") ? "students" : q.includes("document") ? "documents" : q.includes("timetable") || q.includes("schedule") ? "timetable" : q.includes("parent") || q.includes("communicat") ? "communications" : q.includes("staff") ? "staff" : q.includes("role") || q.includes("audit") ? "roles" : "";
  const route = key ? ROUTES[key] : undefined;
  const actions = key ? authorizedRoute(key, context) : [];
  if (actions.length && route) {
    return {
      message: `Open **${route.section}** from the sidebar — ${route.hint}`,
      intent: "NAVIGATION_REQUEST",
      actions,
      data: { kind: "navigation", rows: [{ Section: route.section, Path: route.route, Description: route.hint }] },
    };
  }
  return { message: "I couldn't find an authorized GURUKUL destination for that request. Try: attendance, students, timetable, documents, or parent connect.", intent: "NAVIGATION_REQUEST" };
}

function capabilities(context: CopilotContext): AssistantResponse {
  const tasks = [
    "Find a student profile, parent contact, or count students in a class",
    "Who is absent today / on a date — and how many absent in a class",
    "Fee details and payment history for a student",
    "Class timetable, teacher schedule, room availability, or conflicts",
    "Faculty profiles (admin) or your own profile (teacher)",
    "Search approved school policies and documents",
    "How to navigate — e.g. “how to see timetable clash?”",
    ...(context.role === "ADMIN" ? ["School-wide fee reports and statistics"] : ["Fees for students in your assigned classes"]),
    "Open an authorized GURUKUL workspace",
  ];
  return {
    message: `I can help with these verified GURUKUL tasks:\n• ${tasks.join("\n• ")}\n\nTry: “Who is Prof. Alan Turing?”, “How many absent in Grade 10A today?”, or “Is Room 101 free on Monday period 2?”`,
    intent: "AMBIGUOUS_QUERY",
  };
}

function friendlyGreeting(context: CopilotContext): AssistantResponse {
  return {
    message: `Hi ${context.name.split(" ")[0]}! I’m here to help with GURUKUL. You can ask me about attendance, students, timetables, faculty, documents${context.role === "ADMIN" ? ", or fees" : ""}. What would you like to check?`,
    intent: "AMBIGUOUS_QUERY",
  };
}

function friendlyOutOfScope(): AssistantResponse {
  return {
    message: "I’m focused on verified GURUKUL school operations. I can help you check attendance, find student records, review timetables and faculty schedules, detect timetable conflicts, search school policies, or open the right workspace.",
    intent: "OUT_OF_SCOPE",
  };
}

export async function answerCopilot(
  query: string,
  context: CopilotContext,
  history: CopilotHistoryItem[] = [],
): Promise<AssistantResponse> {
  const enriched = enrichQueryWithHistory(query.trim().slice(0, 800), history);
  const normalized = enriched.trim().slice(0, 800);
  if (!normalized) return capabilities(context);
  if (/^(?:h+[iey]+|hello+|hey+|good\s+(?:morning|afternoon|evening)|thanks?|thank\s+you|how\s+are\s+you)[!,.?\s]*$/i.test(normalized)) return friendlyGreeting(context);
  const intent = classify(normalized);
  try {
    if (intent === "STUDENT_QUERY") return await studentSearch(normalized, context);
    if (intent === "STATS_QUERY") return await stats(normalized, context);
    if (intent === "ATTENDANCE_QUERY") return await attendance(normalized, context);
    if (intent === "FEE_QUERY") return await fees(normalized, context);
    if (intent === "DOCUMENT_QUERY") return await documents(normalized, context);
    if (intent === "TIMETABLE_QUERY") return await timetable(normalized, context);
    if (intent === "STAFF_QUERY") return await staff(normalized, context);
    if (intent === "NAVIGATION_REQUEST") return navigation(normalized, context);
    if (intent === "ACTION_REQUEST") return { message: "Attendance changes require review before they are written. Open Attendance to verify the class, date, and roll number, then confirm the change.", intent, requiresConfirmation: true, actions: authorizedRoute("attendance", context) };
    if (intent === "AMBIGUOUS_QUERY") return capabilities(context);
    return friendlyOutOfScope();
  } catch (error) {
    console.error("Copilot retrieval failed", error);
    return { message: "I couldn't retrieve that GURUKUL information right now. Please try again.", intent };
  }
}
