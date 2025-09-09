import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/auth.context';
import { ROUTES, VALIDATION, TEST_USERS } from '../constants';

/**
 * Login component for user Authentication
 * Provides form for email/password input and handles login process
 */
export default function Login() {
  const { login, isAuthenticated, loading, error, clearError } =
    useAuthContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  /**
   * 
   * for some reason you have to do this in the html return
   */
  // if (isAuthenticated) { 
  //   return <Navigate to={ROUTES.DASHBOARD} replace />;
  // }

  /**
   * Clear errors when component mounts
   */
  useEffect(() => {
    clearError();
    // eslint-disable-next-line
  }, []);

  /**
   * Clear validation errors on input change
   */
  useEffect(() => {
    setValidationErrors({});
  }, [formData]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Validate form data before submission
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  /**
   * Fill form with test user data for development
   */
  const fillTestUser = (index: number) => {
    if (TEST_USERS[index]) {
      setFormData({
        email: TEST_USERS[index].email,
        password: TEST_USERS[index].password,
      });
    }
  };

  return (
    <>
      {(isAuthenticated) && <Navigate to={ROUTES.DASHBOARD} replace />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Mish Credit Portal
            </h1>
            <p className="text-sm text-gray-600">
              Inicio de Sesión
            </p>
          </div>

          {/* Login Form */}
          <form
            className="bg-white p-8 rounded-xl shadow-lg space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Global Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium  text-gray-700 mb-1"
              >
                Email 
              </label>
                <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 
                ${validationErrors.email ? 'border-red-300' : 'border-gray-300'} ${
                  loading ? 'bg-gray-100' : 'bg-white'
                } text-black`}
                placeholder="example@email.com"
                />
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 
                ${validationErrors.password ? 'border-red-300' : 'border-gray-300'} ${
                  loading ? 'bg-gray-100' : 'bg-white'
                } text-black `}
                placeholder="********"
              />
              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : (
                'Ingresar'
              )}
            </button>

            {/* Test Users section (Development Only) */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">
                Usuarios de prueba (Dev)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TEST_USERS.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillTestUser(index)}
                    disabled={loading}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200 disabled:opacity-50 text-black"
                  >
                    {user.email.split('@')[0]}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
