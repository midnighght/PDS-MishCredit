import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-gray-600 mt-2">Página no encontrada</p>
      <div className="mt-4">
        <Link to="/" className="btn">Volver al inicio</Link>
      </div>
    </div>
  );
}

