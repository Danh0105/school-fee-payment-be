"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ParentAccessResponse, ParentStudentSummary } from "@/lib/types";

interface ParentSessionState {
  accessToken: string | null;
  student: ParentStudentSummary | null;
  hydrated: boolean;
  setSession: (session: ParentAccessResponse) => void;
  setStudent: (student: ParentStudentSummary) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

function toSafeStudent(student: ParentStudentSummary): ParentStudentSummary {
  return {
    id: student.id,
    schoolId: student.schoolId,
    school: student.school
      ? { id: student.school.id, name: student.school.name }
      : undefined,
    studentCode: student.studentCode,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    status: student.status,
  };
}

export const useParentSessionStore = create<ParentSessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      student: null,
      hydrated: false,
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          student: toSafeStudent(session.student),
        }),
      setStudent: (student) =>
        set((state) => ({
          student: toSafeStudent({
            ...student,
            school: student.school ?? state.student?.school,
          }),
        })),
      clearSession: () => set({ accessToken: null, student: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "school-fee-parent-auth",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ accessToken, student }) => ({ accessToken, student }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
