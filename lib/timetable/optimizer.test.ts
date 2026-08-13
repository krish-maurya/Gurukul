import { evaluateTimetable, resolveConflictInSchedule, TimetableSlotInput } from "./optimizer";

const syntheticDatasetWithConflicts: TimetableSlotInput[] = [
  // Intentional Teacher Clash: Prof. Alan Turing assigned twice at Mon Period 1
  {
    id: "slot-1",
    day: "Mon",
    period: 1,
    grade: "Grade 10A",
    subjectId: "subj-math",
    subjectName: "Advanced Mathematics",
    teacherId: "staff-turing",
    teacherName: "Prof. Alan Turing",
    roomId: "room-101",
    roomName: "Room 101",
  },
  {
    id: "slot-2",
    day: "Mon",
    period: 1,
    grade: "Grade 11B",
    subjectId: "subj-cs",
    subjectName: "Algorithms & Logic",
    teacherId: "staff-turing", // Clash!
    teacherName: "Prof. Alan Turing",
    roomId: "room-102",
    roomName: "Room 102",
  },

  // Intentional Room Clash: Room 101 double booked at Mon Period 2
  {
    id: "slot-3",
    day: "Mon",
    period: 2,
    grade: "Grade 10A",
    subjectId: "subj-phys",
    subjectName: "Quantum Physics",
    teacherId: "staff-curie",
    teacherName: "Dr. Marie Curie",
    roomId: "room-101",
    roomName: "Room 101",
  },
  {
    id: "slot-4",
    day: "Mon",
    period: 2,
    grade: "Grade 12A",
    subjectId: "subj-chem",
    subjectName: "Organic Chemistry",
    teacherId: "staff-feynman",
    teacherName: "Prof. Richard Feynman",
    roomId: "room-101", // Clash!
    roomName: "Room 101",
  },
];

function runTest() {
  console.log("=== Testing GURUKUL Timetable Optimization Engine ===");

  const initialEvaluation = evaluateTimetable(syntheticDatasetWithConflicts);

  console.log(`Initial Valid State: ${initialEvaluation.isValid}`);
  console.log(`Total Slots Evaluated: ${initialEvaluation.totalSlots}`);
  console.log(`Total Conflicts Detected: ${initialEvaluation.conflicts.length}`);

  initialEvaluation.conflicts.forEach((conflict, idx) => {
    console.log(`\nConflict #${idx + 1}: [${conflict.type}] (${conflict.severity})`);
    console.log(`Description: ${conflict.description}`);
    console.log(`Suggested Fix: ${conflict.suggestedFix}`);
  });

  if (initialEvaluation.conflicts.length > 0) {
    console.log("\n--- Applying Automated Conflict Resolution ---");
    let resolvedSlots = [...syntheticDatasetWithConflicts];

    initialEvaluation.conflicts.forEach((conflict) => {
      resolvedSlots = resolveConflictInSchedule(resolvedSlots, conflict);
    });

    const postEvaluation = evaluateTimetable(resolvedSlots);
    console.log(`Post-Resolution Valid State: ${postEvaluation.isValid}`);
    console.log(`Remaining Conflicts: ${postEvaluation.conflicts.length}`);

    if (postEvaluation.conflicts.length === 0) {
      console.log("\n✅ SUCCESS: All timetable conflicts resolved successfully!");
    } else {
      console.error("\n❌ FAILURE: Unresolved conflicts remain.");
    }
  }
}

runTest();
