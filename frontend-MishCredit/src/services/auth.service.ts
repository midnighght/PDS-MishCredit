import { getApiUrl } from "../../constants";
import type { Course, LoginResponse, StudentProgress } from "../types/auth.types";

/**
 * Service class for handling authentication and academic data API calls 
 * Manages communication with backend proxy endpoints
 */
class AuthService {
  private apiUrls = getApiUrl();

  /**
   * Authenticate user with UCN login API via backend proxy
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const url = `${this.apiUrls.LOGIN}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if response contains error
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data as LoginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  /**
   * Get curriculum (malla) for a specific career via backend proxy
   */
  async getMalla(codigoCarrera: string, catalogo: string): Promise<Course[]> {
    try {
      // Format the query parameter as required: CODIGO-CATALOGO
      const queryParam = `${codigoCarrera}-${catalogo}`;
      const url = `${this.apiUrls.MALLA}?query=${encodeURIComponent(queryParam)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Malla fetch failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // API returns empty array for negative response
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Malla fetch error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch curriculum');
    }
  }

  /**
   * Get student academic progress via backend proxy
   */
  async getAvance(rut: string, codCarrera: string): Promise<StudentProgress[]> {
    try {
      const url = `${this.apiUrls.AVANCE}?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codCarrera)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Avance fetch failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if response contains error
      if (data.error) {
        throw new Error(data.error);
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Avance fetch error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch academic progress');
    }
  }

  /**
   * Get complete academic data for a student (malla + avance)
   */
  async getCompleteAcademicData(rut: string, codigoCarrera: string, catalogo: string) {
    try {
      // Fetch both malla and avance data in parallel for better performance
      const [malla, avance] = await Promise.all([
        this.getMalla(codigoCarrera, catalogo),
        this.getAvance(rut, codigoCarrera),
      ]);
      
      return {
        malla,
        avance,
        careerCode: codigoCarrera,
        catalog: catalogo
      };
    } catch (error) {
      console.error('Complete academic data fetch error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch complete academic data');
    }
  }

  /**
   * Logout user (clear local storage)
   */
  logout(): void {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('selected_career');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;