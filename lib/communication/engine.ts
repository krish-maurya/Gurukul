import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** Ensure a student has a portal token; returns it. */
export async function ensurePortalToken(studentId: string): Promise<string> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { portalToken: true },
  });
  if (student?.portalToken) return student.portalToken;
  const token = randomBytes(20).toString("hex");
  await prisma.student.update({ where: { id: studentId }, data: { portalToken: token } });
  return token;
}

/**
 * Creates ABSENCE messages and marks them as SENT immediately when a teacher
 * submits attendance. Best-effort emails parents that a notification is waiting.
 * Skips students who already have an absence message for that date.
 */
export async function sendAbsenceMessages(
  absentees: { studentId: string }[],
  date: string,
  grade: string,
  staffId: string | null,
  staffName: string,
  origin: string
): Promise<number> {
  if (absentees.length === 0) return 0;
  const ids = absentees.map((a) => a.studentId);

  const [students, existing] = await Promise.all([
    prisma.student.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, parentName: true, parentEmail: true },
    }),
    prisma.parentMessage.findMany({
      where: { studentId: { in: ids }, type: "ABSENCE", title: { contains: date } },
      select: { studentId: true },
    }),
  ]);
  const alreadySent = new Set(existing.map((e) => e.studentId));

  const now = new Date();
  const toCreate = students
    .filter((s) => !alreadySent.has(s.id))
    .map((s) => ({
      studentId: s.id,
      type: "ABSENCE",
      title: `Absence on ${date}`,
      body:
        `Dear ${s.parentName},\n\n` +
        `${s.name} was marked absent in ${grade} today (${date}). ` +
        `If this was expected, no action is needed. Otherwise, please contact the class teacher.\n\n` +
        `Regular attendance makes a big difference — thank you for your support.\n\nGurukul School Office`,
      status: "SENT",
      sentAt: now,
      sentByName: staffName,
      sentByStaffId: staffId,
    }));

  if (toCreate.length === 0) return 0;
  await prisma.parentMessage.createMany({ data: toCreate });

  // Best-effort email each parent (fire-and-forget, don't block)
  const studentsToNotify = students.filter(
    (s) => !alreadySent.has(s.id) && s.parentEmail
  );
  for (const s of studentsToNotify) {
    try {
      const token = await ensurePortalToken(s.id);
      const portalUrl = `${origin}/p/${token}`;
      const { sendMail, buildNewMessageEmail } = await import("@/lib/mail");
      const mail = buildNewMessageEmail({
        parentName: s.parentName,
        studentName: s.name,
        title: `Absence on ${date}`,
        portalUrl,
      });
      await sendMail({ to: { email: s.parentEmail!, name: s.parentName }, ...mail });
    } catch (e) {
      console.warn(`[absence-notify] email to parent of ${s.name} failed:`, e);
    }
  }

  return toCreate.length;
}

/**
 * Creates FEE reminder drafts for overdue fee accounts that don't already
 * have a pending fee draft. Returns number of drafts created.
 */
export async function draftFeeReminders(): Promise<number> {
  const today = new Date().toLocaleDateString("en-CA");
  const overdue = await prisma.feeAccount.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
      dueDate: { lt: today },
    },
    include: { student: { select: { id: true, name: true, parentName: true } } },
    take: 200,
  });
  if (overdue.length === 0) return 0;

  const existingDrafts = await prisma.parentMessage.findMany({
    where: {
      studentId: { in: overdue.map((o) => o.studentId) },
      type: "FEE",
      status: "DRAFT",
    },
    select: { studentId: true },
  });
  const hasDraft = new Set(existingDrafts.map((d) => d.studentId));

  const toCreate = overdue
    .filter((o) => !hasDraft.has(o.studentId))
    .map((o) => {
      const remaining = Math.max(0, o.amountDue - o.amountPaid);
      return {
        studentId: o.studentId,
        type: "FEE",
        title: `Fee reminder — ₹${remaining.toLocaleString("en-IN")} due`,
        body:
          `Dear ${o.student.parentName},\n\n` +
          `A gentle reminder that ₹${remaining.toLocaleString("en-IN")} of ${o.student.name}'s school fee ` +
          `(academic year ${o.academicYear}) was due on ${o.dueDate}.\n\n` +
          `If you have already paid, please ignore this message. If something is making payment difficult, ` +
          `reach out to the school office — we are happy to help find a way.\n\nGurukul School Office`,
      };
    });

  if (toCreate.length === 0) return 0;
  await prisma.parentMessage.createMany({ data: toCreate });
  return toCreate.length;
}
