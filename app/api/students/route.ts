import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("[api/students] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // Accept both `name` (GET contract) and `studentName` (OCR/legacy contract)
    const name = (body.name ?? body.studentName) as string | undefined;
    const { dob, grade, parentName, contact, address, medicalNotes, previousSchool } =
      body as Record<string, string | undefined>;

    // Validate required fields -> 400 with details instead of an opaque 500
    const missing = Object.entries({ name, dob, grade, parentName, contact })
      .filter(([, v]) => typeof v !== "string" || v.trim().length === 0)
      .map(([k]) => k);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", details: missing },
        { status: 400 }
      );
    }

    // Auto-assign the next roll number within the grade (schema default of 1
    // would otherwise give every student the same roll number).
    const student = await prisma.$transaction(async (tx) => {
      const last = await tx.student.findFirst({
        where: { grade: grade as string },
        orderBy: { rollNumber: "desc" },
        select: { rollNumber: true },
      });
      return tx.student.create({
        data: {
          name: (name as string).trim(),
          rollNumber: (last?.rollNumber ?? 0) + 1,
          dob: dob as string,
          grade: grade as string,
          parentName: parentName as string,
          contact: contact as string,
          address: address ?? null,
          medicalNotes: medicalNotes ?? null,
          previousSchool: previousSchool ?? null,
          status: "ADMITTED",
        },
      });
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("[api/students] POST failed:", error);
    return NextResponse.json({ error: "Failed to create student record" }, { status: 500 });
  }
}
