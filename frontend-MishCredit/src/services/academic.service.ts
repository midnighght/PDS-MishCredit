import type { Course, StudentProgress, Career, CareerAcademicData, AcademicDataType, AcademicStats } from '../types/auth.types';
import authService from './auth.service';

class AcademicService {
  /**
   * Get dashboard data for all student careers
   */
  async getDashboradData(rut: string, carreras: Career[]): Promise<AcademicDataType> {
    const academicData: CareerAcademicData[] = [];
    const failedCareers: Array<{ career: Career; error: any }> = [];

    // Process each career in parallel for better performance
    const careerPromises = carreras.map(async (career) => {
      try {
        const data = await authService.getCompleteAcademicData(
          rut,
          career.codigo,
          career.catalogo
        );
        
        return {
          career,
          ...data,
        } as CareerAcademicData;
      } catch (error) {
        console.error(`Failed to load data for career ${career.codigo}:`, error);
        failedCareers.push({ career, error });
        return null;
      }
    });

    const results = await Promise.all(careerPromises);
    
    // Filter out null results and add successful ones
    results.forEach(result => {
      if (result) {
        academicData.push(result);
      }
    });

    return {
      academicData,
      failedCareers,
    };
  }

  /**
   * Calculate academic statistics for a career
   */
  calculateAcademicStats(malla: Course[], avance: StudentProgress[]): AcademicStats {
    // Create a map of course codes to progress
    const progressMap = new Map<string, StudentProgress>();
    avance.forEach(progress => {
      progressMap.set(progress.course, progress);
    });

    let approvedCourses = 0;
    let failedCourses = 0;
    let totalCredits = 0;
    let approvedCredits = 0;

    // Calculate stats based on malla courses
    malla.forEach(course => {
      totalCredits += course.creditos;
      
      const progress = progressMap.get(course.codigo);
      if (progress) {
        if (progress.status === 'APROBADO') {
          approvedCourses++;
          approvedCredits += course.creditos;
        } else if (progress.status === 'REPROBADO') {
          failedCourses++;
        }
      }
    });

    const totalCourses = malla.length;
    const completionPercentage = totalCourses > 0 
      ? Math.round((approvedCourses / totalCourses) * 100) 
      : 0;

    return {
      totalCourses,
      approvedCourses,
      failedCourses,
      completionPercentage,
      totalCredits,
      approvedCredits,
    };
  }

  /**
   * Get courses by level/semester
   */
  getCoursesByLevel(malla: Course[]): Map<number, Course[]> {
    const coursesByLevel = new Map<number, Course[]>();
    
    malla.forEach(course => {
      const level = course.nivel;
      if (!coursesByLevel.has(level)) {
        coursesByLevel.set(level, []);
      }
      coursesByLevel.get(level)!.push(course);
    });

    return coursesByLevel;
  }

  /**
   * Get course status for a specific course
   */
  getCourseStatus(courseCode: string, avance: StudentProgress[]): string {
    const progress = avance.find(p => p.course === courseCode);
    return progress ? progress.status : 'PENDIENTE';
  }

  /**
   * Parse prerequisites string into array
   */
  parsePrerequisites(prereqString: string): string[] {
    if (!prereqString || prereqString.trim() === '') {
      return [];
    }
    return prereqString.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  /**
   * Check if a course can be taken based on prerequisites
   */
  canTakeCourse(course: Course, avance: StudentProgress[]): boolean {
    const prerequisites = this.parsePrerequisites(course.prereq);
    
    if (prerequisites.length === 0) {
      return true; // No prerequisites
    }

    // Check if all prerequisites are approved
    return prerequisites.every(prereq => {
      const progress = avance.find(p => p.course === prereq);
      return progress && progress.status === 'APROBADO';
    });
  }

  /**
   * Get available courses (prerequisites met but not yet taken)
   */
  getAvailableCourses(malla: Course[], avance: StudentProgress[]): Course[] {
    const takenCourses = new Set(avance.map(p => p.course));
    
    return malla.filter(course => {
      // Course not yet taken and prerequisites are met
      return !takenCourses.has(course.codigo) && this.canTakeCourse(course, avance);
    });
  }

  /**
   * Get courses currently in progress
   */
  getCoursesInProgress(avance: StudentProgress[]): StudentProgress[] {
    return avance.filter(progress => 
      progress.status !== 'APROBADO' && progress.status !== 'REPROBADO'
    );
  }
}

export default new AcademicService();