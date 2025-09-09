import { useState, useEffect } from 'react';
import { useAuthContext } from './contexts/auth.context';
import academicService from './services/academic.service';
import type { Career, CareerAcademicData, AcademicDataType } from './types/auth.types';

export default function Dashboard() {
  const { user, logout } = useAuthContext();
  const [academicData, setAcademicData] = useState<AcademicDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  useEffect(() => {
    if (user && user.carreras && user.carreras.length > 0) {
      loadAcademicData();
      setSelectedCareer(user.carreras[0]);
    }
  }, [user]);

  const loadAcademicData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await academicService.getDashboradData(user.rut, user.carreras);
      setAcademicData(data);
    } catch (error: any) {
      console.error('Failed to load academic data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCareerStats = (careerData: CareerAcademicData | undefined) => {
    if (!careerData) return null;
    
    return academicService.calculateAcademicStats(
      careerData.malla,
      careerData.avance,
    );
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your academic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <button 
            onClick={loadAcademicData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Portal MishCredit UCN </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola de nuevo !, {user?.email}!</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* User Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Información del estudiante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">RUT</p>
              <p className="text-lg text-gray-900">{user?.rut}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Academic Data Summary */}
        {academicData?.failedCareers && academicData.failedCareers.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-800 font-medium">Warning</h3>
            <p className="text-yellow-700 text-sm">
              Could not load data for {academicData.failedCareers.length} career(s). 
              This might be due to network issues or data availability.
            </p>
          </div>
        )}

        {/* Careers */}
        {user?.carreras && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Carreras</h2>
            
            {user.carreras.map((career) => {
              const careerData = academicData?.academicData?.find(
                data => data.career.codigo === career.codigo
              );
              const stats = getCareerStats(careerData);

              return (
                <div key={career.codigo} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{career.nombre}</h3>
                      <p className="text-gray-600">Codigo: {career.codigo} | Catalogo: {career.catalogo}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCareer(career)}
                      className={`px-4 py-2 rounded-md transition duration-200 ${
                        selectedCareer?.codigo === career.codigo
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {selectedCareer?.codigo === career.codigo ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                        <p className="text-sm text-gray-600">Cursos Totales</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{stats.approvedCourses}</p>
                        <p className="text-sm text-gray-600">Aprobados</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{stats.failedCourses}</p>
                        <p className="text-sm text-gray-600">Fallidos</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{stats.completionPercentage}%</p>
                        <p className="text-sm text-gray-600">Progreso</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{stats.approvedCredits}/{stats.totalCredits}</p>
                        <p className="text-sm text-gray-600">Creditos</p>
                      </div>
                    </div>
                  )}

                  {!careerData && !academicData?.failedCareers?.find(f => f.career.codigo === career.codigo) && (
                    <p className="text-gray-500 text-center py-4">Cargando datos de la carrera...</p>
                  )}

                  {academicData?.failedCareers?.find(f => f.career.codigo === career.codigo) && (
                    <p className="text-red-500 text-center py-4">Ha ocurrido un error cargando los datos de esta carrera.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}