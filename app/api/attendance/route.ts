import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade") || "Grade 10A";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const period = parseInt(searchParams.get("period") || "1");

    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: { grade, date, period },
      include: {
        entries: true,
      },
    });

    return NextResponse.json({ record: existingRecord });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { grade, section, date, period, teacherId, entries } = body;

    // Single Atomic Transaction Write
    const result = await prisma.$transaction(async (tx) => {
      // Check if existing record exists for today to update instead of duplicating
      const existing = await tx.attendanceRecord.findFirst({
        where: { grade, date, period },
      });

      let recordId: string;

      if (existing) {
        // Delete old entries and re-write updated ones
        await tx.attendanceEntry.deleteMany({
          where: { attendanceRecordId: existing.id },
        });
        const updated = await tx.attendanceRecord.update({
          where: { id: existing.id },
          data: { status: "SUBMITTED" },
        });
        recordId = updated.id;
      } else {
        const created = await tx.attendanceRecord.create({
          data: {
            grade,
            section: section || "A",
            date,
            period: period || 1,
            takenByTeacherId: teacherId || "staff-turing",
            status: "SUBMITTED",
          },
        });
        recordId = created.id;
      }

      // Bulk write all entries (present & absent) in single transaction
      const entriesToCreate = entries.map((e: { studentId: string; rollNumber: number; status: string }) => ({
        attendanceRecordId: recordId,
        studentId: e.studentId,
        rollNumber: e.rollNumber,
        status: e.status,
      }));

      await tx.attendanceEntry.createMany({
        data: entriesToCreate,
      });

      return { recordId, totalEntries: entriesToCreate.length };
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Attendance transaction error:", error);
    return NextResponse.json({ error: "Single transaction attendance write failed" }, { status: 500 });
  }
}
