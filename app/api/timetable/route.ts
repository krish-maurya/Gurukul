import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateTimetable } from "@/lib/timetable/optimizer";

export async function GET() {
  try {
    const slots = await prisma.timetableSlot.findMany({
      include: {
        subject: true,
        teacher: true,
        room: true,
      },
    });

    const formattedSlots = slots.map((s: {
      id: string;
      day: string;
      period: number;
      grade: string;
      subjectId: string;
      subject: { name: string };
      teacherId: string;
      teacher: { name: string };
      roomId: string;
      room: { roomNumber: string };
    }) => ({
      id: s.id,
      day: s.day,
      period: s.period,
      grade: s.grade,
      subjectId: s.subjectId,
      subjectName: s.subject.name,
      teacherId: s.teacherId,
      teacherName: s.teacher.name,
      roomId: s.roomId,
      roomName: s.room.roomNumber,
    }));

    const evaluation = evaluateTimetable(formattedSlots);

    return NextResponse.json({
      slots: formattedSlots,
      evaluation,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}
