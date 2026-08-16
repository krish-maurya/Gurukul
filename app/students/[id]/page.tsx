import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function StudentDetailsPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({ where: { id: params.id } });
  if (!student) notFound();

  const fields = [
    ["Roll number", student.rollNumber], ["Grade", student.grade], ["Date of birth", student.dob],
    ["Parent / guardian", student.parentName], ["Contact", student.contact], ["Address", student.address || "—"],
    ["Medical notes", student.medicalNotes || "—"], ["Previous school", student.previousSchool || "—"],
  ];

  return <div className="max-w-3xl space-y-6">
    <div className="border-b border-gurukul-gray pb-5 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div><div><h1 className="text-xl font-bold text-gurukul-dark">{student.name}</h1><p className="text-xs text-slate-500">Student Information</p></div></div>
    <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle divide-y divide-gurukul-gray">{fields.map(([label, value]) => <div key={String(label)} className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-4 text-xs"><dt className="font-semibold text-slate-500">{label}</dt><dd className="sm:col-span-2 text-gurukul-dark">{String(value)}</dd></div>)}</div>
  </div>;
}
