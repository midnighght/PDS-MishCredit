import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/appStore';
import { useConfirm } from './Confirm';

export default function Nav() {
  const { rut, setRut, seleccion, setSeleccion, adminKey } = useApp();
  const nav = useNavigate();
  const confirm = useConfirm();

  async function logout() {
    const ok = await confirm({ title: 'Cerrar sesión', description: 'Se borrará la selección local. ¿Deseas continuar?' });
    if (!ok) return;
    setRut('');
    setSeleccion(null);
    localStorage.removeItem('carreras');
    nav('/');
  }
  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'}`
      }
    >
      {label}
    </NavLink>
  );
  return (
    <header className="bg-white border-b">
      <nav className="container flex items-center justify-between py-3">
        <Link to="/" className="font-semibold">Planificador UCN</Link>
        <div className="flex items-center gap-3">
          {rut && seleccion && (
            <div className="text-xs text-gray-600 hidden sm:block">
              {rut} · {seleccion.codCarrera}-{seleccion.catalogo}
            </div>
          )}
          {!rut && link('/', 'Login')}
          {rut && link('/plan', 'Generar')}
          {rut && link('/proyecciones', 'Mis Proyecciones')}
          {rut && link('/demanda', 'Demanda')}
          {rut && (
            <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={logout}>Salir</button>
          )}
        </div>
      </nav>
    </header>
  );
}
