import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateTimetable, TimetableSlotInput } from "@/lib/timetable/optimizer";

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get("date");
    const today = new Date().toLocaleDateString("en-CA");
    const targetDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;

    const [slots, studentCounts] = await Promise.all([
      prisma.timetableSlot.findMany({
        include: {
          subject: true,
          teacher: true,
          room: true,
          proxyAssignments: {
            include: {
              proxyTeacher: true,
            },
          },
        },
      }),
      prisma.student.groupBy({
        by: ["grade"],
        where: { status: "ADMITTED" },
        _count: { _all: true },
      }),
    ]);

    if (!slots.length) {
      return NextResponse.json({
        slots: [],
        evaluation: {
          isValid: true,
          conflicts: [],
          totalSlots: 0,
          optimizedSlots: [],
        },
      });
    }

    const classSizeByGrade = new Map(
      studentCounts.map((entry) => [entry.grade, entry._count._all])
    );

    const formattedSlots: TimetableSlotInput[] = slots.map((s) => {
      const roomType: "LAB" | "LECTURE" = s.room.type === "LAB" ? "LAB" : "LECTURE";

      // Find matching proxy assignment for targetDate, or any assigned proxy for this slot
      const assignedForDate = s.proxyAssignments.find((p) => p.date === targetDate && p.status === "ASSIGNED");
      const pendingForDate = s.proxyAssignments.find((p) => p.date === targetDate && p.status === "PENDING");
      const latestAssigned = assignedForDate || (!dateParam ? s.proxyAssignments.find((p) => p.status === "ASSIGNED") : null);

      let displayedTeacherId = s.teacherId;
      let displayedTeacherName = s.teacher.name;
      let isProxy = false;
      let proxyStatus: string | null = null;

      if (latestAssigned && latestAssigned.proxyTeacher) {
        displayedTeacherId = latestAssigned.proxyTeacher.id;
        displayedTeacherName = latestAssigned.proxyTeacher.name;
        isProxy = true;
        proxyStatus = "ASSIGNED";
      } else if (pendingForDate) {
        proxyStatus = "PENDING";
      }

      return {
        id: s.id,
        day: s.day,
        period: s.period,
        grade: s.grade,
        subjectId: s.subjectId,
        subjectName: s.subject.name,
        teacherId: displayedTeacherId,
        teacherName: displayedTeacherName,
        originalTeacherId: s.teacherId,
        originalTeacherName: s.teacher.name,
        isProxy,
        proxyStatus,
        roomId: s.roomId,
        roomName: s.room.roomNumber,
        roomCapacity: s.room.capacity,
        roomType,
        classSize: classSizeByGrade.get(s.grade) ?? 0,
        requiresLab: s.subject.requiresLab,
      };
    });

    const evaluation = evaluateTimetable(formattedSlots);

    return NextResponse.json({
      slots: formattedSlots,
      evaluation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch timetable";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
