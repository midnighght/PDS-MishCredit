 

// API Configuration
export const API_BASE_URL = 'http://localhost:5000/api';  // Changed from 6000 to 5000

// Route Constants
export const ROUTES = Object.freeze({
  LOGIN: '/login',
  REGISTER: '/register', 
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const);

// API Endpoint Routes
export const API_REQUEST_ROUTE = Object.freeze({
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',
} as const);

// Resource URLs
export const RESOURCES = Object.freeze({
  LOGO: '.public/LogoExample.jpeg',
  VITE_LOGO: '/vite.svg',
} as const);

// HTTP Status Codes
export const HTTP_STATUS = Object.freeze({
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const);

// Storage Keys
export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
} as const);

// Validation Constants
export const VALIDATION = Object.freeze({
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const);

// Application Configuration
export const APP_CONFIG = Object.freeze({
  NAME: 'mishcredit',
  VERSION: '1.0.0',
  AUTHOR: 'Ferran Rojas',
  GITHUB: 'https://github.com/Reistoge',
} as const);

// Animation Constants
export const ANIMATION = Object.freeze({
  ROTATION_DEGREES: 360,
  TRANSITION_DURATION: '1s',
  TRANSITION_EASING: 'ease-in-out',
} as const);

// Type exports for better TypeScript support
export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ApiEndpoint = typeof API_REQUEST_ROUTE[keyof typeof API_REQUEST_ROUTE];