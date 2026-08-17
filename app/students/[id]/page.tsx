import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StudentFeeSection } from "@/components/students/student-fee-section";

export default async function StudentDetailsPage({ params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      feeAccount: {
        include: {
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
    },
  });
  if (!student) notFound();

  const fields = [
    ["Roll number", student.rollNumber],
    ["Grade", student.grade],
    ["Date of birth", student.dob],
    ["Parent / guardian", student.parentName],
    ["Contact", student.contact],
    ["Address", student.address || "—"],
    ["Medical notes", student.medicalNotes || "—"],
    ["Previous school", student.previousSchool || "—"],
    ["Status", student.status],
  ];

  const feeAccount = student.feeAccount
    ? {
        academicYear: student.feeAccount.academicYear,
        amountDue: student.feeAccount.amountDue,
        amountPaid: student.feeAccount.amountPaid,
        dueDate: student.feeAccount.dueDate,
        status: student.feeAccount.status,
        payments: student.feeAccount.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          paidAt: p.paidAt,
          method: p.method,
          receiptNo: p.receiptNo,
        })),
      }
    : null;

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div className="border-b border-gurukul-gray pb-5">
        <Link
          href="/students"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-gurukul-dark transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Registry</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gurukul-tech/10 text-gurukul-tech flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gurukul-dark">{student.name}</h1>
            <p className="text-xs text-slate-500">Student Information · {student.grade}</p>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gurukul-dark">Personal Details</h2>
        <div className="bg-white rounded-xl border border-gurukul-gray shadow-subtle divide-y divide-gurukul-gray">
          {fields.map(([label, value]) => (
            <div key={String(label)} className="grid grid-cols-1 sm:grid-cols-3 gap-1 px-5 py-4 text-xs">
              <dt className="font-semibold text-slate-500">{label}</dt>
              <dd className="sm:col-span-2 text-gurukul-dark">{String(value)}</dd>
            </div>
          ))}
        </div>
      </section>

      <StudentFeeSection account={feeAccount} />
    </div>
  );
}
