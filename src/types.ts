export interface Student {
  id: string;
  name: string;
  usn: string;
  branch: string;
  semester: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalBranches: number;
}
