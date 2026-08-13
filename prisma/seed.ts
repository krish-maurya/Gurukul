import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GURUKUL Database (Part 2)...");

  // Clean existing data
  await prisma.attendanceEntry.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableConflict.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Eleanor Vance",
      email: "principal@gurukul.edu",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: "Prof. Alan Turing",
      email: "turing@gurukul.edu",
      role: "STAFF",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Staff
  const turing = await prisma.staff.create({
    data: {
      id: "staff-turing",
      name: "Prof. Alan Turing",
      email: "turing@gurukul.edu",
      department: "Computer Science & Mathematics",
      maxPeriodsPerDay: 4,
    },
  });

  const curie = await prisma.staff.create({
    data: {
      id: "staff-curie",
      name: "Dr. Marie Curie",
      email: "curie@gurukul.edu",
      department: "Physics & Chemistry",
      maxPeriodsPerDay: 4,
    },
  });

  const newton = await prisma.staff.create({
    data: {
      id: "staff-newton",
      name: "Sir Isaac Newton",
      email: "newton@gurukul.edu",
      department: "Mathematics",
      maxPeriodsPerDay: 3,
    },
  });

  const feynman = await prisma.staff.create({
    data: {
      id: "staff-feynman",
      name: "Prof. Richard Feynman",
      email: "feynman@gurukul.edu",
      department: "Physics",
      maxPeriodsPerDay: 4,
    },
  });

  // Rooms
  const r101 = await prisma.room.create({
    data: {
      id: "room-101",
      roomNumber: "Room 101",
      building: "Main Academic Block",
      capacity: 40,
      type: "LECTURE",
    },
  });

  const r102 = await prisma.room.create({
    data: {
      id: "room-102",
      roomNumber: "Room 102",
      building: "Main Academic Block",
      capacity: 35,
      type: "LECTURE",
    },
  });

  const labA = await prisma.room.create({
    data: {
      id: "room-laba",
      roomNumber: "Science Lab A",
      building: "Science Wing",
      capacity: 30,
      type: "LAB",
    },
  });

  const r201 = await prisma.room.create({
    data: {
      id: "room-201",
      roomNumber: "Room 201",
      building: "West Wing",
      capacity: 45,
      type: "LECTURE",
    },
  });

  // Subjects
  const math = await prisma.subject.create({
    data: {
      id: "subj-math",
      code: "MATH101",
      name: "Advanced Mathematics",
      weeklyPeriods: 5,
    },
  });

  const phys = await prisma.subject.create({
    data: {
      id: "subj-phys",
      code: "PHYS201",
      name: "Quantum Physics",
      weeklyPeriods: 4,
    },
  });

  const cs = await prisma.subject.create({
    data: {
      id: "subj-cs",
      code: "CS101",
      name: "Algorithms & Logic",
      weeklyPeriods: 4,
    },
  });

  const chem = await prisma.subject.create({
    data: {
      id: "subj-chem",
      code: "CHEM201",
      name: "Organic Chemistry",
      weeklyPeriods: 4,
    },
  });

  // Generate 40 Students for Grade 10A with Roll Numbers 1 to 40
  const firstNames = [
    "Liam", "Sophia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte",
    "William", "Amelia", "James", "Harper", "Benjamin", "Evelyn", "Lucas", "Mia",
    "Henry", "Ella", "Alexander", "Grace", "Mason", "Chloe", "Michael", "Victoria",
    "Ethan", "Riley", "Daniel", "Aria", "Jacob", "Lily", "Logan", "Aubrey",
    "Jackson", "Zoey", "Levi", "Penelope", "Sebastian", "Layla", "Mateo", "Camila"
  ];

  const lastNames = [
    "Sterling", "Chen", "Smith", "Johnson", "Brown", "Taylor", "Miller", "Davis",
    "Wilson", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
    "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker",
    "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill",
    "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell"
  ];

  const students10A = [];
  for (let i = 1; i <= 40; i++) {
    const fn = firstNames[i - 1];
    const ln = lastNames[i - 1];
    students10A.push({
      rollNumber: i,
      name: `${fn} ${ln}`,
      dob: `2009-${(i % 12 + 1).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}`,
      grade: "Grade 10A",
      parentName: `Parent of ${fn}`,
      contact: `+1 (555) ${100 + i}-${2000 + i}`,
      address: `${i * 10} Academic Way, District ${i}`,
      medicalNotes: i === 7 ? "Asthma - Inhaler required" : i === 19 ? "Severe Peanut Allergy" : "None",
      previousSchool: "Central Junior High",
      status: "ADMITTED",
    });
  }

  await prisma.student.createMany({ data: students10A });

  // Additional pending student
  await prisma.student.create({
    data: {
      rollNumber: 41,
      name: "Aarav Sharma",
      dob: "2008-11-05",
      grade: "Grade 11B",
      parentName: "Priya Sharma",
      contact: "+1 (555) 345-6789",
      address: "45 Lotus Parkway, Techville",
      medicalNotes: "Peanut allergy",
      previousSchool: "Valley Heights High",
      status: "PENDING",
    },
  });

  // Sample Document Records for OCR Review
  await prisma.documentRecord.create({
    data: {
      id: "doc-101",
      fileName: "Admission_Form_Aarav_Sharma.pdf",
      documentType: "Admission Application",
      status: "NEEDS_REVIEW",
      confidenceScore: 78.5,
      rawText: "GURUKUL HIGH SCHOOL ADMISSION FORM\nStudent Name: Aarav Sharma\nDate of Birth: 05/11/2008\nApplying Grade: Grade 11B\nParent/Guardian: Priya Sharma\nPhone: +1 555-345-6789\nMedical Notes: Peanut allergy\nPrevious Institution: Valley Heights High",
      extractedFields: JSON.stringify({
        studentName: { value: "Aarav Sharma", confidence: 96 },
        dob: { value: "2008-11-05", confidence: 92 },
        grade: { value: "Grade 11B", confidence: 89 },
        parentName: { value: "Priya Sharma", confidence: 85 },
        contact: { value: "+1 (555) 345-6789", confidence: 91 },
        address: { value: "45 Lotus Parkway, Techville", confidence: 64 },
        medicalNotes: { value: "Peanut allergy", confidence: 58 },
        previousSchool: { value: "Valley Heights High", confidence: 88 },
      }),
      fileUrl: "/samples/admission_aarav.png",
    },
  });

  // Initial Timetable Slots with Intentional Conflicts
  await prisma.timetableSlot.createMany({
    data: [
      {
        day: "Mon",
        period: 1,
        grade: "Grade 10A",
        subjectId: math.id,
        teacherId: turing.id,
        roomId: r101.id,
      },
      {
        day: "Mon",
        period: 1,
        grade: "Grade 11B",
        subjectId: cs.id,
        teacherId: turing.id, // Conflict!
        roomId: r102.id,
      },
      {
        day: "Mon",
        period: 2,
        grade: "Grade 10A",
        subjectId: phys.id,
        teacherId: curie.id,
        roomId: r101.id,
      },
      {
        day: "Mon",
        period: 2,
        grade: "Grade 12A",
        subjectId: chem.id,
        teacherId: feynman.id,
        roomId: r101.id, // Conflict!
      },
    ],
  });

  // Seed Historical Attendance Record to produce realistic Attendance Risk Flags (<75%)
  const g10AStudents = await prisma.student.findMany({ where: { grade: "Grade 10A" }, orderBy: { rollNumber: "asc" } });

  const pastAttendanceRecord = await prisma.attendanceRecord.create({
    data: {
      grade: "Grade 10A",
      section: "A",
      date: "2026-08-12",
      period: 1,
      takenByTeacherId: turing.id,
      status: "SUBMITTED",
    },
  });

  const attendanceEntries = g10AStudents.map((s) => ({
    attendanceRecordId: pastAttendanceRecord.id,
    studentId: s.id,
    rollNumber: s.rollNumber,
    // Mark Roll 7 (Mason Miller) & Roll 19 (Alexander Robinson) as ABSENT repeatedly to trigger risk flag
    status: (s.rollNumber === 7 || s.rollNumber === 19 || s.rollNumber === 24) ? "ABSENT" : "PRESENT",
  }));

  await prisma.attendanceEntry.createMany({ data: attendanceEntries });

  console.log("GURUKUL DB Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
