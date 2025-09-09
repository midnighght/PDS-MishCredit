export interface UserData {
  rut: string;
  email: string;
  carreras: Career[];
}

export interface Career {
  codigo: string;
  nombre: string;
  catalogo: string;
}

// Updated Course interface to match API response
export interface Course {
  codigo: string;
  asignatura: string; // Changed from 'nombre' to 'asignatura'
  creditos: number;
  nivel: number; // Changed from 'semestre' to 'nivel'
  prereq: string; // Prerequisites as comma-separated string
}

// Updated StudentProgress interface to match API response
export interface StudentProgress {
  nrc: string;
  period: string;
  student: string;
  course: string; // Course code
  excluded: boolean;
  inscriptionType: string;
  status: string; // "APROBADO", "REPROBADO", etc.
}

export interface LoginResponse {
  rut: string;
  carreras: Career[];
  error?: string;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

// Academic Data Types
export interface CareerAcademicData {
  career: Career;
  malla: Course[];
  avance: StudentProgress[];
  careerCode: string;
  catalog: string;
}

export type AcademicDataType = {
  academicData: CareerAcademicData[];
  failedCareers: Array<{
    career: Career;
    error: any;
  }>;
};

// Auth Actions
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse & { email: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Academic Statistics (calculated client-side)
export interface AcademicStats {
  totalCourses: number;
  approvedCourses: number;
  failedCourses: number;
  completionPercentage: number;
  totalCredits: number;
  approvedCredits: number;
}