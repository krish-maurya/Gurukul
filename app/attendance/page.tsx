"use client";

import React, { Suspense } from "react";
import { AttendancePanel } from "@/components/attendance/attendance-panel";

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="flex min-h-52 items-center justify-center text-xs text-neutral-400">Loading...</div>}>
      <AttendancePanel />
    </Suspense>
  );
}
