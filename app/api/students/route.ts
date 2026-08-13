import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const student = await prisma.student.create({
      data: {
        name: body.studentName,
        dob: body.dob,
        grade: body.grade,
        parentName: body.parentName,
        contact: body.contact,
        address: body.address,
        medicalNotes: body.medicalNotes,
        previousSchool: body.previousSchool,
        status: "ADMITTED",
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student record" }, { status: 500 });
  }
}
