export type UserRole = "ADMIN" | "TEACHER";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export const MOCK_USERS: Record<UserRole, UserSession> = {
  ADMIN: {
    id: "user-admin-1",
    name: "Dr. Eleanor Vance",
    email: "admin@gurukul.edu",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    department: "Executive Principal & Admin",
  },
  TEACHER: {
    id: "user-teacher-1",
    name: "Prof. Alan Turing",
    email: "teacher@gurukul.edu",
    role: "TEACHER",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    department: "Computer Science & Mathematics",
  },
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === "ADMIN") return true;
  return userRole === requiredRole;
}
