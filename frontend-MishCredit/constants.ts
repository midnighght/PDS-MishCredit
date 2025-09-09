// API Configuration - Using backend proxy
export const API_BASE_URL = {
  LOGIN: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/proxy/login`,
  MALLA: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/proxy/malla`,
  AVANCE: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/proxy/avance`
};

// Headers for different APIs
export const API_HEADERS = {
  HAWAII_AUTH: 'jf400fejof13f'
};

// Environment-based API URLs
export const getApiUrl = () => {
  return API_BASE_URL;
};

// Routes
export const ROUTES = Object.freeze({
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CAREER_DETAIL: '/career',
  HOME: '/',
} as const);

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const);

export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SELECTED_CAREER: 'selected_career',
} as const);

export const VALIDATION = Object.freeze({
  MIN_PASSWORD_LENGTH: 1,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const);

// Course/Academic Status
export const COURSE_STATUS = Object.freeze({
  APROBADO: 'APROBADO',
  REPROBADO: 'REPROBADO',
  CURSANDO: 'CURSANDO',
  PENDIENTE: 'PENDIENTE'
} as const);

export const INSCRIPTION_TYPES = Object.freeze({
  REGULAR: 'REGULAR',
  ESPECIAL: 'ESPECIAL'
} as const);

// Test users from API documentation
export const TEST_USERS = [
  { email: 'juan@example.com', password: '1234' },
  { email: 'maria@example.com', password: 'abcd' },
  { email: 'ximena@example.com', password: 'qwerty' }
] as const;