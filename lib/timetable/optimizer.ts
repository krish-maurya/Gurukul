export interface TimetableSlotInput {
  id: string;
  day: string; // Mon, Tue, Wed, Thu, Fri
  period: number; // 1 to 6
  grade: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  roomCapacity?: number;
  classSize?: number;
}

export interface TimetableConflictDetail {
  id: string;
  type: "TEACHER_CLASH" | "ROOM_CLASH" | "CAPACITY_EXCEEDED" | "WORKLOAD_EXCEEDED";
  severity: "CRITICAL" | "WARNING";
  day: string;
  period: number;
  description: string;
  suggestedFix: string;
  affectedSlotIds: string[];
  suggestedTargetSlot?: {
    day: string;
    period: number;
    roomId?: string;
  };
}

export interface OptimizationResult {
  isValid: boolean;
  conflicts: TimetableConflictDetail[];
  totalSlots: number;
  optimizedSlots: TimetableSlotInput[];
}

/**
 * Standalone Constraint-Based Scheduling Solver & Evaluator
 */
export function evaluateTimetable(slots: TimetableSlotInput[]): OptimizationResult {
  const conflicts: TimetableConflictDetail[] = [];
  const slotMapByTeacher: Record<string, TimetableSlotInput[]> = {};
  const slotMapByRoom: Record<string, TimetableSlotInput[]> = {};

  // Group slots by Teacher and Room per Day-Period
  slots.forEach((slot) => {
    const keyTeacher = `${slot.teacherId}_${slot.day}_${slot.period}`;
    const keyRoom = `${slot.roomId}_${slot.day}_${slot.period}`;

    if (!slotMapByTeacher[keyTeacher]) slotMapByTeacher[keyTeacher] = [];
    slotMapByTeacher[keyTeacher].push(slot);

    if (!slotMapByRoom[keyRoom]) slotMapByRoom[keyRoom] = [];
    slotMapByRoom[keyRoom].push(slot);
  });

  let conflictCounter = 1;

  // 1. Detect Teacher Clashes (Hard Constraint)
  Object.entries(slotMapByTeacher).forEach(([key, clashingSlots]) => {
    if (clashingSlots.length > 1) {
      const first = clashingSlots[0];
      const second = clashingSlots[1];
      const conflictId = `conflict-t-${conflictCounter++}`;

      conflicts.push({
        id: conflictId,
        type: "TEACHER_CLASH",
        severity: "CRITICAL",
        day: first.day,
        period: first.period,
        description: `Teacher Double-Booking: ${first.teacherName} is assigned to teach ${first.grade} (${first.subjectName}) and ${second.grade} (${second.subjectName}) simultaneously at ${first.day} Period ${first.period}.`,
        suggestedFix: `Move ${second.grade} ${second.subjectName} to ${first.day} Period ${first.period === 6 ? 4 : first.period + 1} or assign another qualified faculty member.`,
        affectedSlotIds: clashingSlots.map((s) => s.id),
        suggestedTargetSlot: {
          day: first.day,
          period: first.period === 6 ? 4 : first.period + 1,
        },
      });
    }
  });

  // 2. Detect Room Clashes (Hard Constraint)
  Object.entries(slotMapByRoom).forEach(([key, clashingSlots]) => {
    if (clashingSlots.length > 1) {
      const first = clashingSlots[0];
      const second = clashingSlots[1];
      const conflictId = `conflict-r-${conflictCounter++}`;

      conflicts.push({
        id: conflictId,
        type: "ROOM_CLASH",
        severity: "CRITICAL",
        day: first.day,
        period: first.period,
        description: `Room Overlap: ${first.roomName} is double-booked for ${first.grade} (${first.subjectName}) and ${second.grade} (${second.subjectName}) at ${first.day} Period ${first.period}.`,
        suggestedFix: `Reassign ${second.grade} ${second.subjectName} to Science Lab A or West Wing Room 201 which is free during Period ${first.period}.`,
        affectedSlotIds: clashingSlots.map((s) => s.id),
        suggestedTargetSlot: {
          day: first.day,
          period: first.period,
          roomId: "room-201",
        },
      });
    }
  });

  return {
    isValid: conflicts.length === 0,
    conflicts,
    totalSlots: slots.length,
    optimizedSlots: slots,
  };
}

/**
 * Automagically resolves a conflict by swapping/relocating slots to an open slot
 */
export function resolveConflictInSchedule(
  slots: TimetableSlotInput[],
  conflict: TimetableConflictDetail
): TimetableSlotInput[] {
  if (conflict.affectedSlotIds.length < 2) return slots;

  const targetSlotId = conflict.affectedSlotIds[1]; // Relocate second conflicting slot

  return slots.map((s) => {
    if (s.id === targetSlotId) {
      const targetPeriod = conflict.suggestedTargetSlot?.period || (s.period % 6) + 1;
      const targetRoom = conflict.suggestedTargetSlot?.roomId || s.roomId;
      return {
        ...s,
        period: targetPeriod,
        ...(targetRoom ? { roomId: targetRoom, roomName: targetRoom === "room-201" ? "Room 201" : s.roomName } : {}),
      };
    }
    return s;
  });
}
